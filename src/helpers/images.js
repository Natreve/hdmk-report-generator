const imageResize = require("../utils/imageResize.js");
const hbs = require("handlebars");

module.exports = function (context, options) {
  const [, dimension] = Array.prototype.slice.call(
    arguments,
    0,
    arguments.length - 1
  );
  let images = "<div ";
  // const gallery = document.createElement("div");
  // gallery.classList.add("gallery");

  for (let i = 0; i < context.length; i++) {
    const { type, url, uploaded } = context[i];
    if (type === "image/jpeg" && uploaded) {
      imageResize(url, dimension).then((image) => {
        // gallery.appendChild(image);
      });
      // images.push(
      //   `<div class="image"><img src="${context[i].url}" alt="${context[i].name}" /></div>`
      // );
      //     gallery += `<div class="image"><img src="${context[i].url}" alt="${context[i].name}" /></div>`;
      //     // gallery += `<div class="image" id="${context[i].name}"></div>`;
      //     // imageResize(context[i].url, context[i].name, { width, height });
    }
  }
  console.log(context);
  return;
  //  return new hbs.SafeString(images.join(""));
};
