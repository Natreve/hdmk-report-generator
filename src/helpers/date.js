const { DateTime } = require("luxon");
const hbs = require("handlebars");
// hbs.registerHelper("date", (context) => {
// let date = DateTime.fromJSDate(new Date(context));
// return new hbs.SafeString(
//   `<time>${date.toLocaleString(DateTime.DATE_SHORT)}</time>`
// );
// });

module.exports = (context) => {
  console.log(context);
  let date = DateTime.fromJSDate(new Date(context));
  return new hbs.SafeString(date.toLocaleString(DateTime.DATE_SHORT));
};
