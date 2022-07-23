const generateRandomKey = (length = 12) => {
    let result = ''
    const spectrum =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    var spectrumLength = spectrum.length
    for (var i = 0; i < length; i++) {
      result += spectrum.charAt(Math.floor(Math.random() * spectrumLength))
    }
    return result
}

module.exports = {
  generateRandomKey
}
