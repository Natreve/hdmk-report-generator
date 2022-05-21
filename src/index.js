
window.addEventListener("load", function () {
  const data = require("./data.json");
  const imageResize = require("./utils/imageResize.js");
  // Scaling/cropping image to save on space
  // imageResize(
  //   "https://firebasestorage.googleapis.com/v0/b/hdmk-inspection.appspot.com/o/1191%2F18873%2Fcover?alt=media",
  //   "image",
  //   { width: 512, height: 512 }
  // );

  const template = require("./templates/report.hbs");
  const body = this.document.querySelector("body");
  body.innerHTML = template(data);

  // let matchMedia = window.matchMedia("print");

  // matchMedia.onchange = function (e) {
  //   page.setAttribute("style", `margin-top:${header.height}px`);
  //   console.log(e);
  // };
});


