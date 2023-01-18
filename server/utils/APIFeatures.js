import AppError from "./appError.js";

class APIFeatures {
  constructor(mongoQuery, queryString) {
    this.mongoQuery = mongoQuery;
    this.queryString = queryString;
  }

  searchName() {
    if (this.queryString.name) {
      const queryObj = { ...this.queryString };
      this.mongoQuery = this.mongoQuery.find({
        name: { $regex: queryObj.name, $options: "i" },
      });
    }
    // Return the entire object in order for chaining methods to work
    return this;
  }

  searchGenre() {
    if (this.queryString.genre) {
      console.log(this.queryString.genre);
      this.mongoQuery = this.mongoQuery.find({
        genre: this.queryString.genre,
      });
    }
    return this;
  }

  searchDates() {
    if (this.queryString.dates) {
      console.log(this.queryString.dates);
      this.mongoQuery = this.mongoQuery.find({
        dates: {
          $lte: new Date(this.queryString.dates),
          $gte: Date.now(),
        },
      });
    }
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join(" ");
      this.mongoQuery = this.mongoQuery.sort(sortBy);
    } else {
      this.mongoQuery = this.mongoQuery.sort("_id");
    }
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(",").join(" ");
      this.mongoQuery = this.mongoQuery.select(fields);
    } else {
      this.mongoQuery = this.mongoQuery.select("-__v");
    }
    return this;
  }

  paginate() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;

    this.mongoQuery = this.mongoQuery.skip(skip).limit(limit);

    return this;
  }

  getWithinDistance() {
    if (this.queryString.distance && this.queryString.center) {
      const latLng = this.queryString.center.split(",");
      const radius = this.queryString.distance / 6378.1;

      const [lat, lng] = latLng.map((el) => +el);

      if (!lat || !lng) {
        throw new AppError(
          'Please provide latitude and longitude in the format "lat,lng"',
          400
        );
      }

      this.mongoQuery = this.mongoQuery.find({
        location: {
          $geoWithin: { $centerSphere: [[lng, lat], radius] },
        },
      });
    }
    return this;
  }
}
export default APIFeatures;
