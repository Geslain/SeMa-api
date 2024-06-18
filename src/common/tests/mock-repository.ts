export function mockRepository() {
  return {
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    findBy: jest.fn(),
    delete: jest.fn(),
  };
}
