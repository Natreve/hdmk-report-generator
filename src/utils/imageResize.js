const imageResize = (img, width, height) => {
  if (img.getAttribute("resized")) return;
  // const canvas = document.createElement("canvas");
  // const ctx = canvas.getContext("2d");
  // const oc = document.createElement("canvas");
  // const octx = oc.getContext("2d");

  // oc.width = img.width * 0.5;
  // oc.height = img.height * 0.5;
  // octx.drawImage(img, 0, 0, oc.width, oc.height);

  // octx.drawImage(oc, 0, 0, oc.width * 0.5, oc.height * 0.5);

  // canvas.width = width;
  // canvas.height = height;
  // ctx.drawImage(
  //   oc,
  //   0,
  //   0,
  //   oc.width * 0.5,
  //   oc.height * 0.5,
  //   0,
  //   0,
  //   canvas.width,
  //   canvas.height
  // );

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");

  var hRatio = canvas.width / img.width;
  var vRatio = canvas.height / img.height;
  var ratio = Math.max(hRatio, vRatio);
  var centerShift_x = (canvas.width - img.width * ratio) / 2;
  var centerShift_y = (canvas.height - img.height * ratio) / 2;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.imageSmoothingQuality ="high"
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
  // steps = Math.ceil(Math.log(img.width / img.height) / Math.log(2));
  // console.log(steps);

  // img.setAttribute("compressed", true);
  img.src = canvas.toDataURL("image/jpeg", 1);
  img.setAttribute("resized", true);

  return;
};
module.exports = imageResize;
// export default imageResize;
