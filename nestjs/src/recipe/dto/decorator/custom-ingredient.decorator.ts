import { registerDecorator, ValidationArguments } from 'class-validator';

export function CustomIngredient(property: string) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'customIngredient',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: {
        message:
          'Either ingredientId or customIngredient must be provided. Field customIngredient must be between 3 and 60 characters',
      },
      validator: {
        validate(customIngredientName: any, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          const ingredientId = (args.object as any)[relatedPropertyName]; // the second value
          const isCustomIngredientNamePassed = customIngredientName != null;
          const isIdPassed = ingredientId != null;
          const areBothPassed = isCustomIngredientNamePassed && isIdPassed;
          if (areBothPassed) {
            return false;
          }

          if (isIdPassed) {
            return (
              typeof ingredientId === 'number' && Number.isInteger(ingredientId)
            );
          }

          if (isCustomIngredientNamePassed) {
            return (
              typeof customIngredientName === 'string' &&
              customIngredientName.length > 2 &&
              customIngredientName.length < 61
            );
          }

          return false;
        },
      },
    });
  };
}
