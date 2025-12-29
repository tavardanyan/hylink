import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { EmailService } from '../services/email.service';
import { PushNotificationService } from '../services/push-notification.service';

@Controller()
export class NotificationController {
  constructor(
    private readonly emailService: EmailService,
    private readonly pushNotificationService: PushNotificationService,
  ) {}

  @EventPattern('data_created')
  async handleDataCreated(@Payload() data: any) {
    console.log('Received data_created event:', data);

    try {
      if (data.storageType === 'database') {
        console.log('Sending push notification for database storage...');
        await this.pushNotificationService.sendDatabaseStorageNotification(
          data,
        );
        console.log('Push notification sent successfully');
      } else if (data.storageType === 'file') {
        console.log('Sending email for file storage...');
        await this.emailService.sendFileStorageNotification(data);
        console.log('Email sent successfully');
      }
    } catch (error) {
      console.error('Error processing notification:', error);
    }
  }
}
