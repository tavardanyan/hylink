import { IsString, IsNotEmpty, IsEnum } from 'class-validator';

export enum StorageType {
  DATABASE = 'database',
  FILE = 'file',
}

export class CreateDataDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsEnum(StorageType)
  @IsNotEmpty()
  storageType: StorageType;
}
