import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { ConfigService } from '@nestjs/config';
import { isArray } from 'class-validator';

import { Field } from '../fields/entities/field.entity';
import { Device } from '../devices/entities/device.entity';

import { DataRowField } from './data-row/data-row-field/entities/data-row-field.entity';
import { Project } from './entities/project.entity';

/* Legacy PushBullet Processor */
@Processor('push-bullet-message')
export class PushBulletMessageProcessor {
  constructor(
    private readonly httpService: HttpService,
    private readonly config: ConfigService,
  ) {}

  private readonly logger = new Logger(PushBulletMessageProcessor.name);

  @Process('send-messages')
  async sendMessages({ data }: Job) {
    try {
      const project: Project = data;

      const { device, dataRows, fields, messageTemplate: template } = project;
      const errors = [];

      if (!device) errors.push('Device is not defined');
      if (!template) errors.push('Template is not defined');
      if (!fields || !fields.length) errors.push('Fields is empty');
      if (!dataRows || !dataRows.length) errors.push('No data was found');

      if (errors.length) {
        this.logger.error({ message: 'Messages cannot be sent', errors });
        return;
      }

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

        const { options, data } = this.buildRequest(row, device, message);

        if (this.config.get('enableMessaging')) {
          const {
            data: response,
            status,
            statusText,
          } = await firstValueFrom(this.httpService.post(url, data, options));
          this.logger.log(response, status, statusText);
        }

        this.logger.log(`Send "${message}" to ${row.phone}`);
      }

      this.logger.log('Sending completed');
    } catch (e) {
      this.logger.error(e);
      this.logger.error('Stack:', e.stack);
      if (e instanceof AxiosError) {
        this.logger.error('Response:', e.response.data);
      }
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
    if (
      !isArray(dataRowFields) ||
      !isArray(fields) ||
      !dataRowFields.length ||
      !fields.length
    )
      return {};
    return dataRowFields.reduce((acc, curr) => {
      const field = fields.find((f) => f.id === curr.fieldId);
      if (!field)
        throw new Error(
          `Field with id ${curr.fieldId} cannot be found for data row ${curr.dataRowId}`,
        );
      return {
        [field.name]: curr.value,
        ...acc,
      };
    }, {});
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
    if (!message) return '';
    // If there is no variable detected then return the plain message
    if (
      !row ||
      !Object.keys(row).length ||
      !message.match(new RegExp(/\{\w*}/, 'g'))
    )
      return message;
    Object.keys(row).forEach((key) => {
      message = message.replace(new RegExp(`{${key}}`, 'g'), row[key]);
    });

    return message;
  }

  /**
   * Build header and body for request
   *
   * @param row
   * @param device
   * @param message
   * @private
   */
  private buildRequest(
    row: Record<string, any>,
    device: Device,
    message: string,
  ) {
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
    return { options, data };
  }
}
