import "reflect-metadata";
import { MailService } from "./utils/MailService";

export const AppMailService = new MailService("../../configuration/smtp.json");
