import { VoiceConnection, joinVoiceChannel } from '@discordjs/voice';
import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Message } from 'discord.js';
import { MusicTrackDto } from './discord-bot.dto';

@Injectable()
export class DiscordBotService {
  private readonly logger = new Logger(DiscordBotService.name);
  /* constructor() {}

  async findMusicTrack(track: string): Promise<MusicTrackDto> {
    this.logger.log(track);
    const options = {
      method: 'GET',
      url: 'http://localhost:3000/api/upload-file',
      params: { key: track },
    };
    try {
      const response = await axios.request(options);
      if (response.status === 200) {
        return {
          url: response.data,
        };
      }
    } catch (error: any) {
      this.logger.error('Error from axios', error);
      throw 'Something went wrong';
    }
  } */

  async joinVoiceChannel(message: Message): Promise<VoiceConnection> {
    return joinVoiceChannel({
      channelId: message.member.voice.channel.id,
      guildId: message.guild.id,
      adapterCreator: message.guild.voiceAdapterCreator,
    });
  }


  async customButtonList(files: Array<string>, message: Message | any): Promise<string> {

    const components = files.map((value: string) => new ButtonBuilder()
      .setCustomId(value)
      .setLabel(value)
      .setStyle(ButtonStyle.Primary,))

    const row = new ActionRowBuilder()
      .addComponents(components);

    const response = await message.reply({ components: [row] });

    const collectorFilter = (i: any) => i.user.id === message.author?.id;

    try {
      const confirmation = await response.awaitMessageComponent({ filter: collectorFilter, time: 60_000 });
      if (confirmation.customId.length) {
        await confirmation.update({ content: 'Playing ....', components: [] })
        return confirmation.customId
      }

    } catch (e: any) {
      return ''
    }

  }
}
