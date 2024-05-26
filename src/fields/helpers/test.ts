import { FieldType } from '../entities/field.entity';

/**
 * Create mocked data for user
 *
 * @param id
 * @param type
 * @param withId
 */
export function createMockedField(id: number, type: FieldType, withId = false) {
  return {
    name: `foo${id}`,
    type,
    ...(type === FieldType.list && { values: [`foo${id}`, `bar${id}`] }),
    ...(withId && { id }),
  };
}
