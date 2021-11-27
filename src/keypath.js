class Keypath {
  static toObject(path, value) {
    var obj = {}
    var target = obj
    path = path.split(".")
    path.forEach(function (key, index) {
      target = target[key] = index === path.length - 1 ? value : {}
    })
    target = value
    return obj
  }
  static get(keypath, target) {
    return keypath.split(".").reduce((previous, current) => {
      if (previous) return previous[current]
      else return null
    }, target)
  }
  static drop(path, obj) {
    if (!obj || !path) return

    if (typeof path === "string") path = path.split(".")

    for (var i = 0; i < path.length - 1; i++) {
      obj = obj[path[i]]
      if (typeof obj === "undefined") return
    }

    if (Array.isArray(obj)) {
      obj.splice(parseInt(path.pop()), 1)
    } else {
      delete obj[path.pop()]
    }
  }
  static set({ path, value, target }) {
    var schema = target
    var pList = path.split(".")
    var len = pList.length
    for (var i = 0; i < len - 1; i++) {
      var elem = pList[i]
      if (!schema[elem]) schema[elem] = {}
      schema = schema[elem]
    }

    schema[pList[len - 1]] = value
  }
}

export default Keypath
