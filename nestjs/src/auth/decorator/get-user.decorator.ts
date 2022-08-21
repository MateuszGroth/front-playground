import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetUser = createParamDecorator<
  unknown,
  ExecutionContext,
  { sub: number }
>((data: string | undefined, context: ExecutionContext) => {
  const request = context.switchToHttp().getRequest();

  if (data) {
    return request.user[data];
  }

  return request.user;
});
