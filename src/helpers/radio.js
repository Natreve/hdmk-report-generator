const hbs = require("handlebars");

module.exports = function (context) {
  if (context) {
    return new hbs.SafeString(`<input type="radio" checked>`);
  } else {
    return new hbs.SafeString(`<input type="radio">`);
  }
};
