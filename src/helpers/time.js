const { DateTime } = require("luxon");
const hbs = require("handlebars");

module.exports = (context) => {
  let date = DateTime.fromJSDate(new Date(context));
  return new hbs.SafeString(
    `<time>${date.toLocaleString(DateTime.TIME_SIMPLE)}</time>`
  );
};
// hbs.registerHelper("time", (context) => {
//   let date = DateTime.fromJSDate(new Date(context));
//   return new hbs.SafeString(
//     `<time>${date.toLocaleString(DateTime.TIME_SIMPLE)}</time>`
//   );
// });
