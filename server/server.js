import dotenv from 'dotenv';
import mongoose from 'mongoose';

process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: './.env' });
import app from './app.js';

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
).replace('<USERNAME>', process.env.DATABASE_USERNAME);

mongoose.connect(DB).then(() => console.log('DB connection successful'));

const port = process.env.PORT || 5000;
const server = app.listen(port, () => console.log('Listening on port ' + port));

process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
