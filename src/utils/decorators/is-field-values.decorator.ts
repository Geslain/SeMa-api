// eslint-disable-next-line import/named
import { ValidationArguments, registerDecorator } from 'class-validator';

import { FieldType } from '../../fields/entities/field.entity';

export function IsFieldValues() {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isFieldValues',
      target: object.constructor,
      propertyName: propertyName,
      options: {
        message: "You must add at least one value for type 'list' field",
      },
      validator: {
        validate(value: any, args: ValidationArguments) {
          const type = (args.object as any)['type'];
          return (
            (type === FieldType.LIST && value.length >= 1) ||
            type !== FieldType.LIST
          );
        },
      },
    });
  };
}
