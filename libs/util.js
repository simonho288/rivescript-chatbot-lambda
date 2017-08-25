
module.exports = {
  padCharLeft(num, len, char) {
    var s = num + ''
    while (s.length < len) {
      s = char + s
    }
    return s
  }
  
}