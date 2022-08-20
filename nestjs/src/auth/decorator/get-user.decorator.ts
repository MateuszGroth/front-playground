import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetUser = createParamDecorator<
  unknown,
  ExecutionContext,
  { sub: number }
>((data: unknown, context: ExecutionContext) => {
  const request = context.switchToHttp().getRequest();

  return request.user;
});
