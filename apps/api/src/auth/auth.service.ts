import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import * as argon2 from 'argon2';
import { createHmac } from 'node:crypto';
import { Response, Request } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import {
  ACCESS_TOKEN_COOKIE,
  ACCESS_TOKEN_TTL_SECONDS,
  REFRESH_TOKEN_COOKIE,
  REFRESH_TOKEN_TTL_SECONDS,
} from './auth.constants';
import { RegisterDto } from './dto/register.dto';
import { AuthUser } from './types/auth-user.type';
import { JwtPayload } from './types/jwt-payload.type';
import { GoogleUser } from './strategies/google.strategy';

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

interface CookieOptions {
  httpOnly: boolean;
  sameSite: 'lax' | 'strict';
  secure: boolean;
  path: string;
  maxAge: number;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto, response: Response): Promise<{ user: AuthUser }> {
    const email = dto.email.trim().toLowerCase();
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException('User already exists');
    }

    const passwordHash = await argon2.hash(dto.password);
    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        provider: 'local',
        name: dto.name?.trim() || null,
        isEmailVerified: false,
      },
    });

    await this.issueAuthCookies(user, response);
    return { user: this.toAuthUser(user) };
  }

  async validateLocalUser(email: string, password: string): Promise<AuthUser> {
    const user = await this.prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValid = await argon2.verify(user.passwordHash, password);
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.toAuthUser(user);
  }

  async login(userId: string, response: Response): Promise<{ user: AuthUser }> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    await this.issueAuthCookies(user, response);
    return { user: this.toAuthUser(user) };
  }

  async loginWithGoogle(profile: GoogleUser, response: Response): Promise<string> {
    const email = profile.email.toLowerCase();
    let user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email,
          provider: 'google',
          providerId: profile.providerId,
          name: profile.name,
          avatarUrl: profile.avatarUrl,
          isEmailVerified: true,
        },
      });
    } else if (user.provider === 'google' && !user.providerId) {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          providerId: profile.providerId,
          name: user.name ?? profile.name,
          avatarUrl: user.avatarUrl ?? profile.avatarUrl,
          isEmailVerified: true,
        },
      });
    }

    await this.issueAuthCookies(user, response);
    return this.configService.get<string>('WEB_AUTH_SUCCESS_REDIRECT', 'http://localhost:3000/');
  }

  async refresh(request: Request, response: Response): Promise<{ user: AuthUser }> {
    const rawRefreshToken = this.extractRefreshTokenFromRequest(request);
    const payload = this.verifyRefreshToken(rawRefreshToken);
    const tokenHash = this.hashRefreshToken(rawRefreshToken);

    const storedToken = await this.prisma.refreshToken.findFirst({
      where: {
        userId: payload.sub,
        tokenHash,
      },
    });

    if (!storedToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (storedToken.revokedAt) {
      await this.revokeAllUserTokens(payload.sub);
      this.clearAuthCookies(response);
      throw new UnauthorizedException('Refresh token reuse detected');
    }

    if (storedToken.expiresAt.getTime() <= Date.now()) {
      await this.prisma.refreshToken.update({
        where: { id: storedToken.id },
        data: { revokedAt: new Date() },
      });
      this.clearAuthCookies(response);
      throw new UnauthorizedException('Refresh token expired');
    }

    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const tokens = await this.generateTokenPair(user);
    const newTokenRecord = await this.storeRefreshToken(user.id, tokens.refreshToken);

    await this.prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: {
        revokedAt: new Date(),
        replacedByTokenId: newTokenRecord.id,
      },
    });

    this.setAuthCookies(response, tokens);
    return { user: this.toAuthUser(user) };
  }

  async logout(request: Request, response: Response): Promise<{ success: boolean }> {
    const rawRefreshToken = request.cookies?.[REFRESH_TOKEN_COOKIE] as string | undefined;
    if (rawRefreshToken) {
      const tokenHash = this.hashRefreshToken(rawRefreshToken);
      await this.prisma.refreshToken.updateMany({
        where: {
          tokenHash,
          revokedAt: null,
        },
        data: {
          revokedAt: new Date(),
        },
      });
    }

    this.clearAuthCookies(response);
    return { success: true };
  }

  async me(userId: string): Promise<{ user: AuthUser }> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return { user: this.toAuthUser(user) };
  }

  private async issueAuthCookies(user: User, response: Response): Promise<void> {
    const tokens = await this.generateTokenPair(user);
    await this.storeRefreshToken(user.id, tokens.refreshToken);
    this.setAuthCookies(response, tokens);
  }

  private async generateTokenPair(user: User): Promise<TokenPair> {
    const accessPayload: JwtPayload = {
      sub: user.id,
      email: user.email,
      type: 'access',
    };

    const refreshPayload: JwtPayload = {
      sub: user.id,
      email: user.email,
      type: 'refresh',
    };

    const accessSecret = this.configService.get<string>('JWT_ACCESS_SECRET', 'dev-access-secret');
    const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET', 'dev-refresh-secret');

    const accessTokenTtlSeconds = Number(
      this.configService.get<string>('JWT_ACCESS_TTL_SECONDS', String(ACCESS_TOKEN_TTL_SECONDS)),
    );
    const refreshTokenTtlSeconds = Number(
      this.configService.get<string>('JWT_REFRESH_TTL_SECONDS', String(REFRESH_TOKEN_TTL_SECONDS)),
    );

    const accessToken = await this.jwtService.signAsync(accessPayload, {
      secret: accessSecret,
      expiresIn: accessTokenTtlSeconds,
    });

    const refreshToken = await this.jwtService.signAsync(refreshPayload, {
      secret: refreshSecret,
      expiresIn: refreshTokenTtlSeconds,
    });

    return { accessToken, refreshToken };
  }

  private async storeRefreshToken(userId: string, refreshToken: string) {
    const payload = this.verifyRefreshToken(refreshToken);
    const exp = payload && 'exp' in payload ? (payload.exp as number | undefined) : undefined;
    if (!exp) {
      throw new BadRequestException('Invalid refresh token expiration');
    }

    return this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash: this.hashRefreshToken(refreshToken),
        expiresAt: new Date(exp * 1000),
      },
    });
  }

  private verifyRefreshToken(token: string): JwtPayload & { exp?: number } {
    try {
      const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET', 'dev-refresh-secret');
      const payload = this.jwtService.verify<JwtPayload & { exp?: number }>(token, {
        secret: refreshSecret,
      });
      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Invalid refresh token type');
      }
      return payload;
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private hashRefreshToken(token: string): string {
    const hashSecret = this.configService.get<string>('REFRESH_TOKEN_HASH_SECRET', 'dev-refresh-token-hash-secret');
    return createHmac('sha256', hashSecret).update(token).digest('hex');
  }

  private setAuthCookies(response: Response, tokens: TokenPair): void {
    const accessTokenTtlSeconds = Number(
      this.configService.get<string>('JWT_ACCESS_TTL_SECONDS', String(ACCESS_TOKEN_TTL_SECONDS)),
    );
    const refreshTokenTtlSeconds = Number(
      this.configService.get<string>('JWT_REFRESH_TTL_SECONDS', String(REFRESH_TOKEN_TTL_SECONDS)),
    );

    response.cookie(
      ACCESS_TOKEN_COOKIE,
      tokens.accessToken,
      this.buildCookieOptions(accessTokenTtlSeconds * 1000),
    );
    response.cookie(
      REFRESH_TOKEN_COOKIE,
      tokens.refreshToken,
      this.buildCookieOptions(refreshTokenTtlSeconds * 1000),
    );
  }

  private clearAuthCookies(response: Response): void {
    const baseOptions = this.buildCookieOptions(0);
    response.clearCookie(ACCESS_TOKEN_COOKIE, {
      ...baseOptions,
      maxAge: undefined,
    });
    response.clearCookie(REFRESH_TOKEN_COOKIE, {
      ...baseOptions,
      maxAge: undefined,
    });
  }

  private buildCookieOptions(maxAge: number): CookieOptions {
    const isProduction = this.configService.get<string>('NODE_ENV') === 'production';
    return {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge,
    };
  }

  private async revokeAllUserTokens(userId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: {
        userId,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });
  }

  private extractRefreshTokenFromRequest(request: Request): string {
    const token = request.cookies?.[REFRESH_TOKEN_COOKIE] as string | undefined;
    if (!token) {
      throw new UnauthorizedException('Refresh token is required');
    }

    return token;
  }

  private toAuthUser(user: User): AuthUser {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      provider: user.provider,
      createdAt: user.createdAt.toISOString(),
    };
  }
}
