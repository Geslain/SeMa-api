import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin/app';
import * as messaging from 'firebase-admin/messaging';
import { faker } from '@faker-js/faker';

import { devicesFactory } from '../devices/factories/devices.factory';
import { fieldsFactory } from '../fields/factories/fields.factory';

import { MessageProcessor } from './message.processor';
import { projectsFactory } from './factories/projects.factory';
import { dataRowsFactory } from './data-row/factories/data-rows.factory';
import { dataRowFieldsFactory } from './data-row/data-row-field/factories/data-row-fields.factory';

jest.mock('firebase-admin/app', () => ({
  ...jest.requireActual('firebase-admin/app'),
  cert: jest.fn(),
  initializeApp: jest.fn(),
}));

jest.mock('firebase-admin/messaging', () => ({
  ...jest.requireActual('firebase-admin/messaging'),
  FirebaseMessagingError: jest.fn(),
  getMessaging: jest.fn(),
}));

describe('MessageProcessor', () => {
  let processor;
  const mockHttpService: Partial<HttpService> = {
    post: jest.fn(),
  };
  const mockConfigService: Partial<
    ConfigService<Record<string, unknown>, false>
  > = {
    get: jest.fn((key: string) => {
      return { ...mockFirebaseConfig, enableMessaging: true }[key];
    }),
  };

  const mockFirebaseConfig = {
    'firebase.project_id': faker.string.sample(),
    'firebase.private_key_id': faker.string.sample(),
    'firebase.private_key': faker.string.sample(),
    'firebase.client_email': faker.string.sample(),
    'firebase.client_id': faker.string.sample(),
    'firebase.client_x509_cert_url': faker.string.sample(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessageProcessor,
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();
    processor = module.get(MessageProcessor);
    jest.clearAllMocks();
  });

  it('Should be defined', () => {
    expect(processor).toBeDefined();
  });

  describe('constructor()', () => {
    it('Should initialize firebase', async () => {
      new MessageProcessor(
        mockHttpService as HttpService,
        mockConfigService as ConfigService<Record<string, unknown>, false>,
      );

      expect(admin.initializeApp).toHaveBeenCalledTimes(1);
      expect(admin.cert).toHaveBeenCalledWith({
        type: 'service_account',
        project_id: mockFirebaseConfig['firebase.project_id'],
        private_key_id: mockFirebaseConfig['firebase.private_key_id'],
        private_key: mockFirebaseConfig['firebase.private_key'],
        client_email: mockFirebaseConfig['firebase.client_email'],
        client_id: mockFirebaseConfig['firebase.client_id'],
        auth_uri: 'https://accounts.google.com/o/oauth2/auth',
        token_uri: 'https://oauth2.googleapis.com/token',
        auth_provider_x509_cert_url:
          'https://www.googleapis.com/oauth2/v1/certs',
        client_x509_cert_url:
          mockFirebaseConfig['firebase.client_x509_cert_url'],
        universe_domain: 'googleapis.com',
      });
    });
  });

  describe('sendMessages()', () => {
    it('should log errors when data is missing', async () => {
      let data = projectsFactory.build({
        device: null,
        dataRows: null,
        fields: null,
        messageTemplate: null,
      });
      const loggerSpy = jest.spyOn(processor.logger, 'error');

      await processor.sendMessages({ data });

      data = projectsFactory.build({
        device: devicesFactory.build(),
        dataRows: [],
        fields: [],
      });

      await processor.sendMessages({ data });

      expect(loggerSpy).toHaveBeenNthCalledWith(1, {
        message: 'Messages cannot be sent',
        errors: [
          'Device is not defined',
          'Template is not defined',
          'Fields is empty',
          'No data was found',
        ],
      });

      expect(loggerSpy).toHaveBeenNthCalledWith(2, {
        message: 'Messages cannot be sent',
        errors: ['Fields is empty', 'No data was found'],
      });
    });

    it('should send message and skip data rows without phones', async () => {
      const phoneField = fieldsFactory.build({ name: 'phone' }),
        genderField = fieldsFactory.build({ name: 'gender' }),
        nameFields = fieldsFactory.build({ name: 'name' });

      const fields = [phoneField, genderField, nameFields];
      // Mocked 3 data rows for project
      // 1 contains all fields, 1 has missing phone, 1 has missing phone and missing field
      const dataRows = [
        dataRowsFactory.build({
          fields: [
            dataRowFieldsFactory.build({
              fieldId: phoneField.id,
              value: '123',
            }),
            dataRowFieldsFactory.build({
              fieldId: genderField.id,
              value: 'M',
            }),
            dataRowFieldsFactory.build({
              fieldId: nameFields.id,
              value: 'foo',
            }),
          ],
        }),
        dataRowsFactory.build({
          fields: [
            dataRowFieldsFactory.build({
              fieldId: genderField.id,
              value: 'F',
            }),
            dataRowFieldsFactory.build({
              fieldId: nameFields.id,
              value: 'bar',
            }),
          ],
        }),
        dataRowsFactory.build({
          fields: [
            dataRowFieldsFactory.build({
              fieldId: genderField.id,
              value: 'F',
            }),
          ],
        }),
      ];
      const messageTemplate = 'foo foo bar';
      const data = projectsFactory.build({
        device: devicesFactory.build(),
        dataRows,
        fields,
        messageTemplate,
      });

      const warnLoggerSpy = jest.spyOn(processor.logger, 'warn');
      const logLoggerSpy = jest.spyOn(processor.logger, 'log');

      const mockedData = { bar: 'foo' };

      const firebaseSendReturnMock = 'foobar barfoo';
      const sendMock = jest.fn().mockReturnValue(firebaseSendReturnMock);

      (messaging.getMessaging as jest.Mock).mockImplementation(() => ({
        send: sendMock,
      }));

      const buildRowSpy = jest.spyOn(processor, 'buildRow');
      const buildMessageSpy = jest.spyOn(processor, 'buildMessage');
      const buildPayloadSpy = jest
        .spyOn(processor, 'buildPayload')
        .mockImplementationOnce(() => mockedData);

      await processor.sendMessages({ data });

      expect(buildRowSpy).toHaveBeenCalledTimes(3);
      expect(buildMessageSpy).toHaveBeenCalledTimes(3);
      expect(buildPayloadSpy).toHaveBeenCalledTimes(1);
      expect(sendMock).toHaveBeenCalledTimes(1);
      expect(sendMock).toHaveBeenNthCalledWith(1, mockedData);
      expect(logLoggerSpy).toHaveBeenNthCalledWith(1, 'Start sending...');
      expect(logLoggerSpy).toHaveBeenNthCalledWith(
        2,
        `Successfully Send "${messageTemplate}" to ${dataRows[0].fields[0].value} (Firebase: ${firebaseSendReturnMock})`,
      );
      expect(logLoggerSpy).toHaveBeenNthCalledWith(3, 'Sending completed');
      expect(warnLoggerSpy).toHaveBeenCalledTimes(2);
      expect(warnLoggerSpy).toHaveBeenNthCalledWith(
        1,
        `Message cannot be send because of missing phone number for data row with id ${dataRows[1].id}`,
        processor.buildRow(fields, dataRows[1].fields),
      );
      expect(warnLoggerSpy).toHaveBeenNthCalledWith(
        2,
        `Message cannot be send because of missing phone number for data row with id ${dataRows[2].id}`,
        processor.buildRow(fields, dataRows[2].fields),
      );
    });

    it('should log errors', async () => {
      const error = new Error('mocked error');
      const firebaseError = new messaging.FirebaseMessagingError('foo');
      const phoneField = fieldsFactory.build({ name: 'phone' });

      const fields = [phoneField];
      // Mocked 1 data rows for project with bare minimum for sending
      const dataRows = [
        dataRowsFactory.build({
          fields: [
            dataRowFieldsFactory.build({
              fieldId: phoneField.id,
              value: '123',
            }),
          ],
        }),
      ];
      const messageTemplate = 'foo foo bar';
      const data = projectsFactory.build({
        device: devicesFactory.build(),
        dataRows,
        fields,
        messageTemplate,
      });

      const sendMock = jest.fn().mockImplementationOnce(() => {
        throw new Error('mocked error');
      });

      (messaging.getMessaging as jest.Mock).mockImplementation(() => ({
        send: sendMock,
      }));

      const errorLoggerSpy = jest.spyOn(processor.logger, 'error');

      // Call send message a first time and throw a simple Error
      await processor.sendMessages({ data });

      expect(sendMock).toHaveBeenCalled();
      expect(errorLoggerSpy).toHaveBeenCalledWith(error);
      // Check that the axios condition is not triggered
      expect(errorLoggerSpy).not.toHaveBeenCalledWith(
        'Firebase error code:',
        firebaseError.code,
      );
      expect(errorLoggerSpy).not.toHaveBeenCalledWith(
        'Firebase error message:',
        firebaseError.message,
      );

      sendMock.mockImplementationOnce(() => {
        throw firebaseError;
      });

      // Call send message a second time and throw an Axios error
      await processor.sendMessages({ data });
      // Check that the axios condition is triggered
      expect(errorLoggerSpy).toHaveBeenCalledWith(
        'Firebase error code:',
        firebaseError.code,
      );
      expect(errorLoggerSpy).toHaveBeenCalledWith(
        'Firebase error message:',
        firebaseError.message,
      );
    });
  });

  describe('buildRow()', () => {
    it('Should return an empty object', () => {
      const fieldsValues = [null, [], fieldsFactory.buildList(2)];
      const dataRowFieldValues = [null, [], dataRowFieldsFactory.buildList(2)];

      fieldsValues.forEach((f, i) => {
        dataRowFieldValues.forEach(async (drf, j) => {
          // Test for every combination of value except the last
          if (
            i !== fieldsValues.length - 1 &&
            j !== dataRowFieldValues.length - 1
          ) {
            const result = processor.buildRow(f, drf);
            expect(result).toStrictEqual({});
          }
        });
      });
    });

    it('Should throw an error', async () => {
      const fields = fieldsFactory.buildList(2);
      const dataRowField = dataRowFieldsFactory.build({
        fieldId: '1',
        dataRowId: '2',
      });
      const dataRowFields = [dataRowField];

      expect(() => processor.buildRow(fields, dataRowFields)).toThrow(
        new Error(
          `Field with id ${dataRowField.fieldId} cannot be found for data row ${dataRowField.dataRowId}`,
        ),
      );
    });

    it('Should return a key value object', () => {
      const fields = [
        { id: 1, name: 'firstname' },
        { id: 2, name: 'lastname' },
      ];
      const dataRowField = [
        { fieldId: 1, value: 'Eric' },
        { fieldId: 2, value: 'Moth' },
      ];
      const result = processor.buildRow(fields, dataRowField);

      expect(result).toStrictEqual({ firstname: 'Eric', lastname: 'Moth' });
    });
  });

  describe('buildMessage()', () => {
    it('Should return an empty string', () => {
      const message = '';
      const row = { foo: 'bar' };
      const result = processor.buildMessage(row, message);

      expect(result).toStrictEqual('');
    });
    describe('Should return same message', () => {
      it('if row not an object', () => {
        const message = 'Foo {bar} 12 bar';
        const row = null;
        const result = processor.buildMessage(row, message);

        expect(result).toBe(message);
      });
      it('if row is empty', () => {
        const message = 'Foo {bar} 12 bar';
        const row = {};
        const result = processor.buildMessage(row, message);

        expect(result).toBe(message);
      });
      it('if message does not contain variable', () => {
        const message = 'Foo bar 12 bar';
        const row = { bar: 'foo' };
        const result = processor.buildMessage(row, message);

        expect(result).toBe(message);
      });
    });

    it('Should return message with replaced variables', () => {
      const message = 'Hello {firstname} {lastname}';
      const row = { firstname: 'Eric', lastname: 'Moth' };
      const result = processor.buildMessage(row, message);

      expect(result).toStrictEqual('Hello Eric Moth');
    });
  });

  describe('buildPayload()', () => {
    it('Should return an firebase payload', () => {
      const row = { phone: '123' };
      const device = devicesFactory.build();
      const message = 'Hello Mr Eric';
      const result = processor.buildPayload(row, device, message);

      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('data');
      expect(result.data.phone).toBe(row.phone);
      expect(result.data.body).toBe(message);
      expect(result.token).toBe(device.deviceId);
    });
  });
});
