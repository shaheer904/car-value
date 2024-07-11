import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { promisify } from 'util';
import { randomBytes, scrypt as _scrypt } from 'crypto';

const scrypt = promisify(_scrypt);
@Injectable()
export class AuthService {
  constructor(private userService: UsersService) {}

  async signup(email: string, password: string) {
    //see if email is in use
    const users = await this.userService.find(email);
    if (users.length) {
      throw new BadRequestException('email is in use');
    }
    //generate salt
    const salt = randomBytes(8).toString('hex');
    //hash password
    const hash = (await scrypt(password, salt, 32)) as Buffer;

    //join the hash result and salt together
    const result = salt + '.' + hash.toString('hex');
    // create a new user
    const user = await this.userService.create(email, result);
    //return user
    return user;
  }

  async signin(email: string, password: string) {
    const [user] = await this.userService.find(email);
    // console.log(user)

    if (!user) {
      throw new NotFoundException('User not found');
    }
    const [salt, storedHash] = await user.password.split('.');
    const hash = (await scrypt(password, salt, 32)) as Buffer;
    if (storedHash !== hash.toString('hex')) {
      throw new BadRequestException('Invalid credentials');
    }
    return user;
  }
}
