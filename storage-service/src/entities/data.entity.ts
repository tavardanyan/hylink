import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('data_records')
export class DataRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'varchar', length: 50 })
  storageType: 'database' | 'file';

  @Column({ type: 'varchar', length: 500, nullable: true })
  filePath?: string;

  @CreateDateColumn()
  createdAt: Date;
}
