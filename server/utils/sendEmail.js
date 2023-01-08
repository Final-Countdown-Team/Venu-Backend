import nodemailer from "nodemailer";
import Handlebars from "handlebars";
import fs from "fs";
import * as path from "path";

class Email {
  constructor(user, url) {
    (this.to = user.email),
      (this.buttonColor = user.type === "artists" ? "#0168b5" : "#b02476"),
      (this.name = user.name),
      (this.url = url);
  }

  // Create transporter, here we could define another transporter for mailgun when in production
  newTransport() {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }
  async send(template, subject, from, replacements) {
    const __dirname = path.resolve();

    const filePath = path.join(
      __dirname,
      `./utils/emailTemplates/${template}.html`
    );
    const source = fs.readFileSync(filePath, "utf-8").toString();
    const compiledTemplate = Handlebars.compile(source);
    // const replacements = {
    //   username: this.name,
    //   teamMember: from,
    //   link: this.url,
    //   buttonColor: this.buttonColor,
    // };

    const htmlToSend = compiledTemplate(replacements);

    // 2. Define the email options
    const mailOptions = {
      from: `${from} from Venue <${from.toLowerCase()}@venu.com>`,
      to: this.to,
      subject: subject,
      html: htmlToSend,
    };
    // 3. Send the email with nodemailer
    await this.newTransport().sendMail(mailOptions);
  }

  sendFromVenu = (from) => {
    const replacements = {
      username: this.name,
      teamMember: from,
      link: this.url,
      buttonColor: this.buttonColor,
    };
    return replacements;
  };

  sendFromUser = (from, sender, contactForm) => {
    const replacements = {
      username: this.name,
      teamMember: from,
      link: this.url,
      buttonColor: this.buttonColor,
      senderName: sender.name,
      senderEmail: sender.email,
      firstname: contactForm.firstname,
      date: contactForm.date,
      message: contactForm.message,
    };
    return replacements;
  };

  async sendWelcome() {
    console.log("Sending welcome");
    const fromVenuTeam = "Neetu";
    const replacements = this.sendFromVenu(fromVenuTeam);
    await this.send(
      "welcomeEmail",
      "Welcome to Venu!",
      fromVenuTeam,
      replacements
    );
  }
  async sendPasswordReset() {
    const fromVenuTeam = "Max";
    const replacements = this.sendFromVenu(fromVenuTeam);
    await this.send(
      "forgotPasswordEmail",
      "Your password reset token (valid for 10 minutes)",
      fromVenuTeam,
      replacements
    );
  }

  async sendGoodbye() {
    console.log("Sending goodbye");
    const fromVenuTeam = "Hammed";
    const replacements = this.sendFromVenu(fromVenuTeam);
    await this.send(
      "goodbyeEmail",
      "We're sad that you're leaving",
      fromVenuTeam,
      replacements
    );
  }

  async sendContact(sender, contactForm) {
    const fromVenuTeam = "Nana";
    const replacements = this.sendFromUser(
      fromVenuTeam,
      sender,
      contactForm
    );
    await this.send(
      "contactUserEmail",
      `${sender} sent you a request`,
      fromVenuTeam,
      replacements
    );
  }
}

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

export default Email;
