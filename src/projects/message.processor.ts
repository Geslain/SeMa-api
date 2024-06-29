import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';

import { Device } from '../devices/entities/device.entity';
import { Field } from '../fields/entities/field.entity';

import { DataRow } from './data-row/entities/data-row.entity';
import { DataRowField } from './data-row/data-row-field/entities/data-row-field.entity';

const SEND_MESSAGES = false;

@Processor('message')
export class MessageProcessor {
  constructor(private readonly httpService: HttpService) {}

  private readonly logger = new Logger(MessageProcessor.name);

  @Process('send-messages')
  async sendMessages(job: Job) {
    try {
      const device: Device = job.data.device;
      const dataRows: DataRow[] = job.data.dataRows;
      const fields: Field[] = job.data.fields;
      const template: string = job.data.template;
      const url = 'https://api.pushbullet.com/v2/texts';

      this.logger.log('Start sending...');

      for (const dataRow of dataRows) {
        const row = this.buildRow(fields, dataRow.fields);
        const message = this.buildMessage(row, template);

        if (!row.phone) {
          this.logger.warn(
            `Message cannot be send because of missing phone number for data row with id ${dataRow.id}`,
            row,
          );
          continue;
        }
        const data = {
          data: {
            addresses: [row.phone],
            message,
            target_device_iden: device.deviceId,
          },
        };
        const options = {
          method: 'post',
          contentType: 'application/json',
          headers: {
            'Access-Token': device.accessToken,
          },
          payload: JSON.stringify(data),
        };

        if (SEND_MESSAGES) {
          const {
            data: response,
            status,
            statusText,
          } = await firstValueFrom(
            this.httpService.post(url, data, options).pipe(
              catchError((error: AxiosError) => {
                this.logger.error(error.response.data);
                throw 'An error happened!';
              }),
            ),
          );
          this.logger.debug(response, status, statusText);
        }

        this.logger.log(
          `Send "${message}" to ${row.firstname} ${row.lastname}`,
        );
      }

      this.logger.log('Sending completed');
    } catch (e) {
      this.logger.error(e);
    }
  }

  /**
   * Build a simple and understandable object with key: value from data row field and field
   *
   * @Example
   *   const fields = [{id: 1, name: "firstname"}, {id: 2, name: "lastname"}]
   *   const dataRowField = [{fieldId: 1, value: "Eric"}, {fieldId: 2, value: "Moth"}]
   *
   *   buildRow(fields,dataRowField) // =>  { firstname: "Eric", lastname: "Moth"}
   *
   * @param fields
   * @param dataRowFields
   * @private
   */
  private buildRow(
    fields: Field[],
    dataRowFields: DataRowField[],
  ): Record<string, any> {
    return dataRowFields.reduce(
      (acc, curr) => ({
        [fields.find((f) => f.id === curr.fieldId).name]: curr.value,
        ...acc,
      }),
      {},
    );
  }

  /**
   * Replace all tags (keys) in template message to build a personal message for a row
   * @example
   *   const row = { firstname: "Eric", lastname: "Moth"}
   *   const template = "Hello {firstname} {lastname}"
   *
   *   buildMessage(row, template) // => "Hello Eric Moth"
   *
   * @param row
   * @param template
   * @private
   */
  private buildMessage(row: Record<string, any>, template: string) {
    let message = template;
    Object.keys(row).forEach((key) => {
      message = message.replace(new RegExp(`{${key}}`, 'g'), row[key]);
    });

    return message;
  }
}
