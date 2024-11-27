import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { CreateUserDto } from '../dtos/create-user.dto';
import { JwtService } from '@nestjs/jwt';
import logger from '../../utils/logger';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(createUserDto: CreateUserDto): Promise<User> {
    try {
      const { username, email, password } = createUserDto;

      logger.info(`Registering user with email: ${email}`);

      const newUser = this.usersRepository.create({
        username,
        email,
        password,
      });

      const savedUser = await this.usersRepository.save(newUser);
      logger.info(`User with email ${email} registered successfully`);
      return savedUser;
    } catch (error) {
      logger.error(`Error registering user: ${error.message}`);
      throw new BadRequestException('Error registering user');
    }
  }

  async login(
    email: string,
    password: string,
  ): Promise<{ accessToken: string; expiresIn: string }> {
    try {
      logger.info(`Logging in user with email: ${email}`);
      const user = await this.usersRepository.findOne({ where: { email } });

      if (!user) {
        logger.warn(`User with email ${email} not found`);
        throw new NotFoundException('User not found');
      }

      if (user.password !== password) {
        logger.warn(`Invalid credentials for user with email ${email}`);
        throw new BadRequestException('Invalid credentials');
      }

      const payload = { username: user.username, sub: user.id };
      const accessToken = this.jwtService.sign(payload);
      const expiresIn = new Date(Date.now() + 3600000).toUTCString();

      // return the token and the expiration date
      logger.info('User logged in successfully', { email });
      return { accessToken, expiresIn };
    } catch (error) {
      logger.error(`Error logging in user: ${error.message}`);
      throw new BadRequestException('Error logging in user');
    }
  }
}
