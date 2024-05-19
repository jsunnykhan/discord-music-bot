import { VoiceConnection, joinVoiceChannel } from '@discordjs/voice';
import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { Message } from 'discord.js';
import { MusicTrackDto } from './discord-bot.dto';

@Injectable()
export class DiscordBotService {
  private readonly logger = new Logger(DiscordBotService.name);
  constructor() {}

  async findMusicTrack(track: string): Promise<MusicTrackDto> {
    const options = {
      method: 'GET',
      url: 'https://spotify-scraper.p.rapidapi.com/v1/track/download',
      params: { track },
      headers: {
        'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
        'X-RapidAPI-Host': process.env.RAPIDAPI_HOST,
      },
    };
    try {
      const response = await axios.request(options);
      
      return {
        name: response.data.youtubeVideo.title,
        url: response.data.youtubeVideo.audio[0].url,
      };
    } catch (error: any) {
      this.logger.error('Error from axios', error);
    }
  }

  async joinVoiceChannel(message: Message): Promise<VoiceConnection> {
    return joinVoiceChannel({
      channelId: message.member.voice.channel.id,
      guildId: message.guild.id,
      adapterCreator: message.guild.voiceAdapterCreator,
    });
  }
}
