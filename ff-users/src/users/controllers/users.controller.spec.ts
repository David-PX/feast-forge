import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from '../services/users.service';
import { LoginUserDto } from '../dtos/login-user.dto';
import { CreateUserDto } from '../dtos/create-user.dto';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            register: jest.fn(),
            login: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should call UsersService.register', async () => {
    const createUserDto: CreateUserDto = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
    };

    const result = {
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
      password: 'hashed_password',
    };

    jest.spyOn(service, 'register').mockResolvedValue(result);

    expect(await controller.register(createUserDto)).toEqual(result);
    expect(service.register).toHaveBeenCalledWith(createUserDto);
  });

  it('should call UsersService.login', async () => {
    const loginUserDto: LoginUserDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    const result = {
      accessToken: 'test-token',
      expiresIn: '2024-12-31T23:59:59Z',
    };

    jest.spyOn(service, 'login').mockResolvedValue(result);

    expect(await controller.login(loginUserDto)).toEqual(result);
    expect(service.login).toHaveBeenCalledWith(
      loginUserDto.email,
      loginUserDto.password,
    );
  });
});
