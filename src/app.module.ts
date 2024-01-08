import { Module } from '@nestjs/common';
import { MyConfigModule } from './config.module';

@Module({
  imports: [MyConfigModule],
})
export class AppModule {}
