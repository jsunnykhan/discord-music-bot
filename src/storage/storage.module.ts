import { Module } from '@nestjs/common';
import { StorageService } from './storage.service';
import { StorageController } from './storage.controller';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  controllers: [StorageController],
  providers: [StorageService],
  imports: [CacheModule.register({
    ttl: 6 * (1000 * (60 * 60))
  })],
  exports: [StorageService]
})
export class StorageModule { }
