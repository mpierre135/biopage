import { Resend } from "resend";

export type SendEmailOptions = {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
};

export interface EmailProvider {
  send(options: SendEmailOptions): Promise<void>;
}

const DEFAULT_FROM = "BioHub <noreply@biohub.com>";

// ---------------------------------------------------------------------------
// Resend implementation
// ---------------------------------------------------------------------------

class ResendEmailProvider implements EmailProvider {
  private client: Resend;

  constructor(apiKey: string) {
    this.client = new Resend(apiKey);
  }

  async send(options: SendEmailOptions): Promise<void> {
    const { error } = await this.client.emails.send({
      from: options.from ?? DEFAULT_FROM,
      to: options.to,
      subject: options.subject,
      html: options.html,
      replyTo: options.replyTo,
    });

    if (error) {
      throw new Error(`Resend error: ${error.message}`);
    }
  }
}

// ---------------------------------------------------------------------------
// Logging (dev/fallback) implementation
// ---------------------------------------------------------------------------

class LoggingEmailProvider implements EmailProvider {
  async send(options: SendEmailOptions): Promise<void> {
    console.log("[email:dev]", {
      to: options.to,
      subject: options.subject,
      from: options.from ?? DEFAULT_FROM,
    });
    console.log("[email:dev] html preview (first 300 chars):");
    console.log(options.html.slice(0, 300));
  }
}

// ---------------------------------------------------------------------------
// Singleton export
// ---------------------------------------------------------------------------

function createEmailProvider(): EmailProvider {
  const apiKey = process.env.RESEND_API_KEY;
  if (apiKey) {
    return new ResendEmailProvider(apiKey);
  }
  return new LoggingEmailProvider();
}

export const email: EmailProvider = createEmailProvider();
