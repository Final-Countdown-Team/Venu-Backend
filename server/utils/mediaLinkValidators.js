import validator from "validator";

const isEmpty = (value) => value === undefined || value === null || value === "";

export const webUrlValidator = {
  validator: (value) =>
    isEmpty(value) ||
    validator.isURL(value, {
      protocols: ["https"],
      require_protocol: true,
    }),
  message: "Please provide a valid URL starting with https://",
};

// Instagram allows letters, numbers, periods and underscores up to 30 chars; Twitter is a subset
export const socialTagValidator = {
  validator: (value) => isEmpty(value) || /^@?[A-Za-z0-9._]{1,30}$/.test(value),
  message: "Please provide a valid tag, e.g. @yourname",
};
