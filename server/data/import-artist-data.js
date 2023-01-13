import fs from "fs";
import dotenv from "dotenv";
import mongoose from "mongoose";

import path from "path";
const __dirname = path.resolve();
dotenv.config({ path: "../.env" });

import Artist from "../models/artistModel.js";

const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
).replace("<USERNAME>", process.env.DATABASE_USERNAME);

mongoose.connect(DB).then(() => console.log("DB connection successful!"));

// Read JSON file
const artists = JSON.parse(
  fs.readFileSync(`${__dirname}/bands.json`, "utf-8")
);

// Import data into DB
const importData = async () => {
  try {
    await Artist.create(artists);
    console.log("Data successfully loaded!");
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

// Delete all data from collection
const deleteData = async () => {
  try {
    await Artist.deleteMany();
    console.log("Data successfully deleted!");
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

const updateDates = async () => {
  try {
    const artists = await Artist.find({}, "dates");
    artists.forEach(async (artist) => {
      if (artist.dates.length >= 1) {
        artist.dates = artist.dates.filter((date) => date >= Date.now());
        console.log(artist);
        await artist.save();
      }
    });
    console.log("Dates successfully updated!");
  } catch (err) {
    console.log(err);
  }
};

if (process.argv[2] === "--import") {
  importData();
} else if (process.argv[2] === "--delete") {
  deleteData();
} else if (process.argv[2] === "--updateDates") {
  updateDates();
}
