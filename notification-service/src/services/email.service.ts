import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('EMAIL_HOST') || 'smtp.gmail.com',
      port: this.configService.get<number>('EMAIL_PORT') || 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: this.configService.get<string>('EMAIL_USER'),
        pass: this.configService.get<string>('EMAIL_PASSWORD'),
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  async sendEmail(to: string, subject: string, text: string, html?: string) {
    try {
      const mailOptions = {
        from: this.configService.get<string>('EMAIL_FROM'),
        to,
        subject,
        text,
        html: html || text,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  async sendFileStorageNotification(data: any) {
    const subject = `File Stored: ${data.title}`;
    const text = `A new file has been stored.\n\nTitle: ${data.title}\nDescription: ${data.description}\nFile Path: ${data.filePath}\nCreated At: ${new Date(data.createdAt).toLocaleString()}`;
    const html = `
      <h2>File Storage Notification</h2>
      <p>A new file has been stored in the system.</p>
      <ul>
        <li><strong>Title:</strong> ${data.title}</li>
        <li><strong>Description:</strong> ${data.description}</li>
        <li><strong>File Path:</strong> ${data.filePath}</li>
        <li><strong>Created At:</strong> ${new Date(data.createdAt).toLocaleString()}</li>
      </ul>
    `;

    return this.sendEmail(
      this.configService.get<string>('EMAIL_USER') || 'test@example.com',
      subject,
      text,
      html,
    );
  }
}
