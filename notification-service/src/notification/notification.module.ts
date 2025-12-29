import { Module } from '@nestjs/common';
import { NotificationController } from './notification.controller';
import { EmailService } from '../services/email.service';
import { PushNotificationService } from '../services/push-notification.service';

@Module({
  controllers: [NotificationController],
  providers: [EmailService, PushNotificationService],
})
export class NotificationModule {}
