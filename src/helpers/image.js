
const imageResize = require("../utils/imageResize.js");
const hbs = require("handlebars");
const uuid = require("uuid");
module.exports = function (context) {
  const [, width, height] = Array.prototype.slice.call(
    arguments,
    0,
    arguments.length - 1
  );
  const image = document.createElement("img");
  const id = uuid.v4().split("-").join("");
  image.src = context;
  image.crossOrigin = "anonymous";

  image.addEventListener("load", () => {
    
    imageResize(image, width, height);
    let target = document.getElementById(id);
    target.src = image.src;
  });
  return new hbs.SafeString(`<img id="${id}" crossOrigin />`);
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
