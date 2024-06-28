import { Test, TestingModule } from '@nestjs/testing';
import { faker } from '@faker-js/faker';

import { fieldsFactory } from '../fields/factories/fields.factory';

import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import {
  projectsDtoFactory,
  projectsFactory,
} from './factories/projects.factory';

describe('ProjectsController', () => {
  let controller: ProjectsController;
  let service: ProjectsService;

  const mockedProjectService = {
    findAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
    addField: jest.fn(),
    findAllFields: jest.fn(),
    removeField: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectsController],
      providers: [{ provide: ProjectsService, useValue: mockedProjectService }],
    }).compile();

    controller = module.get<ProjectsController>(ProjectsController);
    service = module.get<ProjectsService>(ProjectsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create()', () => {
    it('should create a new project', async () => {
      const createProjectDto = projectsDtoFactory.build();
      const mockedProject = projectsFactory.build();
      const createSpy = jest
        .spyOn(service, 'create')
        .mockResolvedValueOnce(mockedProject);

      const project = await controller.create(createProjectDto);
      expect(createSpy).toHaveBeenCalledWith(createProjectDto);
      expect(project).toEqual(mockedProject);
    });
  });

  describe('update()', () => {
    it('should update an project', async () => {
      const projectId = faker.string.uuid();
      const mockedProject = projectsFactory.build();
      const updateProjectDto = projectsDtoFactory.build();
      const updateSpy = jest
        .spyOn(service, 'update')
        .mockResolvedValueOnce(mockedProject);

      const project = await controller.update(projectId, updateProjectDto);
      expect(updateSpy).toHaveBeenCalledWith(projectId, updateProjectDto);
      expect(project).toEqual(mockedProject);
    });
  });

  describe('findAll()', () => {
    it('should return an array of projects', async () => {
      const mockedProjects = [projectsFactory.build(), projectsFactory.build()];

      const findAllSpy = jest
        .spyOn(service, 'findAll')
        .mockResolvedValueOnce(mockedProjects);

      const projects = await controller.findAll();
      expect(findAllSpy).toHaveBeenCalledWith();
      expect(projects).toEqual(mockedProjects);
    });
  });

  describe('findOne()', () => {
    it('should return a project get by id parameter', async () => {
      const projectId = faker.string.uuid();
      const mockedProject = projectsFactory.build();

      const findOneSpy = jest
        .spyOn(service, 'findOne')
        .mockResolvedValueOnce(mockedProject);

      const project = await controller.findOne(projectId);
      expect(findOneSpy).toHaveBeenCalledWith(projectId);
      expect(project).toEqual(mockedProject);
    });
  });

  describe('remove()', () => {
    it('should remove a project get by id parameter', async () => {
      const projectId = faker.string.uuid();

      const remove = jest.spyOn(service, 'remove').mockResolvedValueOnce(null);

      const result = await controller.remove(projectId);
      expect(remove).toHaveBeenCalledWith(projectId);
      expect(result).toEqual(null);
    });
  });

  describe('addField()', () => {
    it('should add field to a project', async () => {
      const projectId = faker.string.uuid();
      const createProjectFieldDto = {
        fieldId: faker.string.uuid(),
      };
      const mockedProject = projectsFactory.build({ id: projectId });

      const addFieldSpy = jest
        .spyOn(service, 'addField')
        .mockResolvedValueOnce(mockedProject);

      const result = await controller.addField(
        projectId,
        createProjectFieldDto,
      );
      expect(addFieldSpy).toHaveBeenCalledWith(
        projectId,
        createProjectFieldDto,
      );
      expect(result).toEqual(mockedProject);
    });
  });
  describe('findAllFields()', () => {
    it('should find all field for a project', async () => {
      const projectId = faker.string.uuid();
      const mockedFields = fieldsFactory.buildList(2);

      const addFieldSpy = jest
        .spyOn(service, 'findAllFields')
        .mockResolvedValueOnce(mockedFields);

      const result = await controller.findAllFields(projectId);
      expect(addFieldSpy).toHaveBeenCalledWith(projectId);
      expect(result).toEqual(mockedFields);
    });
  });
  describe('removeField()', () => {
    it('should a field for a project', async () => {
      const projectId = faker.string.uuid();
      const fieldId = faker.string.uuid();
      const mockedProject = projectsFactory.build();

      const addFieldSpy = jest
        .spyOn(service, 'removeField')
        .mockResolvedValueOnce(mockedProject);

      const result = await controller.removeField(projectId, fieldId);
      expect(addFieldSpy).toHaveBeenCalledWith(projectId, fieldId);
      expect(result).toEqual(mockedProject);
    });
  });
});
