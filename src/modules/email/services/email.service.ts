import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as handlebars from 'handlebars';
import * as nodemailer from 'nodemailer';
import * as path from 'path';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(EmailService.name);

  constructor(private config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.config.get('MAIL_HOST'),
      port: Number(this.config.get('MAIL_PORT')),
      secure: false,
      auth: {
        user: this.config.get('MAIL_USER'),
        pass: this.config.get('MAIL_PASS'),
      },
      tls: { rejectUnauthorized: false },
    });
  }

  /**
   * Método genérico para enviar correos usando plantillas HBS
   * @param to Destinatario
   * @param subject Asunto
   * @param templateName Nombre del archivo (ej: 'welcome') sin la extensión .hbs
   * @param context Objeto con las variables para la plantilla (ej: { nombre: 'Name' })
   */
  async sendEmail(
    to: string,
    subject: string,
    templateName: string,
    context: any,
  ) {
    const fromEmail = this.config.get('MAIL_FROM');
    const frontendUrl = this.config.get('FRONTEND_URL');

    try {
      const templatePath = path.join(
        process.cwd(),
        'src',
        'modules',
        'email',
        'templates',
        `${templateName}.hbs`,
      );

      const templateSource = fs.readFileSync(templatePath, 'utf8');
      const template = handlebars.compile(templateSource);

      const finalContext = {
        ...context,
        frontendUrl,
      };

      const html = template(finalContext);

      const info = await this.transporter.sendMail({
        from: `"Decorect" <${fromEmail}>`,
        to,
        subject,
        html,
      });

      this.logger.log(`Email [${templateName}] enviado a: ${to}`);
      return info;
    } catch (error) {
      this.logger.error(`Error enviando plantilla ${templateName}:`, error);
      throw error;
    }
  }
}
