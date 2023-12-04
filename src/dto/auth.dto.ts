import {
  IsEmail,
  IsString,
  Matches,
  registerDecorator,
  type ValidationArguments,
} from 'class-validator';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'password too weak',
  })
  password: string;
}

export class SignupDto extends LoginDto {
  @IsMatch('password', {
    message: 'password and confirm password do not match',
  })
  confirmPassword: string;
}

export class EmailDto {
  @IsEmail()
  email: string;
}

export class PasswordDto {
  @IsString()
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'password too weak',
  })
  password: string;
}

export function IsMatch(property: string, validationOptions?: any) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'isMatch',
      target: object.constructor,
      propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          const relatedValue = (args.object as any)[relatedPropertyName];
          return (
            typeof value === 'string' &&
            typeof relatedValue === 'string' &&
            value === relatedValue
          );
        },
      },
    });
  };
}
