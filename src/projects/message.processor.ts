import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { isArray } from 'class-validator';
import { cert, initializeApp } from 'firebase-admin/app';
import { FirebaseMessagingError, getMessaging } from 'firebase-admin/messaging';
import { ServiceAccount } from 'firebase-admin/lib/app/credential';

import { Field } from '../fields/entities/field.entity';
import { Device } from '../devices/entities/device.entity';

import { DataRowField } from './data-row/data-row-field/entities/data-row-field.entity';
import { Project } from './entities/project.entity';

@Processor('message')
export class MessageProcessor {
  constructor(
    private readonly httpService: HttpService,
    private readonly config: ConfigService,
  ) {
    const firebaseAdminConfig = {
      credential: cert({
        type: 'service_account',
        project_id: this.config.get('firebase.project_id'),
        private_key_id: this.config.get('firebase.private_key_id'),
        private_key: this.config.get('firebase.private_key'),
        client_email: this.config.get('firebase.client_email'),
        client_id: this.config.get('firebase.client_id'),
        auth_uri: 'https://accounts.google.com/o/oauth2/auth',
        token_uri: 'https://oauth2.googleapis.com/token',
        auth_provider_x509_cert_url:
          'https://www.googleapis.com/oauth2/v1/certs',
        client_x509_cert_url: this.config.get('firebase.client_x509_cert_url'),
        universe_domain: 'googleapis.com',
      } as ServiceAccount),
    };

    initializeApp(firebaseAdminConfig);
  }

  private readonly logger = new Logger(MessageProcessor.name);

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

        const payload = this.buildPayload(row, device, message);

        if (this.config.get('enableMessaging')) {
          const response = await getMessaging().send(payload);
          this.logger.log(
            `Successfully Send "${message}" to ${row.phone} (Firebase: ${response})`,
          );
        } else {
          this.logger.warn(
            `Attempt to send message (${row.phone}) but message sending is disabled`,
          );
        }
      }

      this.logger.log('Sending completed');
    } catch (e) {
      this.logger.error(e);
      this.logger.error('Stack:', e.stack);
      if (e instanceof FirebaseMessagingError) {
        this.logger.error('Firebase error code:', e.code);
        this.logger.error('Firebase error message:', e.message);
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
   * Build Firebase message payload
   *
   * @param row
   * @param device
   * @param message
   * @private
   */
  private buildPayload(
    row: Record<string, any>,
    device: Device,
    message: string,
  ) {
    return {
      data: {
        phone: row.phone,
        body: message,
      },
      token: device.deviceId,
    };
  }
}
