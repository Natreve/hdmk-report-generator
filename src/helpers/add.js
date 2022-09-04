const hbs = require("handlebars");

module.exports = function (context) {
  const [n1, n2] = Array.prototype.slice.call(
    arguments,
    0,
    arguments.length - 1
  );

  return new hbs.SafeString(n1 + n2);
};
