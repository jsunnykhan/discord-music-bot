import { InjectDiscordClient, On, Once } from '@discord-nestjs/core';
import {
  createAudioPlayer,
  AudioPlayer,
  generateDependencyReport,
  createAudioResource,
  StreamType,
} from '@discordjs/voice';
import { Injectable, Logger } from '@nestjs/common';
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Client,
  Message,
} from 'discord.js';
import { DiscordBotService } from './discord-bot.service';
import { StorageService } from 'src/storage/storage.service';

@Injectable()
export class DiscordBotGateway {
  private readonly logger = new Logger(DiscordBotGateway.name);
  private player: AudioPlayer;

  constructor(
    @InjectDiscordClient()
    private readonly client: Client,

    private readonly service: DiscordBotService,

    private readonly fileService: StorageService,
  ) {
    this.player = createAudioPlayer();
  }

  @Once('ready')
  onReady() {
    this.logger.log(`Bot ${this.client.user.tag} is started`);
    console.log(generateDependencyReport());
  }

  @On('messageCreate')
  async onMessage(message: Message | any): Promise<void> {
    if (!message.author.bot) {
      if (message.content.includes('!join')) {
        const connection = await this.service.joinVoiceChannel(message);
        connection.subscribe(this.player);
      } else if (message.content.startsWith('!play')) {
        const [_g, ...key] = message.content.split(' ');
        const track = [...key].join(' ');
        if (!track.length) return;

        const component = await message.reply({
          content: `Searching ${key}`,
          components: [],
        });

        const files = await this.fileService.findFile(key.toString());
        if (files) {
          const file: string = await this.service.customButtonList(
            files,
            message,
          );

          const uri = await this.fileService.downloadAbleURI(file);
          if (uri) {
            const connection = await this.service.joinVoiceChannel(message);
            connection.subscribe(this.player);
            this.player.play(
              createAudioResource(uri, {
                inputType: StreamType.Opus,
                inlineVolume: true,
              }),
            );
          }
          await component.edit({
            content: `Playing ${file}`,
            components: [],
          });
        }
      } else if (message.content.includes('!leave')) {
      } else if (message.content.includes('!stop')) {
        this.player.stop();
      } else if (message.content.includes('!pause')) {
        this.player.pause();
      } else if (message.content === '!start') {
        this.player.unpause();
      }
    }
  }
}
