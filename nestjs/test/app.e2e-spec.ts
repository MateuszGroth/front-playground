import { ValidationPipe, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as pactum from 'pactum';
import { PrismaService } from '../src/prisma/prisma.service';
import { AppModule } from '../src/app.module';
import { AuthDto } from 'src/auth/dto';
import { CreateRecipeDto, EditRecipeDto } from 'src/recipe/dto';

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
    const dtoUserOne: AuthDto = {
      email: 'testOne@email.com',
      password: '123456',
    };
    const dtoUserTwo: AuthDto = {
      email: 'testTwo@email.com',
      password: '654321',
    };
    describe('Signup', () => {
      it('should throw if email is empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({ ...dtoUserOne, email: '' })
          .expectStatus(400);
      });
      it('should throw if email is invalid', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({ ...dtoUserOne, email: 'not valid email' })
          .expectStatus(400);
      });
      it('should throw if password is empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({ ...dtoUserOne, password: '' })
          .expectStatus(400);
      });
      it('should throw if no body', () => {
        return pactum.spec().post('/auth/signup').expectStatus(400);
      });
      it('should signup user 1', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(dtoUserOne)
          .expectStatus(201);
      });
      it('should signup user 2', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(dtoUserTwo)
          .expectStatus(201);
      });
    });
    describe('Signin', () => {
      it('should throw if email is empty', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({ ...dtoUserOne, email: '' })
          .expectStatus(400);
      });
      it('should throw if password is empty', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({ ...dtoUserOne, password: '' })
          .expectStatus(400);
      });
      it('should throw if user email does not exist', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({ ...dtoUserOne, email: 'nonexistent@email.com' })
          .expectStatus(403);
      });
      it('should throw if no body', () => {
        return pactum.spec().post('/auth/signin').expectStatus(400);
      });
      it('should signin user 1', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody(dtoUserOne)
          .expectStatus(200)
          .stores('accessToken', 'access_token');
      });
      it('should signin user 2', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody(dtoUserTwo)
          .expectStatus(200)
          .stores('accessTokenSecond', 'access_token');
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
    describe('Get empty recipes', () => {
      it('should throw if not logged in', () => {
        return pactum.spec().get(`/recipes`).expectStatus(401);
      });
      it('should get empty list of recipes', () => {
        return pactum
          .spec()
          .get(`/recipes`)
          .withHeaders({ Authorization: `Bearer $S{accessToken}` })
          .expectStatus(200)
          .expectBody([]);
      });
    });
    describe('Create recipe', () => {
      const createRecipeDto: CreateRecipeDto = {
        title: 'recipe title',
        description: 'recipe description',
        ingredients: [
          {
            customIngredient: 'some ingredient',
            quantity: 10,
            quantityUnit: 'kg',
          },
        ],
        steps: [
          {
            description: 'step description',
          },
        ],
      };
      it('should throw if not logged in', async () => {
        return pactum
          .spec()
          .post('/recipes')
          .withBody({ ...createRecipeDto, title: undefined })
          .expectStatus(401);
      });
      it('should throw if no title', async () => {
        return pactum
          .spec()
          .post('/recipes')
          .withHeaders({ Authorization: `Bearer $S{accessToken}` })
          .withBody({ ...createRecipeDto, title: undefined })
          .expectStatus(400);
      });
      it('should throw if title is too short', async () => {
        return pactum
          .spec()
          .post('/recipes')
          .withHeaders({ Authorization: `Bearer $S{accessToken}` })
          .withBody({ ...createRecipeDto, title: 'ab' })
          .expectStatus(400);
      });
      it('should throw if title is too long', async () => {
        return pactum
          .spec()
          .post('/recipes')
          .withHeaders({ Authorization: `Bearer $S{accessToken}` })
          .withBody({
            ...createRecipeDto,
            title:
              'title title title title title title title title title title title ',
          })
          .expectStatus(400);
      });
      it('should throw if title is number', async () => {
        return pactum
          .spec()
          .post('/recipes')
          .withHeaders({ Authorization: `Bearer $S{accessToken}` })
          .withBody({
            ...createRecipeDto,
            title: 123,
          })
          .expectStatus(400);
      });
      it('should throw if title is array', async () => {
        return pactum
          .spec()
          .post('/recipes')
          .withHeaders({ Authorization: `Bearer $S{accessToken}` })
          .withBody({
            ...createRecipeDto,
            title: [],
          })
          .expectStatus(400);
      });
      it('should throw if no description', async () => {
        return pactum
          .spec()
          .post('/recipes')
          .withHeaders({ Authorization: `Bearer $S{accessToken}` })
          .withBody({ ...createRecipeDto, description: undefined })
          .expectStatus(400);
      });
      it('should throw if no ingredients', async () => {
        return pactum
          .spec()
          .post('/recipes')
          .withHeaders({ Authorization: `Bearer $S{accessToken}` })
          .withBody({ ...createRecipeDto, ingredients: undefined })
          .expectStatus(400);
      });
      it('should throw if ingredients is string', async () => {
        return pactum
          .spec()
          .post('/recipes')
          .withHeaders({ Authorization: `Bearer $S{accessToken}` })
          .withBody({ ...createRecipeDto, ingredients: 'invalid' })
          .expectStatus(400);
      });
      it('should throw if ingredients is empty', async () => {
        return pactum
          .spec()
          .post('/recipes')
          .withHeaders({ Authorization: `Bearer $S{accessToken}` })
          .withBody({ ...createRecipeDto, ingredients: [] })
          .expectStatus(400);
      });
      it('should throw if no steps', async () => {
        return pactum
          .spec()
          .post('/recipes')
          .withHeaders({ Authorization: `Bearer $S{accessToken}` })
          .withBody({ ...createRecipeDto, steps: undefined })
          .expectStatus(400);
      });
      it('should throw if steps is string', async () => {
        return pactum
          .spec()
          .post('/recipes')
          .withHeaders({ Authorization: `Bearer $S{accessToken}` })
          .withBody({ ...createRecipeDto, steps: 'invalid' })
          .expectStatus(400);
      });
      it('should throw if steps is empty', async () => {
        return pactum
          .spec()
          .post('/recipes')
          .withHeaders({ Authorization: `Bearer $S{accessToken}` })
          .withBody({ ...createRecipeDto, steps: [] })
          .expectStatus(400);
      });
      it('should create a new recipe', async () => {
        return pactum
          .spec()
          .post('/recipes')
          .withHeaders({ Authorization: `Bearer $S{accessToken}` })
          .withBody(createRecipeDto)
          .expectStatus(201)
          .expectBodyContains('id')
          .stores('recipeId', 'id');
      });
    });
    describe('Get recipe by id', () => {
      it('should throw if recipe id is string', () => {
        return pactum
          .spec()
          .get(`/recipes/abc`)
          .withHeaders({ Authorization: `Bearer $S{accessToken}` })
          .expectStatus(400);
      });
      it('should throw if not logged in', () => {
        return pactum.spec().get(`/recipes/$S{recipeId}`).expectStatus(401);
      });
      it('should return recipe by id', () => {
        return pactum
          .spec()
          .get(`/recipes/{id}`)
          .withPathParams('id', '$S{recipeId}')
          .withHeaders({ Authorization: `Bearer $S{accessToken}` })
          .expectStatus(200)
          .expectBodyContains('$S{recipeId}');
      });
    });
    describe('Get recipes', () => {
      it('should return recipes', () => {
        return pactum
          .spec()
          .get(`/recipes`)
          .withHeaders({ Authorization: `Bearer $S{accessToken}` })
          .expectStatus(200)
          .expectJsonLength(1);
      });
    });
    describe('Edit recipe by id', () => {
      const editRecipeDto: EditRecipeDto = {
        title: 'edited recipe title',
        description: 'edited recipe description',
        ingredients: [
          {
            customIngredient: 'edited ingredient one',
            quantity: 123,
            quantityUnit: 'kg',
          },
          {
            customIngredient: 'edited ingredient two',
            quantity: 321,
            quantityUnit: 'kg',
          },
        ],
        steps: [
          {
            description: 'edited step one',
          },
          {
            description: 'edited step two',
          },
        ],
      };
      it('should throw if not logged in', () => {
        return pactum
          .spec()
          .patch(`/recipes/{id}`)
          .withPathParams('id', '$S{recipeId}')
          .withBody({ ...editRecipeDto })
          .expectStatus(401);
      });
      it('should throw if recipe is not found', () => {
        return pactum
          .spec()
          .patch(`/recipes/{id}`)
          .withPathParams('id', '-1')
          .withHeaders({ Authorization: `Bearer $S{accessToken}` })
          .withBody({ ...editRecipeDto })
          .expectStatus(404);
      });
      it('should throw if recipe id is not number', () => {
        return pactum
          .spec()
          .patch(`/recipes/{id}`)
          .withPathParams('id', 'abc')
          .withHeaders({ Authorization: `Bearer $S{accessToken}` })
          .withBody({ ...editRecipeDto })
          .expectStatus(400);
      });
      it('should throw if user is not the author of the recipe', () => {
        return pactum
          .spec()
          .patch(`/recipes/{id}`)
          .withPathParams('id', '$S{recipeId}')
          .withHeaders({ Authorization: `Bearer $S{accessTokenSecond}` })
          .withBody({ ...editRecipeDto })
          .expectStatus(403);
      });
      it('should edit recipe title', () => {
        return pactum
          .spec()
          .patch(`/recipes/{id}`)
          .withPathParams('id', '$S{recipeId}')
          .withHeaders({ Authorization: `Bearer $S{accessToken}` })
          .withBody({ title: editRecipeDto.title })
          .expectStatus(200)
          .expectBodyContains(editRecipeDto.title);
      });
      it('should edit recipe description', () => {
        return pactum
          .spec()
          .patch(`/recipes/{id}`)
          .withPathParams('id', '$S{recipeId}')
          .withHeaders({ Authorization: `Bearer $S{accessToken}` })
          .withBody({ description: editRecipeDto.description })
          .expectStatus(200)
          .expectBodyContains(editRecipeDto.description);
      });
      it('should throw if ingredients is string', async () => {
        return pactum
          .spec()
          .patch(`/recipes/{id}`)
          .withPathParams('id', '$S{recipeId}')
          .withHeaders({ Authorization: `Bearer $S{accessToken}` })
          .withBody({ ingredients: 'invalid' })
          .expectStatus(400);
      });
      it('should throw if ingredients is empty', async () => {
        return pactum
          .spec()
          .patch(`/recipes/{id}`)
          .withPathParams('id', '$S{recipeId}')
          .withHeaders({ Authorization: `Bearer $S{accessToken}` })
          .withBody({ ingredients: [] })
          .expectStatus(400);
      });
      it('should edit recipe ingredients', () => {
        return pactum
          .spec()
          .patch(`/recipes/{id}`)
          .withPathParams('id', '$S{recipeId}')
          .withHeaders({ Authorization: `Bearer $S{accessToken}` })
          .withBody({ ingredients: editRecipeDto.ingredients })
          .expectStatus(200)
          .expectBodyContains(editRecipeDto.ingredients[0].customIngredient)
          .expectBodyContains(editRecipeDto.ingredients[0].quantity)
          .expectBodyContains(editRecipeDto.ingredients[1].customIngredient)
          .expectBodyContains(editRecipeDto.ingredients[1].quantity);
      });
      it('should throw if steps is string', async () => {
        return pactum
          .spec()
          .patch(`/recipes/{id}`)
          .withPathParams('id', '$S{recipeId}')
          .withHeaders({ Authorization: `Bearer $S{accessToken}` })
          .withBody({ steps: 'invalid' })
          .expectStatus(400);
      });
      it('should throw if steps is empty', async () => {
        return pactum
          .spec()
          .patch(`/recipes/{id}`)
          .withPathParams('id', '$S{recipeId}')
          .withHeaders({ Authorization: `Bearer $S{accessToken}` })
          .withBody({ steps: [] })
          .expectStatus(400);
      });
      it('should edit recipe steps', () => {
        return pactum
          .spec()
          .patch(`/recipes/{id}`)
          .withPathParams('id', '$S{recipeId}')
          .withHeaders({ Authorization: `Bearer $S{accessToken}` })
          .withBody({ steps: editRecipeDto.steps })
          .expectStatus(200)
          .expectBodyContains(editRecipeDto.steps[0].description)
          .expectBodyContains(editRecipeDto.steps[1].description);
      });
      it('should edit title and description at once', () => {
        return pactum
          .spec()
          .patch(`/recipes/{id}`)
          .withPathParams('id', '$S{recipeId}')
          .withHeaders({ Authorization: `Bearer $S{accessToken}` })
          .withBody({
            title: editRecipeDto.title + 'second',
            description: editRecipeDto.description + 'second',
          })
          .expectStatus(200)
          .expectBodyContains(editRecipeDto.title + 'second')
          .expectBodyContains(editRecipeDto.description + 'second');
      });
    });
    describe('Delete recipe by id', () => {
      it('should throw if not logged in', () => {
        return pactum
          .spec()
          .delete(`/recipes/{id}`)
          .withPathParams('id', '$S{recipeId}')
          .expectStatus(401);
      });
      it('should throw if user is not the author of the recipe', () => {
        return pactum
          .spec()
          .delete(`/recipes/{id}`)
          .withPathParams('id', '$S{recipeId}')
          .withHeaders({ Authorization: `Bearer $S{accessTokenSecond}` })
          .expectStatus(403);
      });
      it('should delete recipe by id', () => {
        return pactum
          .spec()
          .delete(`/recipes/{id}`)
          .withPathParams('id', '$S{recipeId}')
          .withHeaders({ Authorization: `Bearer $S{accessToken}` })
          .expectStatus(204);
      });
      it('should throw on attempt to delete a previously deleted recipe', () => {
        return pactum
          .spec()
          .delete(`/recipes/{id}`)
          .withPathParams('id', '$S{recipeId}')
          .withHeaders({ Authorization: `Bearer $S{accessToken}` })
          .expectStatus(404);
      });
      it('should get empty list of recipes', () => {
        return pactum
          .spec()
          .get(`/recipes`)
          .withHeaders({ Authorization: `Bearer $S{accessToken}` })
          .expectStatus(200)
          .expectBody([]);
      });
    });
  });
});
