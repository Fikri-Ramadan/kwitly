import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

const SWAGGER_UI_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5';

export function setupSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('Kwitly API')
    .setDescription(
      'Invoice management API: authentication, clients, products, invoices, and recurring invoices.',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('docs', app, document, {
    useGlobalPrefix: true,
    customSiteTitle: 'Kwitly API Docs',
    swaggerOptions: { persistAuthorization: true },
    customCssUrl: [`${SWAGGER_UI_CDN}/swagger-ui.min.css`],
    customJs: [
      `${SWAGGER_UI_CDN}/swagger-ui-bundle.min.js`,
      `${SWAGGER_UI_CDN}/swagger-ui-standalone-preset.min.js`,
    ],
  });
}