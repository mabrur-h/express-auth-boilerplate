import * as AWS from 'aws-sdk';
import * as nodemailer from 'nodemailer';
import { type SentMessageInfo } from 'nodemailer';

class EmailService {
  private readonly transport: nodemailer.Transporter;

  constructor() {
    AWS.config.update({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION,
    });

    const ses = new AWS.SES({ apiVersion: '2010-12-01' });
    this.transport = nodemailer.createTransport({
      SES: { ses, aws: AWS },
    });
  }

  public async sendVerificationEmail(
    toAddress: string,
    link: string
  ): Promise<SentMessageInfo> {
    const emailParams = {
      from: 'your-verified-email@example.com',
      to: toAddress,
      subject: 'Verify Your Email',
      html: `<p>Please verify your email by clicking on the link: <a href="${link}">${link}</a></p>`,
    };

    return await this.transport.sendMail(emailParams);
  }
}

export default EmailService;
