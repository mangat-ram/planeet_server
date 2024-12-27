import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  secure: true,
  port: 465,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

interface SendMailOptions {
  recipientEmail: string;
  subject: string;
  otp: string;
}

const sendMail = async ({ recipientEmail, subject, otp }: SendMailOptions): Promise<void> => {
  try {
    const htmlTemplate = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: 'Arial', sans-serif;
            background-color: #f4f4f4;
            color: #333;
            margin: 0;
            padding: 0;
          }
          .email-container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            color: #333;
            font-size: 24px;
            margin-bottom: 20px;
          }
          .otp {
            display: inline-block;
            font-size: 1.5rem;
            font-weight: bold;
            color: #ffffff;
            background-color: #007bff;
            padding: 10px 20px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .footer {
            text-align: center;
            font-size: 0.9rem;
            color: #888;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <h2 class="header">Your Verification Code</h2>
          <p>Hi there, Greetings from HINT Bharat</p>
          <p>Thank you for signing up! Use the following OTP to complete your verification:</p>
          <div class="otp">${otp}</div>
          <p>If you did not request this, please ignore this email.</p>
          <div class="footer">
            &copy; 2024 Hint Bharat. All rights reserved.
          </div>
        </div>
      </body>
      </html>
    `;

    const options: nodemailer.SendMailOptions = {
      from: process.env.EMAIL_USER,
      to: recipientEmail,
      subject: subject,
      html: htmlTemplate,
    };

    const result = await transporter.sendMail(options);
    console.log("Email sent successfully.", result.messageId);

  } catch (error) {
    console.log(`Error in email service due to ${error}.`);
  }
};

export { sendMail };