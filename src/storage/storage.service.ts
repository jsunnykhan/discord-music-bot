import { HttpCode, HttpException, HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { GetObjectCommand, ListObjectsCommand, PutObjectCommand, S3Client, _Object } from '@aws-sdk/client-s3';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { HttpStatusCode } from 'axios';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class StorageService {
  logger = new Logger(StorageService.name);
  bucket = process.env.AMPLIFY_BUCKET;


  client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
  })


  constructor(@Inject(CACHE_MANAGER) private cacheMenager: Cache) {
    this.getAllFiles()

  }



  async create( file: Express.Multer.File) {
    try {
      const isExisting = !!(await this.findFile(file.originalname)).length
      if (isExisting) {
        throw new HttpException("Already file exist", HttpStatus.CONFLICT);
      }
      const response = await this.client.send(new PutObjectCommand({ Bucket: this.bucket, Key: file.originalname, Body: file.buffer }));
      if (!response) throw response
      this.cacheMenager.set(file.originalname, response.ETag)
      return { message: "success", status: HttpStatus.CREATED };
    } catch (error: any) {
      throw error
    }
  }


  async getAllFiles() {
    const response = await this.client.send(new ListObjectsCommand({ Bucket: this.bucket, }))
    response.Contents?.map((value: _Object) => {
      this.cacheMenager.set(value.Key, value.ETag)
    })
    return response.Contents
  }

  async findFile(name: string) {
    const res = await this.cacheMenager.store.keys();
    return res?.filter((value: string) => value.toLowerCase().includes(name.toLowerCase()))
  }


  async downloadAbleURI(name: string) {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: name,
    });

    try {
      const src = await getSignedUrl(this.client, command)
      if (src) return src
    } catch (error: any) {
      this.logger.error(error)
    }

  }


}
