import { HttpException } from '@nestjs/common';
import { HttpStatus } from '@nestjs/common';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { ROLES_KEY } from './roles.decorator';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private jwtService: JwtService, private reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true;
    }

    const req = context.switchToHttp().getRequest();
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new HttpException(
        'User is not authorized',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const token = authHeader.split(' ')[1];

    let user;

    try {
      user = this.jwtService.verify(token);
    } catch (e) {
      throw new HttpException('Invalid token', HttpStatus.BAD_REQUEST);
    }

    req.user = user;

    const valid = requiredRoles.includes(user.role);
    if (!valid) {
      throw new HttpException(
        `Required roles is [${requiredRoles}]`,
        HttpStatus.FORBIDDEN,
      );
    } else {
      return true;
    }
  }
}
