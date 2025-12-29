import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import * as fs from 'fs';

@Injectable()
export class PushNotificationService implements OnModuleInit {
  constructor(private configService: ConfigService) {}

  onModuleInit() {
    try {
      const serviceAccountPath = this.configService.get<string>(
        'FIREBASE_SERVICE_ACCOUNT_PATH',
      );

      if (serviceAccountPath && fs.existsSync(serviceAccountPath)) {
        const serviceAccount = JSON.parse(
          fs.readFileSync(serviceAccountPath, 'utf8'),
        );

        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });

        console.log('Firebase Admin initialized successfully');
      } else {
        console.warn(
          'Firebase service account file not found. Push notifications will not work.',
        );
      }
    } catch (error) {
      console.error('Error initializing Firebase Admin:', error.message);
    }
  }

  async sendPushNotification(
    token: string,
    title: string,
    body: string,
    data?: any,
  ) {
    try {
      const message = {
        notification: {
          title,
          body,
        },
        data: data || {},
        token,
      };

      const response = await admin.messaging().send(message);
      console.log('Push notification sent successfully:', response);
      return { success: true, response };
    } catch (error) {
      console.error('Error sending push notification:', error);
      throw error;
    }
  }

  async sendDatabaseStorageNotification(data: any, deviceToken?: string) {
    const title = `Data Stored: ${data.title}`;
    const body = `New data has been stored in the database: ${data.description}`;

    const notificationData = {
      id: data.id,
      storageType: data.storageType,
      createdAt: data.createdAt,
    };

    if (!deviceToken) {
      console.log(
        'Device token not provided. Would send push notification with:',
        { title, body, data: notificationData },
      );
      return {
        success: true,
        message: 'Notification logged (no device token provided)',
      };
    }

    return this.sendPushNotification(title, body, deviceToken, notificationData);
  }

  async sendToMultipleDevices(
    tokens: string[],
    title: string,
    body: string,
    data?: any,
  ) {
    try {
      const message = {
        notification: {
          title,
          body,
        },
        data: data || {},
        tokens,
      };

      const response = await admin.messaging().sendEachForMulticast(message);
      console.log(
        `Push notifications sent: ${response.successCount} successful, ${response.failureCount} failed`,
      );
      return { success: true, response };
    } catch (error) {
      console.error('Error sending push notifications:', error);
      throw error;
    }
  }
}
