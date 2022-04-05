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
  dateIsValid
}