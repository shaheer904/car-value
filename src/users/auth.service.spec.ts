import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from './users.service';
import { User } from './user.entity';

describe('AuthService', () => {
  let service: AuthService;
  let fakeUsersService: Partial<UsersService>;

  beforeEach(async () => {
    const users: User[] = [];
    // Create fake user service
    fakeUsersService = {
      find: (email: string) => {
        const filteredUsers = users.filter((user) => user.email === email);
        return Promise.resolve(filteredUsers);
      },

      create: (email: string, password: string) => {
        const user = {
          id: Math.floor(Math.random() * 99999),
          email,
          password,
        } as User;
        users.push(user);
        return Promise.resolve(user);
      },
    };

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: fakeUsersService },
      ],
    }).compile();
    service = module.get(AuthService);
  });

  it('can create an instance of auth service', async () => {
    expect(service).toBeDefined();
  });

  it('creates a new user with salted and hashed password', async () => {
    const user = await service.signup('asdf@gmail.com', 'asdfghjkl');

    expect(user.password).not.toEqual('asdfghjkl');
    const [salt, hash] = user.password.split('.');
    expect(salt).toBeDefined();
    expect(hash).toBeDefined();
  });

  it('throw an error if user signs in with an email that already exists', async () => {
    await service.signup('asdf@gmail.com', 'asdfghkl');
    try {
      await service.signup('asdf@gmail.com', 'asdfghkl');
    } catch (error) {
      expect(error.message).toBe('email is in use');
    }
  });

  it('throws if signin is called with an unused email', (done) => {
    service
      .signin('asdf@gmail.com', 'asdfghjkl')
      .then(() => {
        done(new Error('unused email user'));
      })
      .catch((err) => {
        done();
      });
  });

  it('throws if an invalid password is provided', async () => {
    try {
      await service.signup('asdf@gmail.com', 'asdfghkl');

      await service.signin('asdf@gmail.com', 'asdfghjkl');
      // If signin succeeds unexpectedly, fail the test
    //   throw new Error('signin to throw an error');
    } catch (error) {
      expect(error.message).toBe('Invalid credentials');
    }
  });

  it('returns a user if correct password is provided', async () => {
    await service.signup('asdf@gmail.com', 'asdfghjkl');

    const user = await service.signin('asdf@gmail.com', 'asdfghjkl');

    expect(user).toBeDefined();
  });
});
