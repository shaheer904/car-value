import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthService } from './auth.service';
import { User } from './user.entity';

describe('UsersController', () => {
  let controller: UsersController;
  let fakeUsersService: Partial<UsersService>;
  let fakeAuthService: Partial<AuthService>;

  beforeEach(async () => {
    fakeUsersService = {
      findOne: (id: number) => {
        return Promise.resolve({
          id,
          email: 'asdf@gmail.com',
          password: 'asdffghjkl',
        } as User);
      },
      find: (email: string) => {
        return Promise.resolve([
          { id: 1, email: email, password: 'asdfg' } as User,
        ]);
      },
      // remove: () => {},
      // update: () => {},
    };
    fakeAuthService = {
      signin: (email: string, password: string) => {
        return Promise.resolve({ id: 1, email, password } as User);
      },
      // signup: () => {},
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useValue: fakeUsersService },
        { provide: AuthService, useValue: fakeAuthService },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findAllUsers and return a list of users with given email', async () => {
    const users = await controller.findAllUsers('asdf@gmail.com');
    expect(users.length).toEqual(1);
    expect(users[0].email).toEqual('asdf@gmail.com');
  });
  it('returns a single user with the given id', async () => {
    const user = await controller.findUser('1');
    expect(user).toBeDefined;
  });
  it('find user throws an error if user with  given id is not found', async () => {
    fakeUsersService.findOne = () => null;

    try {
      await controller.findUser('33');
    } catch (error) {
      expect(error.message).toBe('User not found');
    }
  });

it('signin updates session object and returns user', async()=>{
  const session ={userId:-10}
  const user = await  controller.signin({email:"john@gmail", password:"1234"}, session)

  expect(user.id).toEqual(1);
  expect(session.userId).toEqual(1)
})

});
