import nodemailer from "nodemailer";
import Handlebars from "handlebars";
import fs from "fs";
import * as path from "path";

const sendEmail = async (options) => {
  try {
    const __dirname = path.resolve();

    const filePath = path.join(
      __dirname,
      `./utils/emailTemplates${options.template}`
    );
    const source = fs.readFileSync(filePath, "utf-8").toString();
    const template = Handlebars.compile(source);
    const replacements = {
      username: options.name,
      link: `http://192.168.0.129:3000/${options.type}s/resetPassword/${options.token}`,
      buttonColor: options.buttonColor,
    };

    const htmlToSend = template(replacements);

    // 1. Create a transporter
    // TRANSPORTER FOR MAILTRAP
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // TRANSPORT FOR MAILGUN
    /*   const transporter = nodemailer.createTransport({
    host: process.env.MAILGUN_HOST,
    port: process.env.MAILGUN_PORT,
    auth: {
      user: process.env.MAILGUN_USERNAME,
      pass: process.env.MAILGUN_PASSWORD,
    },
  }); */

    // 2. Define the email options
    const mailOptions = {
      from: "Max from Venu <max@venu.com>",
      to: options.email,
      subject: options.subject,
      html: htmlToSend,
    };

    // 3. Send the email with nodemailer
    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.log(err);
  }
};

export default sendEmail;
