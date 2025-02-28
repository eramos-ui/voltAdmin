// import { NextApiRequest, NextApiResponse } from 'next';
// import { PrismaClient } from '@prisma/client';
// import crypto from 'crypto';
// import nodemailer from 'nodemailer';
// import  labels  from '../../data/labels.json';

// const prisma = new PrismaClient();

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   if (req.method !== 'POST') {
//     return res.status(405).json({ message: 'Method not allowed' });
//   }

//   const { email } = req.body;

//   if (!email) {
//     return res.status(400).json( { error: labels.forgotPassword.messageErrorMailRequired } );
//   }
//   try {
//     const user = await prisma.user.findUnique({ where: { email } });

//     if (!user) {
//       return res.status(404).json({ error: 'User not found' });
//     }

//     // Generar un token único
//     const resetToken = crypto.randomBytes(32).toString('hex');
//     const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hora de expiración

//     // Guardar el token y la fecha de expiración en la base de datos
//     await prisma.user.update({
//       where: { email },
//       data: {
//         resetToken,
//         resetTokenExpiry,
//       },
//     });

//     // Configurar y enviar el correo electrónico
//     const transporter = nodemailer.createTransport({
//       service: 'gmail', // o cualquier otro servicio de correo
//       auth: {
//         user: process.env.EMAIL_USER, // tu correo electrónico
//         pass: process.env.EMAIL_PASS, // tu contraseña de correo electrónico
//       },
//     });

//     const resetUrl = `${process.env.NEXT_PUBLIC_URL}/reset-password?token=${resetToken}`;
//     const subject  = `${labels.forgotPassword.mailSubject}`;
//     const textMail = `${labels.forgotPassword.mailText} ${resetUrl}`;
//     // const htmlMail = `${labels.forgotPassword.mailHtml}
//     //                     <a href="${resetUrl}">${resetUrl}</a>`
//     const htmlMail = `${labels.forgotPassword.mailHtml} <a href="${resetUrl}">${resetUrl}</a>`;
//     //`<p>Has solicitado restablecer tu contraseña. Haz clic en el siguiente enlace para restablecerla:</p>
//                   // <a href="${resetUrl}">${resetUrl}</a>`
//     const mailOptions = {
//       from: process.env.EMAIL_USER,
//       to: email,
//       subject: subject,//'Restablecer contraseña',
//       text: textMail,//`Has solicitado restablecer tu contraseña. Haz clic en el siguiente enlace para restablecerla: ${resetUrl}`,
//       html:htmlMail,// `<p>Has solicitado restablecer tu contraseña. Haz clic en el siguiente enlace para restablecerla:</p>
//                     //<a href="${resetUrl}">${resetUrl}</a>`,
//     };

//     await transporter.sendMail(mailOptions);

//     res.status(200).json({ message: labels.forgotPassword.messageSendMail });
//   } catch (error) {
//     console.error(labels.forgotPassword.messageNotSendMail, error);
//     res.status(500).json({ error: labels.forgotPassword.messageNotSendMail});
//   } finally {
//     await prisma.$disconnect();
//   }
// }