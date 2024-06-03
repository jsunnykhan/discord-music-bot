import { Module } from '@nestjs/common';
import { DiscordBotService } from './discord-bot.service';
import { StorageService } from 'src/storage/storage.service';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  providers: [DiscordBotService],
})
export class DiscordBotModule { }
