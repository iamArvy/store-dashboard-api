import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtStrategy } from './strategies';
import { ControllerModule } from './controller/controller.module';
import { ResolverModule } from './resolver/resolver.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ControllerModule,
    ResolverModule,
  ],
  providers: [JwtStrategy],
})
export class AppModule {}
