const imageResize = require("../utils/imageResize.js");
const hbs = require("handlebars");
const uuid = require("uuid");
module.exports = function (context) {
  const [, width, height] = Array.prototype.slice.call(
    arguments,
    0,
    arguments.length - 1
  );
  const id = uuid.v4().split("-").join("");

  if (typeof context === "string") {
    const image = document.createElement("img");

    image.src = context;
    image.crossOrigin = "anonymous";

    image.addEventListener("load", () => {
      let target = document.getElementById(id);
      if (width && height) {
        imageResize(image, width, height);
      } else {
        let width = target.parentElement.offsetWidth;
        let height = target.parentElement.offsetHeight;
        imageResize(image, width, height);
      }

      target.src = image.src;
    });

    return new hbs.SafeString(
      `<img id="${id}" src="${context}" crossOrigin />`
    );
  }

  const { type, url, uploaded } = context;

  if (type === "image/jpeg" && uploaded) {
    const image = document.createElement("img");
    const id = uuid.v4().split("-").join("");
    image.src = url;
    image.crossOrigin = "anonymous";

    image.addEventListener("load", () => {
      let target = document.getElementById(id);
      if (width && height) {
        imageResize(image, width, height);
      } else {
        let width = target.parentElement.offsetWidth;
        let height = target.parentElement.offsetHeight;
        imageResize(image, width, height);
      }
      target.src = image.src;
    });
    return new hbs.SafeString(`<img id="${id}" src="${url}" crossOrigin />`);
  }
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
