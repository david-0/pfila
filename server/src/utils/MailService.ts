import * as fs from "fs";
import * as nodemailer from "nodemailer";
import { SentMessageInfo } from "nodemailer";

import { configure, getLogger, Logger } from "log4js";

const LOGGER: Logger = getLogger("Server");
export class MailService {
  private host: string;
  private port: number;
  private user: string;
  private password: string;
  private from: string

  constructor(configFile: string) {
    if (fs.existsSync(configFile)) {
      const buffer = fs.readFileSync(configFile);
      const config = JSON.parse(buffer.toString());
      this.host = config.host;
      this.port = +config.port;
      this.user = config.user;
      this.password = config.password;
      this.from = config.from;
    }
  }
  public async sendMail(to: string, subject: string, text: string, html: string): Promise<SentMessageInfo> {
    try {
      return await this.trySendMail(to, subject, text, html);
    } catch (err) {
      LOGGER.error("Could not send email. Error:"+err);
      return Promise.resolve(err);
    }
  }
  private async trySendMail(to: string, subject: string, text: string, html: string): Promise<SentMessageInfo> {
    if (this.host === undefined) {
      return;
    }
    const transporter = nodemailer.createTransport({
      host: this.host,
      port: this.port,
      auth: {
        user: this.user,
        pass: this.password
      },
    });
    return await transporter.sendMail({
      from: this.from,
      to,
      subject,
      text,
      html,
    });
  }

}
