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

function dateIsValid(dateStr) {
  // format looks correct
  const regex = /^\d{4}-\d{2}-\d{2}$/
  if (dateStr.match(regex) === null) {
    return false
  }

  // date is legitimate
  const date = new Date(dateStr)
  const timestamp = date.getTime()
  if (typeof timestamp !== 'number' || Number.isNaN(timestamp)) {
    return false
  }

  // converts back to given
  return date.toISOString().startsWith(dateStr)
}

module.exports = {
  generateRandomKey,
  dateIsValid,
}
