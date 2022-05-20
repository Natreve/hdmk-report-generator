window.addEventListener("load", function () {
  const data = require("./data.json");
  function printPage() {
    window.print();

    //workaround for Chrome bug - https://code.google.com/p/chromium/issues/detail?id=141633
    if (window.stop) {
      location.reload(); //triggering unload (e.g. reloading the page) makes the print dialog appear
      window.stop(); //immediately stop reloading
    }
    return false;
  }
  // Scaling/cropping image to save on space
  function cropImg() {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    // const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    var img = new Image();
    img.crossOrigin = "anonymous";
    img.src =
      "https://firebasestorage.googleapis.com/v0/b/hdmk-inspection.appspot.com/o/1191%2F18873%2Fcover?alt=media";
    // img.src = "./images/cover.png";
    img.onload = function () {
      var hRatio = canvas.width / img.width;
      var vRatio = canvas.height / img.height;
      var ratio = Math.min(hRatio, vRatio);
      var centerShift_x = (canvas.width - img.width * ratio) / 2;
      var centerShift_y = (canvas.height - img.height * ratio) / 2;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(
        img,
        0,
        0,
        img.width,
        img.height,
        centerShift_x,
        centerShift_y,
        img.width * ratio,
        img.height * ratio
      );
      const output = document.getElementById("output");

      output.src = canvas.toDataURL();
      // setTimeout(() => {
      //   console.log("print page");
      //   printPage();
      // }, 3000);
    };
  }

  // cropImg();

  const template = require("./templates/report.hbs");
  const body = this.document.querySelector("body");
  body.innerHTML = template(data);

  let matchMedia = window.matchMedia("print");

  matchMedia.onchange = function (e) {
    //   page.setAttribute("style", `margin-top:${header.height}px`);
    //   console.log(e);
  };
});
