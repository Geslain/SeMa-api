import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { REQUEST } from '@nestjs/core';
import { faker } from '@faker-js/faker';

import { UsersService } from '../users/users.service';
import { mockRepository } from '../common/tests/mock-repository';
import { usersFactory } from '../users/factories/users.factory';

import { ProjectsService } from './projects.service';
import { Project } from './entities/project.entity';
import {
  projectsDtoFactory,
  projectsFactory,
} from './factories/projects.factory';

describe('ProjectsService', () => {
  let service: ProjectsService;
  const mockProjectRepository = mockRepository();
  const mockUserService = {};
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
          useValue: mockUserService,
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
        .spyOn(mockProjectRepository, 'findOneBy')
        .mockReturnValueOnce(mockedProject);

      const result = await service.findOne(id);

      expect(getOwner).toHaveBeenCalledTimes(1);
      expect(mockProjectRepository.findOneBy).toHaveBeenCalledWith({
        id,
        owner: { id: owner.id },
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
});
