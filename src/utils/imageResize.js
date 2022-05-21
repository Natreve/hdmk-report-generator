const imageResize = (src, { width, height }) => {
  return new Promise((res, rej) => {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = src;
    img.addEventListener("load", () => {
      var hRatio = canvas.width / img.width;
      var vRatio = canvas.height / img.height;
      var ratio = Math.max(hRatio, vRatio);
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

      //   const output = document.getElementById(target);
      //   if (!output) return;
      const image = new Image();
      image.crossOrigin = "anonymous";
      image.src = canvas.toDataURL();
      res(image);
    });
    // img.onload = function () {

    // };
  });
};
module.exports = imageResize;
