import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Get,
  Query,
} from '@nestjs/common';
import { StorageService } from './storage.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { QueryStorageDto } from './dto/query-storage.dto';
import { Interval } from '@nestjs/schedule';

@Controller()
export class StorageController {
  constructor(private readonly storageService: StorageService) { }

  @Post('uploads')
  @UseInterceptors(FileInterceptor('file'))
  async create( @UploadedFile() file: Express.Multer.File) {
   
    return await this.storageService.create( file);
  }


  @Get('songs')
 async getSongs() {
    return await this.storageService.getAllFiles()
  }
  @Get('song')
  async getSong(@Query() query: QueryStorageDto) {
    return await this.storageService.findFile(query.key)
  }

  @Interval(6 * (1000 * (60 * 60)))
  async handleIterval() {
    return await this.storageService.getAllFiles()
  }
}
