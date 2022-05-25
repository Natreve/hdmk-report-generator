module.exports = function (context) {
  const [, counter] = Array.prototype.slice.call(
    arguments,
    0,
    arguments.length - 1
  );
  return parseInt(context) + parseInt(counter);
};
