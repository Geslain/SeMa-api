import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { AxiosError, AxiosHeaders } from 'axios';

import { devicesFactory } from '../devices/factories/devices.factory';
import { fieldsFactory } from '../fields/factories/fields.factory';

import { projectsFactory } from './factories/projects.factory';
import { dataRowsFactory } from './data-row/factories/data-rows.factory';
import { dataRowFieldsFactory } from './data-row/data-row-field/factories/data-row-fields.factory';
import { PushBulletMessageProcessor } from './push-bullet-message.processor';

describe('PushBulletMessageProcessor', () => {
  let processor;
  const apiUrl = 'https://api.pushbullet.com/v2/texts';
  const mockHttpService = {
    post: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PushBulletMessageProcessor,
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              return { enableMessaging: true }[key];
            }),
          },
        },
      ],
    }).compile();
    processor = module.get(PushBulletMessageProcessor);
  });

  it('Should be defined', () => {
    expect(processor).toBeDefined();
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

      const postSpy = jest.spyOn(mockHttpService, 'post').mockReturnValueOnce(
        of({
          status: 200,
          statusText: 'OK',
          data: {},
        }),
      );
      const warnLoggerSpy = jest.spyOn(processor.logger, 'warn');
      const logLoggerSpy = jest.spyOn(processor.logger, 'log');

      const mockedOptions = { foo: 'bar' };
      const mockedData = { bar: 'foo' };

      const buildRowSpy = jest.spyOn(processor, 'buildRow');
      const buildMessageSpy = jest.spyOn(processor, 'buildMessage');
      const buildRequestSpy = jest
        .spyOn(processor, 'buildRequest')
        .mockImplementationOnce(() => ({
          options: mockedOptions,
          data: mockedData,
        }));

      await processor.sendMessages({ data });

      expect(buildRowSpy).toHaveBeenCalledTimes(3);
      expect(buildMessageSpy).toHaveBeenCalledTimes(3);
      expect(buildRequestSpy).toHaveBeenCalledTimes(1);
      expect(postSpy).toHaveBeenCalledTimes(1);
      expect(postSpy).toHaveBeenNthCalledWith(
        1,
        apiUrl,
        mockedData,
        mockedOptions,
      );
      expect(logLoggerSpy).toHaveBeenNthCalledWith(1, 'Start sending...');
      expect(logLoggerSpy).toHaveBeenNthCalledWith(2, {}, 200, 'OK');
      expect(logLoggerSpy).toHaveBeenNthCalledWith(
        3,
        `Send "${messageTemplate}" to ${dataRows[0].fields[0].value}`,
      );
      expect(logLoggerSpy).toHaveBeenNthCalledWith(4, 'Sending completed');
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
      const axiosError = new AxiosError(
        'mocked error',
        '500',
        { headers: new AxiosHeaders() },
        null,
        {
          data: 'foo bar',
          status: 500,
          statusText: 'KO',
          headers: new AxiosHeaders(),
          config: null,
        },
      );
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

      const postSpy = jest
        .spyOn(mockHttpService, 'post')
        .mockImplementationOnce(() => {
          throw new Error('mocked error');
        });

      const errorLoggerSpy = jest.spyOn(processor.logger, 'error');

      // Call send message a first time and throw a simple Error
      await processor.sendMessages({ data });

      expect(postSpy).toHaveBeenCalled();
      expect(errorLoggerSpy).toHaveBeenCalledWith(error);
      // Check that the axios condition is not triggered
      expect(errorLoggerSpy).not.toHaveBeenCalledWith(
        'Response:',
        axiosError.response.data,
      );

      postSpy.mockImplementationOnce(() => {
        throw axiosError;
      });

      // Call send message a second time and throw an Axios error
      await processor.sendMessages({ data });
      // Check that the axios condition is triggered
      expect(errorLoggerSpy).toHaveBeenCalledWith(
        'Response:',
        axiosError.response.data,
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

  describe('buildRequest()', () => {
    it('Should return an object with options and data', () => {
      const row = { phone: '123' };
      const device = devicesFactory.build();
      const message = 'Hello Mr Eric';
      const result = processor.buildRequest(row, device, message);

      expect(result).toHaveProperty('options');
      expect(result).toHaveProperty('data');
      expect(result.options.headers['Access-Token']).toBe(device.accessToken);
      expect(result.data.data.addresses[0]).toBe(row.phone);
      expect(result.data.data.target_device_iden).toBe(device.deviceId);
    });
  });
});
