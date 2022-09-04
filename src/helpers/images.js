const imageResize = require("../utils/imageResize.js");
const hbs = require("handlebars");
const uuid = require("uuid");
module.exports = function (context) {
  let images = [];
  const [, width, height] = Array.prototype.slice.call(
    arguments,
    0,
    arguments.length - 1
  );

  for (let i = 0; i < context.length; i++) {
    if (!context[i]) continue;
    if (typeof context[i] === "string") {
      const image = document.createElement("img");
      const id = uuid.v4().split("-").join("");
      image.src = context[i];
      image.crossOrigin = "anonymous";

      image.addEventListener("load", () => {
        imageResize(image, width, height);
        let target = document.getElementById(id);
        target.src = image.src;
      });
      images.push(`<li class="image"><img id="${id}" crossOrigin/></li>`);
      continue;
    }
    const { type, url, uploaded } = context[i];

    if (type === "image/jpeg" && uploaded) {
      const image = document.createElement("img");
      const id = uuid.v4().split("-").join("");
      image.src = url;
      image.crossOrigin = "anonymous";

      image.addEventListener("load", () => {
        imageResize(image, width, height);
        let target = document.getElementById(id);
        target.src = image.src;
      });
      images.push(`<li class="image"><img id="${id}" crossOrigin/></li>`);
    }
  }

  return new hbs.SafeString(images.join(""));
};
