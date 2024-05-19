import { Module } from '@nestjs/common';
import { DiscordModule } from '@discord-nestjs/core';
import { GatewayIntentBits } from 'discord.js';
import { ConfigModule } from '@nestjs/config';
import { DiscordBotGateway } from './discord-bot/discord-bot.gateway';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { DiscordBotService } from './discord-bot/discord-bot.service';
import { DiscordBotModule } from './discord-bot/discord-bot.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ServeStaticModule.forRootAsync({
      useFactory: () => {
        const musicPath = join(__dirname, '..', 'music');
        return [
          {
            rootPath: musicPath,
            serveRoot: '/music/',
          },
        ];
      },
    }),
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
  ],
  controllers: [],
  providers: [DiscordBotGateway, DiscordBotService],
})
export class AppModule {}
