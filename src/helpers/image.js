const hbs = require("handlebars");

module.exports = function (context) {
  const [, width, height] = Array.prototype.slice.call(
    arguments,
    0,
    arguments.length - 1
  );

  return new hbs.SafeString(
    `<div class="image"><img src="${context[i].url}" alt="${context[i].name}" /></div>`
  );
};

// hbs.registerHelper("image", async function () {
//   const [url, width, height] = Array.prototype.slice.call(
//     arguments,
//     0,
//     arguments.length - 1
//   );
//   const { data: input } = await axios({ url, responseType: "arraybuffer" });

//   const output = await sharp(input).resize(width, height).jpeg().toBuffer();
//   const base64 = `data:image/jpeg;base64,${output.toString("base64")}`;

//   return new hbs.SafeString(`<img src="${base64}"/>`);
// });
