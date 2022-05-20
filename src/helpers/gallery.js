const imageResize = require("../utils/imageResize.js");
const hbs = require("handlebars");

module.exports = (context) => {
  let gallery = "<div class='gallery'>";

  for (let i = 0; i < context.length; i++) {
    if (context[i].type === "image/jpeg" && context[i].uploaded) {
      // gallery += `<div class="image"><img src="${context[i].url}" alt="${context[i].name}" /></div>`;
      gallery += `<div class="image"><img id="${context[i].name}" alt="${context[i].name}" /></div>`;
    }
  }

  return new hbs.SafeString(`${gallery} </div>`);
};
//Image gallery helper
// hbs.registerHelper("gallery", (context) => {
//   let gallery = "<div class='gallery'>";

//   for (let i = 0; i < context.length; i++) {
//     if (context[i].type === "image/jpeg" && context[i].uploaded) {
//       gallery += `<div class="image"><img src="${context[i].url}" alt="${context[i].name}" /></div>`;
//     }
//   }

//   return `${gallery} </div>`;
// });

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
