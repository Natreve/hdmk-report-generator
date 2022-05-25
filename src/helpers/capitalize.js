const hbs = require("handlebars");

module.exports = (words) => {
  return new hbs.SafeString(
    words
      .split(" ")
      .map((word) => {
        return word[0].toUpperCase() + word.toLowerCase().substring(1);
      })
      .join(" ")
  );
};
