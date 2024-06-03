import { Module } from '@nestjs/common';
import { DiscordModule } from '@discord-nestjs/core';
import { GatewayIntentBits } from 'discord.js';
import { ConfigModule } from '@nestjs/config';
import { DiscordBotGateway } from './discord-bot/discord-bot.gateway';
import { DiscordBotService } from './discord-bot/discord-bot.service';
import { DiscordBotModule } from './discord-bot/discord-bot.module';
import { StorageModule } from './storage/storage.module';
import { CacheModule } from '@nestjs/cache-manager';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule.forRoot(),
    CacheModule.register(),
    ScheduleModule.forRoot(),
    DiscordModule.forRootAsync({
      useFactory: () => ({
        token: process.env.DISCORD_BOT_TOKEN,
        discordClientOptions: {
          intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.MessageContent,
            GatewayIntentBits.GuildVoiceStates,
          ],
        },
      }),
    }),
    DiscordModule,
    DiscordBotModule,
    StorageModule,
  ],
  controllers: [],
  providers: [DiscordBotGateway, DiscordBotService],
})
export class AppModule { }
