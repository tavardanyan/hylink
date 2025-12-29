import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientProxy } from '@nestjs/microservices';
import { DataRecord } from '../entities/data.entity';
import { CreateDataDto, StorageType } from '../dto/create-data.dto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class StorageService {
  private uploadDir: string;

  constructor(
    @InjectRepository(DataRecord)
    private dataRepository: Repository<DataRecord>,
    @Inject('NOTIFICATION_SERVICE') private client: ClientProxy,
  ) {
    this.uploadDir = process.env.UPLOAD_DIR || './uploads';
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async createDataRecord(
    createDataDto: CreateDataDto,
    file?: Express.Multer.File,
  ): Promise<DataRecord> {
    let filePath: string | undefined;

    if (createDataDto.storageType === StorageType.FILE && file) {
      const fileName = `${Date.now()}-${file.originalname}`;
      filePath = path.join(this.uploadDir, fileName);
      fs.writeFileSync(filePath, file.buffer);
    }

    const dataRecord = this.dataRepository.create({
      title: createDataDto.title,
      description: createDataDto.description,
      storageType: createDataDto.storageType,
      filePath: filePath,
    });

    const savedRecord = await this.dataRepository.save(dataRecord);

    const notificationPayload = {
      id: savedRecord.id,
      title: savedRecord.title,
      description: savedRecord.description,
      storageType: savedRecord.storageType,
      filePath: savedRecord.filePath,
      createdAt: savedRecord.createdAt,
    };

    this.client.emit('data_created', notificationPayload);

    return savedRecord;
  }

  async getAllRecords(): Promise<DataRecord[]> {
    return this.dataRepository.find();
  }

  async getRecordById(id: string): Promise<DataRecord | null> {
    return this.dataRepository.findOne({ where: { id } });
  }
}
