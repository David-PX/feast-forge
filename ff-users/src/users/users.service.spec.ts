import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './user.entity';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

describe('UsersService', () => {
  let service: UsersService;
  let repository: Repository<User>;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(() => 'test-token'),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should register a user', async () => {
    jest.spyOn(repository, 'save').mockResolvedValue({
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
      password: 'hashed_password',
    } as User);

    jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashed_password');

    const result = await service.register({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
    });

    expect(result).toEqual({
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
      password: 'hashed_password',
    });
  });

  it('should login a user', async () => {
    jest.spyOn(repository, 'findOne').mockResolvedValue({
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
      password: 'hashed_password',
    } as User);

    jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);

    const result = await service.login('test@example.com', 'password123');

    expect(result).toEqual({
      accessToken: 'test-token',
      expiresIn: expect.any(String),
    });
  });

  it('should throw NotFoundException when user does not exist', async () => {
    jest.spyOn(repository, 'findOne').mockResolvedValue(undefined);

    await expect(service.login('notfound@example.com', 'password123')).rejects.toThrow(
      'User not found',
    );
  });
});
