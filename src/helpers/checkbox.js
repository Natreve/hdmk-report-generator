const hbs = require("handlebars");

module.exports = function (context) {
  if (context === "on") {
    return new hbs.SafeString(`<input type="checkbox" checked>`);
  } else {
    return new hbs.SafeString(`<input type="checkbox">`);
  }
};
