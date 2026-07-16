import "server-only";
import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";
import { env } from "@/lib/env";
import { logger } from "@/lib/logging/logger";

export type EmailMessage = {
  to: string;
  subject: string;
  html: string;
  text: string;
  locale: "de" | "en";
};
export interface EmailProvider {
  send(message: EmailMessage): Promise<{ messageId: string }>;
}
export class ConsoleEmailProvider implements EmailProvider {
  async send(message: EmailMessage) {
    logger.info("email_preview", {
      locale: message.locale,
    });
    return { messageId: `console-${crypto.randomUUID()}` };
  }
}
export class SesEmailProvider implements EmailProvider {
  private readonly client = new SESv2Client({ region: env.AWS_REGION });
  async send(message: EmailMessage) {
    if (!env.AWS_SES_FROM_EMAIL)
      throw new Error("SES_FROM_EMAIL_NOT_CONFIGURED");
    const command = new SendEmailCommand({
      FromEmailAddress: env.AWS_SES_FROM_EMAIL,
      Destination: { ToAddresses: [message.to] },
      Content: {
        Simple: {
          Subject: { Data: message.subject, Charset: "UTF-8" },
          Body: {
            Html: { Data: message.html, Charset: "UTF-8" },
            Text: { Data: message.text, Charset: "UTF-8" },
          },
        },
      },
    });
    let lastError: unknown;
    for (let attempt = 1; attempt <= 3; attempt += 1) {
      try {
        const result = await this.client.send(command);
        const messageId = result.MessageId ?? crypto.randomUUID();
        logger.info("email_delivery_succeeded", {
          messageId,
          locale: message.locale,
          attempt,
        });
        return { messageId };
      } catch (error) {
        lastError = error;
        logger.warn("email_delivery_attempt_failed", {
          errorCode: error instanceof Error ? error.name : "UNKNOWN_ERROR",
          attempt,
        });
        if (attempt < 3)
          await new Promise((resolve) => setTimeout(resolve, attempt * 150));
      }
    }
    logger.error("email_delivery_failed", { errorCode: "SES_SEND_FAILED" });
    throw lastError;
  }
}
export function getEmailProvider(): EmailProvider {
  return env.AWS_SES_FROM_EMAIL
    ? new SesEmailProvider()
    : new ConsoleEmailProvider();
}
