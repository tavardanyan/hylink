import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseInterceptors,
  UploadedFile,
  ValidationPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { StorageService } from './storage.service';
import { CreateDataDto } from '../dto/create-data.dto';

@Controller('data')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async createData(
    @Body(new ValidationPipe()) createDataDto: CreateDataDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const record = await this.storageService.createDataRecord(
      createDataDto,
      file,
    );
    return {
      success: true,
      message: 'Data stored successfully',
      data: record,
    };
  }

  @Get()
  async getAllData() {
    const records = await this.storageService.getAllRecords();
    return {
      success: true,
      data: records,
    };
  }

  @Get(':id')
  async getDataById(@Param('id') id: string) {
    const record = await this.storageService.getRecordById(id);
    return {
      success: true,
      data: record,
    };
  }
}
