const { DateTime } = require("luxon");
const hbs = require("handlebars");
// hbs.registerHelper("date", (context) => {
// let date = DateTime.fromJSDate(new Date(context));
// return new hbs.SafeString(
//   `<time>${date.toLocaleString(DateTime.DATE_SHORT)}</time>`
// );
// });

module.exports = (context) => {
  if (!context) return;
  let date = DateTime.fromJSDate(new Date(context));

  return new hbs.SafeString(date.toFormat("LL/dd/yyyy"));
};
