import nodemailer from "nodemailer";

const sendEmail = async (options) => {
  // 1. Create a transporter
  // TRANSPORTER FOR MAILTRAP
  /*   const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  }); */

  // TRANSPORT FOR MAILGUN
  const transporter = nodemailer.createTransport({
    host: process.env.MAILGUN_HOST,
    port: process.env.MAILGUN_PORT,
    auth: {
      user: process.env.MAILGUN_USERNAME,
      pass: process.env.MAILGUN_PASSWORD,
    },
  });

  // 2. Define the email options
  const mailOptions = {
    from: "Max from Venu <max@venu.com>",
    to: options.email,
    subject: options.subject,
    text: options.message,
    //html: convert your text to html here, optional
  };

  // 3. Send the email with nodemailer
  await transporter.sendMail(mailOptions);
};

export default sendEmail;
