import * as nodemailer from "nodemailer";
import {SentMessageInfo} from "nodemailer";

export class Mailer {
  constructor(private host: string, private port: number, private user: string, private password: string, private from: string) {
  }

  public async sendMail(to: string, bcc: string, subject: string, text: string, html: string): Promise<SentMessageInfo> {
    const transport = nodemailer.createTransport({
      host: this.host,
      port: this.port,
      secure: true,
      auth: {
        user: this.user,
        password: this.password
      }
    });
    return await transport.sendMail({
      from: this.from,
      to,
      subject,
      text,
      html,
    });
  }

}
