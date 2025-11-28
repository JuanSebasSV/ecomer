// backend/controllers/email.controller.js
import dotenv from 'dotenv';
dotenv.config();
import nodemailer from "nodemailer";

console.log('📧 Configurando email con:', {
  user: process.env.EMAIL_USER,
  passExists: !!process.env.EMAIL_PASSWORD,
  passLength: process.env.EMAIL_PASSWORD?.length
});

export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASSWORD
  }
});

transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Error en configuración de email:', error);
  } else {
    console.log('✅ Servidor de email listo para enviar mensajes');
  }
});

// Generar código de 6 dígitos
export function generarCodigoVerificacion() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Plantilla de email de recuperación con HTML bonito
// ✅ AHORA RECIBE EL CÓDIGO COMO PARÁMETRO
export const crearEmailRecuperacion = (nombre, token, codigo) => {
  const FRONTEND_URL = process.env.FRONTEND_URL || 'http://127.0.0.1:5500';
  const resetUrl = `${FRONTEND_URL}/src/pages/recuperacion.html?token=${token}`;
  
  console.log('📧 URL de recuperación generada:', resetUrl);
  console.log('🔢 Código de verificación para email:', codigo);
  
  return {
    subject: '🔐 Recuperación de Contraseña - TechStore Pro',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
          }
          .container {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 16px;
            padding: 40px;
            text-align: center;
            color: white;
          }
          .logo {
            width: 60px;
            height: 60px;
            background: white;
            border-radius: 12px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 20px;
          }
          h1 {
            margin: 0 0 10px 0;
            font-size: 28px;
          }
          p {
            margin: 10px 0;
            font-size: 16px;
            opacity: 0.95;
          }
          .content {
            background: white;
            border-radius: 12px;
            padding: 30px;
            margin: 30px 0;
            color: #333;
          }
          .button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 15px 40px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: bold;
            margin: 20px 0;
            font-size: 16px;
          }
          .code-box {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-radius: 12px;
            padding: 20px;
            margin: 25px 0;
            text-align: center;
          }
          .code-number {
            font-size: 36px;
            font-weight: bold;
            letter-spacing: 8px;
            font-family: 'Courier New', monospace;
            margin: 10px 0;
          }
          .token-box {
            background: #f3f4f6;
            border: 2px dashed #9ca3af;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            font-weight: bold;
            letter-spacing: 1px;
            color: #1f2937;
            word-break: break-all;
          }
          .warning {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
            text-align: left;
          }
          .footer {
            text-align: center;
            color: #6b7280;
            font-size: 14px;
            margin-top: 30px;
          }
          .url-box {
            background: #f3f4f6;
            padding: 10px;
            border-radius: 6px;
            word-break: break-all;
            font-size: 12px;
            color: #4b5563;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">
            <svg width="30" height="30" viewBox="0 0 20 20" fill="#667eea">
              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
            </svg>
          </div>
          <h1>TechStore Pro</h1>
          <p>Recuperación de Contraseña</p>
        </div>

        <div class="content">
          <h2>Hola ${nombre},</h2>
          <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta en TechStore Pro.</p>
          
          <div class="code-box">
            <p style="margin: 0; font-size: 14px;">Tu código de verificación:</p>
            <div class="code-number">${codigo}</div>
            <p style="margin: 0; font-size: 12px; opacity: 0.9;">Este código expira en 1 hora</p>
          </div>
          
          <p>Haz clic en el siguiente botón para crear una nueva contraseña:</p>
          
          <a href="${resetUrl}" class="button">Restablecer Contraseña</a>
          
          <p style="font-size: 14px; color: #6b7280;">
            O copia y pega este enlace en tu navegador:
          </p>
          <div class="url-box">
            ${resetUrl}
          </div>

          <div class="warning">
            <strong>⚠️ Importante:</strong>
            <ul style="margin: 10px 0; padding-left: 20px;">
              <li>Este enlace y código expirarán en <strong>1 hora</strong></li>
              <li>Si no solicitaste este cambio, ignora este email</li>
              <li>Nunca compartas este código o enlace con nadie</li>
            </ul>
          </div>

          <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
            ¿No puedes hacer clic en el botón? Usa este token de recuperación:
          </p>
          <div class="token-box">
            ${token}
          </div>
        </div>

        <div class="footer">
          <p>Este es un email automático, por favor no respondas a este mensaje.</p>
          <p>&copy; 2025 TechStore Pro. Todos los derechos reservados.</p>
        </div>
      </body>
      </html>
    `,
    text: `
Hola ${nombre},

Recibimos una solicitud para restablecer la contraseña de tu cuenta en TechStore Pro.

CÓDIGO DE VERIFICACIÓN: ${codigo}

Este código expirará en 1 hora.

Para restablecer tu contraseña, visita:
${resetUrl}

Token de recuperación: ${token}

Si no solicitaste este cambio, ignora este email.

TechStore Pro
    `
  };
};