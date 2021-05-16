import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { connection, Connection, Document, Model } from 'mongoose';
import { UserSchema, UserDocument, User } from '../models/user.schema';
import { HttpException } from '@nestjs/common';
import { HttpStatus } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectConnection() private connection: Connection,
  ) {}

  async registration(dto: CreateUserDto) {
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
  }

  async login(userDto: CreateUserDto) {
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
    throw new UnauthorizedException({ message: 'Incorrect name or password' });
  }

  private async generateToken(user: any) {
    const payload = { name: user.name, role: user.role };
    return {
      token: this.jwtService.sign(payload),
    };
  }

  private static async connectToUser(connection: Connection) {
    await connection.close();

    const db = await connection.openUri(process.env.HOST + 'users', {
      useCreateIndex: true,
      useFindAndModify: false,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    return db;
  }
}
