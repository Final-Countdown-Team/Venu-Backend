# Venu - Backend

This project was done as a final project during the 1-year fullstack web development course at DCI and was developed over a period of 2 months.

Our goal was to build an application that allows musicians and venues to get in contact and book dates for upcoming shows and events.

### Technologies:

- The backend is built with NodeJS and Express as the corresponding framework.

- MongoDB is set up as the database and mongoose is used as the ODM library.

- We used JWT for authentication, which are sent via HTTP-only cookies for additional security.

- Sending emails is enabled via nodemailer, which sends dynamically rendered and customized emails to users with the help of handlebars.

  - As a template, Lee Munroe's awesome <a src="https://github.com/leemunroe/responsive-html-email-template">"responsive-html-email-template"</a> was used.
  - A transport for mailgun is set up, but right now emails are sent to mailtrap.

- For image transformation and uploading a combination of multer and cloudinary comes into use.

- Additionally we took care of basic security and protection for example against XSS-Attacks with the xss module and query selector injection attacks via Mongo-Sanitize. Rate limiting protects against spamming or bot activity.

The app includes all essential functionalities, like authentication and authorisation, protected and restricted routes, queries and geospatial queries, pagination, image processing and upload, global error handling etc.

To see the live version please visit:

https://venu-frontend.onrender.com

If you want to check out the frontend repository, please visit:

https://github.com/Final-Countdown-Team/Venu-Frontend
