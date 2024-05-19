import { InjectDiscordClient, On, Once } from '@discord-nestjs/core';
import {
  createAudioPlayer,
  createAudioResource,
  AudioPlayer,
  generateDependencyReport,
  StreamType,
} from '@discordjs/voice';
import { Injectable, Logger } from '@nestjs/common';
import { Client, Message } from 'discord.js';
import { DiscordBotService } from './discord-bot.service';
import { MusicTrackDto } from './discord-bot.dto';

@Injectable()
export class DiscordBotGateway {
  private readonly logger = new Logger(DiscordBotGateway.name);
  private player: AudioPlayer;

  constructor(
    @InjectDiscordClient()
    private readonly client: Client,

    private readonly service: DiscordBotService,
  ) {
    this.player = createAudioPlayer();
  }

  @Once('ready')
  onReady() {
    this.logger.log(`Bot ${this.client.user.tag} is started`);
    console.log(generateDependencyReport());
  }

  @On('messageCreate')
  async onMessage(message: Message): Promise<void> {
    if (!message.author.bot) {
      if (message.content.includes('!join')) {
        const connection = await this.service.joinVoiceChannel(message);
        connection.subscribe(this.player);
      }

      if (message.content.startsWith('!play')) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const [_, ...rest] = message.content.split(' ');
        const track = [...rest].join(' ');
        if (!track.length) return;

        const component = await message.reply({
          content: `Searching ${rest}`,
          components: [],
        });

        const audio: MusicTrackDto = await this.service.findMusicTrack(track);

        if (audio) {
          const connection = await this.service.joinVoiceChannel(message);
          connection.subscribe(this.player);
          this.player.play(
            createAudioResource(audio.url, {
              inputType: StreamType.Opus,
              inlineVolume: true,
            }),
          );
          await component.edit({
            content: `Playing ${audio.name}`,
            components: [],
          });
        }
      }

      if (message.content.includes('!stop')) {
        this.player.stop();
      }

      if (message.content.includes('!pause')) {
        this.player.pause();
      }
      if (message.content === '!start') {
        this.player.unpause();
      }
    }
  }
}
