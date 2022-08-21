import { ValidationPipe, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as pactum from 'pactum';
import { PrismaService } from '../src/prisma/prisma.service';
import { AppModule } from '../src/app.module';
import { AuthDto } from 'src/auth/dto';

describe('App e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
    await app.listen(3333);

    prisma = app.get(PrismaService);

    await prisma.cleanDb();
    pactum.request.setBaseUrl('http://localhost:3333');
  });

  afterAll(() => {
    app.close();
  });

  describe('Auth', () => {
    const dto: AuthDto = {
      email: 'test@email.com',
      password: '123456',
    };
    describe('Signup', () => {
      it('should throw if email is empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({ ...dto, email: '' })
          .expectStatus(400);
      });
      it('should throw if email is invalid', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({ ...dto, email: 'not valid email' })
          .expectStatus(400);
      });
      it('should throw if password is empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({ ...dto, password: '' })
          .expectStatus(400);
      });
      it('should throw if no body', () => {
        return pactum.spec().post('/auth/signup').expectStatus(400);
      });
      it('should signup', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(dto)
          .expectStatus(201);
      });
    });
    describe('Signin', () => {
      it('should throw if email is empty', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({ ...dto, email: '' })
          .expectStatus(400);
      });
      it('should throw if password is empty', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({ ...dto, password: '' })
          .expectStatus(400);
      });
      it('should throw if user email does not exist', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({ ...dto, email: 'nonexistent@email.com' })
          .expectStatus(403);
      });
      it('should throw if no body', () => {
        return pactum.spec().post('/auth/signin').expectStatus(400);
      });
      it('should signin', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody(dto)
          .expectStatus(200)
          .stores('accessToken', 'access_token');
      });
    });
  });
  describe('User', () => {
    describe('Get current user', () => {
      it('should get user', () => {
        return pactum
          .spec()
          .get('/users/me')
          .withHeaders({ Authorization: `Bearer $S{accessToken}` })
          .expectStatus(200);
      });
    });
    describe('Edit current user', () => {
      it('should edit user', () => {
        const editDto = {
          email: 'edited@email.com',
          name: 'editedName',
        };
        return pactum
          .spec()
          .patch('/users/me')
          .withHeaders({ Authorization: `Bearer $S{accessToken}` })
          .withBody(editDto)
          .expectStatus(200)
          .expectBodyContains(editDto.email)
          .expectBodyContains(editDto.name);
      });
    });
  });
  describe('Recipes', () => {
    describe('Create recipe', () => {
      it.todo('should create recipe');
    });
    describe('Get recipes', () => {
      it.todo('should create recipe');
    });
    describe('Get recipe by id', () => {
      it.todo('should create recipe');
    });
    describe('Edit recipe by id', () => {
      it.todo('should create recipe');
    });
    describe('Delete recipe by id', () => {
      it.todo('should create recipe');
    });
  });
});
