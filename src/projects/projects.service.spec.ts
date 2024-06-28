import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { REQUEST } from '@nestjs/core';
import { faker } from '@faker-js/faker';
import { BadRequestException } from '@nestjs/common';
import { isArray } from 'class-validator';

import { UsersService } from '../users/users.service';
import { mockRepository } from '../common/tests/mock-repository';
import { usersFactory } from '../users/factories/users.factory';
import { FieldsService } from '../fields/fields.service';
import { fieldsFactory } from '../fields/factories/fields.factory';
import { DevicesService } from '../devices/devices.service';
import { devicesFactory } from '../devices/factories/devices.factory';

import { ProjectsService } from './projects.service';
import { Project } from './entities/project.entity';
import {
  projectsDtoFactory,
  projectsFactory,
} from './factories/projects.factory';

describe('ProjectsService', () => {
  let service: ProjectsService;
  const mockProjectRepository = mockRepository();
  const mockDevicesService = {
    findOne: jest.fn(),
  };
  const mockFieldService = {
    findOne: jest.fn(),
  };
  let getOwner;
  const owner = usersFactory.build();

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        {
          provide: getRepositoryToken(Project),
          useValue: mockProjectRepository,
        },
        {
          provide: UsersService,
          useValue: {},
        },
        {
          provide: FieldsService,
          useValue: mockFieldService,
        },
        {
          provide: DevicesService,
          useValue: mockDevicesService,
        },
        {
          provide: REQUEST,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<ProjectsService>(ProjectsService);
  });

  beforeEach(() => {
    getOwner = jest
      .spyOn(ProjectsService.prototype as any, 'getOwner')
      .mockResolvedValue(Promise.resolve(owner));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create()', () => {
    it('should insert a new data row', async () => {
      const mockProjectCreateDto = projectsDtoFactory.build();
      const mockProject = new Project();
      mockProject.owner = owner;
      mockProject.name = mockProjectCreateDto.name;
      mockProject.dataRows = [];

      jest
        .spyOn(service as any, 'addDevice')
        .mockImplementation((project) => Promise.resolve(project));

      jest
        .spyOn(mockProjectRepository, 'save')
        .mockImplementation((project) => Promise.resolve(project));

      const result = await service.create(mockProjectCreateDto);

      expect(getOwner).toHaveBeenCalledTimes(1);
      expect(mockProjectRepository.save).toHaveBeenCalledWith(mockProject);
      expect(result).toEqual(mockProject);
    });
  });
  describe('findAll()', () => {
    it('should return all data rows', async () => {
      const mockedProjectList = projectsFactory.buildList(2);

      jest
        .spyOn(mockProjectRepository, 'findBy')
        .mockReturnValueOnce(mockedProjectList);

      const result = await service.findAll();

      expect(getOwner).toHaveBeenCalledTimes(1);
      expect(mockProjectRepository.findBy).toHaveBeenCalledWith({
        owner: { id: owner.id },
      });
      expect(result).toEqual(mockedProjectList);
    });
  });
  describe('findOne()', () => {
    it('should return all data rows', async () => {
      const id = faker.string.uuid();
      const mockedProject = projectsFactory.build({ id });

      jest
        .spyOn(mockProjectRepository, 'findOne')
        .mockReturnValueOnce(mockedProject);

      const result = await service.findOne(id);

      expect(getOwner).toHaveBeenCalledTimes(1);
      expect(mockProjectRepository.findOne).toHaveBeenCalledWith({
        where: {
          id,
          owner: {
            id: owner.id,
          },
        },
        relations: ['fields'],
      });
      expect(result).toEqual(mockedProject);
    });
  });
  describe('update()', () => {
    it('should return null', async () => {
      const mockProjectUpdateDto = projectsDtoFactory.build();
      const id = faker.string.uuid();

      jest
        .spyOn(mockProjectRepository, 'findOneBy')
        .mockImplementation(() => Promise.resolve(null));

      jest
        .spyOn(service as any, 'addDevice')
        .mockImplementation((project) => Promise.resolve(project));

      const result = await service.update(id, mockProjectUpdateDto);

      expect(getOwner).toHaveBeenCalledTimes(1);
      expect(mockProjectRepository.findOneBy).toHaveBeenCalledWith({
        id,
        owner: { id: owner.id },
      });
      expect(mockProjectRepository.save).not.toHaveBeenCalled();
      expect(result).toEqual(null);
    });

    it('should update an existing project', async () => {
      const mockProjectUpdateDto = projectsDtoFactory.build();
      const id = faker.string.uuid();
      const mockedProject = projectsFactory.build();

      mockedProject.name = mockProjectUpdateDto.name;

      jest
        .spyOn(mockProjectRepository, 'findOneBy')
        .mockImplementation(() => Promise.resolve(mockedProject));

      jest
        .spyOn(service as any, 'addDevice')
        .mockImplementation((project) => Promise.resolve(project));

      const result = await service.update(id, mockProjectUpdateDto);

      expect(getOwner).toHaveBeenCalledTimes(1);
      expect(mockProjectRepository.findOneBy).toHaveBeenCalledWith({
        id,
        owner: { id: owner.id },
      });
      expect(mockProjectRepository.save).toHaveBeenCalledWith(mockedProject);
      expect(result).toEqual(mockedProject);
    });
  });
  describe('remove()', () => {
    it('should return null', async () => {
      const id = faker.string.uuid();

      jest.spyOn(mockProjectRepository, 'delete').mockResolvedValueOnce({
        raw: [],
        affected: 0,
      });
      const result = await service.remove(id);

      expect(mockProjectRepository.delete).toHaveBeenCalledWith({
        id,
        owner: { id: owner.id },
      });
      expect(result).toEqual(null);
    });
    it('should return an existing project', async () => {
      const id = faker.string.uuid();

      jest.spyOn(mockProjectRepository, 'delete').mockResolvedValueOnce({
        raw: [],
        affected: 1,
      });
      const result = await service.remove(id);

      expect(mockProjectRepository.delete).toHaveBeenCalledWith({
        id,
        owner: { id: owner.id },
      });
      expect(result).toEqual({
        raw: [],
        affected: 1,
      });
    });
  });

  describe('addField()', () => {
    it('should throw error when project does not exists', async () => {
      const id = faker.string.uuid();
      const mockedCreateProjectFieldDto = {
        fieldId: faker.string.uuid(),
      };

      const findOneSpy = jest
        .spyOn(service, 'findOne')
        .mockResolvedValueOnce(null);

      await expect(() =>
        service.addField(id, mockedCreateProjectFieldDto),
      ).rejects.toThrowError(
        new BadRequestException(`Project with id ${id} not found`),
      );

      expect(findOneSpy).toHaveBeenCalledWith(id);
    });
    it('should throw error when field does not exists', async () => {
      const id = faker.string.uuid();
      const fieldId = faker.string.uuid();
      const mockedProject = projectsFactory.build({ id });
      const mockedCreateProjectFieldDto = {
        fieldId,
      };

      const findOneSpy = jest
        .spyOn(service, 'findOne')
        .mockResolvedValueOnce(mockedProject);

      const findOneFieldSpy = jest
        .spyOn(mockFieldService, 'findOne')
        .mockResolvedValueOnce(null);

      await expect(() =>
        service.addField(id, mockedCreateProjectFieldDto),
      ).rejects.toThrowError(
        new BadRequestException(`Field with id ${fieldId} not found`),
      );

      expect(findOneSpy).toHaveBeenCalledWith(id);
      expect(findOneFieldSpy).toHaveBeenCalledWith(fieldId);
    });

    it('should not add field when already exists', async () => {
      const id = faker.string.uuid();
      const fieldId = faker.string.uuid();
      const mockedField = fieldsFactory.build({ id: fieldId });
      const mockedProject = projectsFactory.build(
        {
          id,
        },
        { associations: { fields: [mockedField] } },
      );
      const mockedProjectCopy = projectsFactory.build({
        ...mockedProject,
        fields: [mockedField],
      });
      const mockedCreateProjectFieldDto = {
        fieldId,
      };

      const findOneSpy = jest
        .spyOn(service, 'findOne')
        .mockResolvedValueOnce(mockedProject);

      const findOneFieldSpy = jest
        .spyOn(mockFieldService, 'findOne')
        .mockResolvedValueOnce(mockedField);

      const saveSpy = jest
        .spyOn(mockProjectRepository, 'save')
        .mockImplementationOnce((p) => Promise.resolve(p));

      const result = await service.addField(id, mockedCreateProjectFieldDto);

      expect(findOneSpy).toHaveBeenCalledWith(id);
      expect(findOneFieldSpy).toHaveBeenCalledWith(fieldId);
      expect(saveSpy).toHaveBeenCalledWith(mockedProjectCopy);
      expect(result.fields.length).toEqual(1);

      expect(result).toStrictEqual(mockedProject);
    });

    it('should add a new field (with existing field)', async () => {
      const id = faker.string.uuid();
      const fieldId = faker.string.uuid();
      const mockedExistingField = fieldsFactory.build();
      const mockedField = fieldsFactory.build({ id: fieldId });
      const mockedProject = projectsFactory.build(
        {
          id,
        },
        { associations: { fields: [mockedExistingField] } },
      );
      const mockedProjectCopy = projectsFactory.build({
        ...mockedProject,
        fields: [mockedExistingField],
      });
      const mockedCreateProjectFieldDto = {
        fieldId,
      };

      const findOneSpy = jest
        .spyOn(service, 'findOne')
        .mockResolvedValueOnce(mockedProject);

      const findOneFieldSpy = jest
        .spyOn(mockFieldService, 'findOne')
        .mockResolvedValueOnce(mockedField);

      const saveSpy = jest
        .spyOn(mockProjectRepository, 'save')
        .mockImplementationOnce((p) => Promise.resolve(p));

      const result = await service.addField(id, mockedCreateProjectFieldDto);

      mockedProjectCopy.fields.push(mockedField);

      expect(findOneSpy).toHaveBeenCalledWith(id);
      expect(findOneFieldSpy).toHaveBeenCalledWith(fieldId);
      expect(saveSpy).toHaveBeenCalledWith(mockedProjectCopy);
      expect(result.fields.length).toEqual(2);

      expect(result).toStrictEqual(mockedProjectCopy);
    });

    it('should add a new field (without existing field)', async () => {
      const id = faker.string.uuid();
      const fieldId = faker.string.uuid();
      const mockedField = fieldsFactory.build({ id: fieldId });
      const mockedProject = projectsFactory.build(
        {
          id,
        },
        { associations: { fields: null } },
      );
      const mockedProjectCopy = projectsFactory.build({
        ...mockedProject,
        fields: null,
      });
      const mockedCreateProjectFieldDto = {
        fieldId,
      };

      const findOneSpy = jest
        .spyOn(service, 'findOne')
        .mockResolvedValueOnce(mockedProject);

      const findOneFieldSpy = jest
        .spyOn(mockFieldService, 'findOne')
        .mockResolvedValueOnce(mockedField);

      const saveSpy = jest
        .spyOn(mockProjectRepository, 'save')
        .mockImplementationOnce((p) => Promise.resolve(p));

      const result = await service.addField(id, mockedCreateProjectFieldDto);

      mockedProjectCopy.fields = [mockedField];

      expect(findOneSpy).toHaveBeenCalledWith(id);
      expect(findOneFieldSpy).toHaveBeenCalledWith(fieldId);
      expect(saveSpy).toHaveBeenCalledWith(mockedProjectCopy);
      expect(result.fields.length).toEqual(1);

      expect(result).toStrictEqual(mockedProjectCopy);
    });
  });
  describe('findAllFields()', () => {
    it('should return an array of project fields', async () => {
      const id = faker.string.uuid();
      const fields = fieldsFactory.buildList(3);
      const mockedProject = projectsFactory.build(
        {
          id,
        },
        { associations: { fields } },
      );

      const findOneSpy = jest
        .spyOn(service, 'findOne')
        .mockResolvedValueOnce(mockedProject);

      const result = await service.findAllFields(id);

      expect(findOneSpy).toHaveBeenCalledWith(id);
      expect(isArray(result)).toBe(true);
      expect(result.length).toEqual(fields.length);
    });
    it('should return empty array', async () => {
      const id = faker.string.uuid();
      const mockedProject = projectsFactory.build(
        {
          id,
        },
        { associations: { fields: null } },
      );

      const findOneSpy = jest
        .spyOn(service, 'findOne')
        .mockResolvedValueOnce(mockedProject);

      const result = await service.findAllFields(id);

      expect(findOneSpy).toHaveBeenCalledWith(id);
      expect(isArray(result)).toBe(true);
      expect(result.length).toEqual(0);
    });
  });
  describe('removeField()', () => {
    it('should remove field', async () => {
      const id = faker.string.uuid();
      const fieldId = faker.string.uuid();
      const fields = [
        ...fieldsFactory.buildList(2),
        fieldsFactory.build({ id: fieldId }),
      ];
      const mockedProject = projectsFactory.build(
        {
          id,
        },
        { associations: { fields } },
      );

      const findOneSpy = jest
        .spyOn(service, 'findOne')
        .mockResolvedValueOnce(mockedProject);

      const saveSpy = jest
        .spyOn(mockProjectRepository, 'save')
        .mockImplementationOnce((p) => Promise.resolve(p));

      const result = await service.removeField(id, fieldId);

      expect(findOneSpy).toHaveBeenCalledWith(id);
      expect(saveSpy).toHaveBeenCalledWith(mockedProject);
      expect(result).toBe(mockedProject);
      expect(result.fields.length).toEqual(fields.length - 1);
    });
    it('should not remove if field do not exists in project fields', async () => {
      const id = faker.string.uuid();
      const fieldId = faker.string.uuid();
      const fields = fieldsFactory.buildList(2);
      const mockedProject = projectsFactory.build(
        {
          id,
        },
        { associations: { fields } },
      );

      const findOneSpy = jest
        .spyOn(service, 'findOne')
        .mockResolvedValueOnce(mockedProject);

      const saveSpy = jest
        .spyOn(mockProjectRepository, 'save')
        .mockImplementationOnce((p) => Promise.resolve(p));

      const result = await service.removeField(id, fieldId);

      expect(findOneSpy).toHaveBeenCalledWith(id);
      expect(saveSpy).toHaveBeenCalledWith(mockedProject);
      expect(result).toBe(mockedProject);
      expect(result.fields.length).toEqual(fields.length);
    });
    it('should return project if project fields is null', async () => {
      const id = faker.string.uuid();
      const fieldId = faker.string.uuid();
      const fields = null;
      const mockedProject = projectsFactory.build(
        {
          id,
        },
        { associations: { fields } },
      );

      const findOneSpy = jest
        .spyOn(service, 'findOne')
        .mockResolvedValueOnce(mockedProject);

      const saveSpy = jest
        .spyOn(mockProjectRepository, 'save')
        .mockImplementationOnce((p) => Promise.resolve(p));

      const result = await service.removeField(id, fieldId);

      expect(findOneSpy).toHaveBeenCalledWith(id);
      expect(saveSpy).not.toHaveBeenCalled();
      expect(result).toBe(mockedProject);
      expect(result.fields).toEqual(null);
    });
  });

  describe('addDevice()', () => {
    let testService;
    beforeEach(async () => {
      class TestAddDevice extends ProjectsService {
        test(deviceId: string, project: Project) {
          return this.addDevice(deviceId, project);
        }
      }

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          TestAddDevice,
          {
            provide: getRepositoryToken(Project),
            useValue: mockProjectRepository,
          },
          {
            provide: UsersService,
            useValue: {},
          },
          {
            provide: FieldsService,
            useValue: mockFieldService,
          },
          {
            provide: DevicesService,
            useValue: mockDevicesService,
          },
          {
            provide: REQUEST,
            useValue: {},
          },
        ],
      }).compile();

      testService = module.get<TestAddDevice>(TestAddDevice);
    });
    it('should throw an error', async () => {
      const deviceId = faker.string.uuid();
      const project = projectsFactory.build();
      await expect(() => testService.test(deviceId, project)).rejects.toThrow(
        new BadRequestException(`No device found with id ${deviceId}`),
      );

      expect(mockDevicesService.findOne).toHaveBeenCalledWith(deviceId);
    });

    it('should update project with device', async () => {
      const deviceId = faker.string.uuid();
      const device = devicesFactory.build({ id: deviceId });
      const project = projectsFactory.build();
      const projectCopy = Object.assign({}, project);

      const findOneSpy = jest
        .spyOn(mockDevicesService, 'findOne')
        .mockImplementationOnce(() => Promise.resolve(device));

      const result = await testService.test(deviceId, project);

      projectCopy.device = device;

      expect(findOneSpy).toHaveBeenCalledWith(deviceId);
      expect(result).toStrictEqual(projectCopy);
    });

    it('should not update project', async () => {
      const deviceId = null;
      const project = projectsFactory.build();
      const projectCopy = Object.assign({}, project);

      const findOneSpy = jest.spyOn(mockDevicesService, 'findOne');

      const result = await testService.test(deviceId, project);

      expect(findOneSpy).not.toHaveBeenCalled();
      expect(result).toStrictEqual(projectCopy);
    });
  });
});
