import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectConnection } from '@nestjs/mongoose';
import { connection, Connection } from 'mongoose';
import { User, UserSchema } from '../models/user.schema';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectConnection() private connection: Connection,
  ) {}

  async registration(dto: CreateUserDto) {
    try {
      const db = await AuthService.connectToUser(connection);
      const User = db.model('User', UserSchema);

      const candidate = await User.findOne({
        name: dto.name,
      }).exec();

      console.log(candidate);

      if (candidate) {
        throw new HttpException(
          'User with this email has already exist',
          HttpStatus.BAD_REQUEST,
        );
      }
      const hashPassword = await bcrypt.hash(dto.password, 5);
      const user: any = await User.create({
        ...dto,
        password: hashPassword,
      });

      return this.generateToken(user);
    } catch (e) {
      throw new HttpException(e.message, e.status);
    }
  }

  async login(userDto: CreateUserDto) {
    try {
      const db = await AuthService.connectToUser(connection);
      const User = db.model('User', UserSchema);

      const user: any = await User.findOne({ name: userDto.name }).exec();
      if (!user) {
        throw new HttpException(
          'User with this username does not exist',
          HttpStatus.NOT_FOUND,
        );
      }
      const passwordEquals = await bcrypt.compare(
        userDto.password,
        user.password,
      );

      if (passwordEquals) return this.generateToken(user);
      throw new UnauthorizedException({
        message: 'Incorrect name or password',
      });
    } catch (e) {
      throw new HttpException(e.message, e.status);
    }
  }

  private async generateToken(user: any) {
    const payload = { name: user.name, role: user.role };
    return {
      token: this.jwtService.sign(payload),
    };
  }

  private static async connectToUser(connection: Connection) {
    await connection.close();

    return await connection.openUri(process.env.HOST + 'users', {
      useCreateIndex: true,
      useFindAndModify: false,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  }
}
