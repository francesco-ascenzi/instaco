/** Function to compare two arrays and retrieve values that don't match
 * 
 * @param {Array} firstList First array list to compare
 * @param {Array} secondList Second array list to compare
 * 
 * @returns {Object} {ok: true/false, msg: error message if ok is false, list: followers/followings list if ok is true}
 */
function compareLists(firstList, secondList) {

  // Initialize error message, and compared list
  let errorMessage = [];
  let comparedList = [];

  // Check for right type and its length
  if (!Array.isArray(firstList)) {
    if (firstList.length == 0) {
      errorMessage.push('First list is empty');
    }
    errorMessage.push('First list is not an array');
  }

  if (!Array.isArray(secondList)) {
    if (secondList.length == 0) {
      errorMessage.push('Second list is empty');
    }
    errorMessage.push('Second list is not an array');
  }

  // Compare lists
  for (const element of firstList) {
    let found = false;
    for (const element2 of secondList) {
      if (element.Name === element2.Name) {
        found = true;
        break;
      }
    }
    if (!found) {
      comparedList.push(element);
    }
  }

  // Check for error messages
  if (errorMessage.length > 0) {
    return {
      ok: false,
      msg: errorMessage.join('\n')
    };
  } else {
    return {
      ok: true,
      list: comparedList
    };
  }
}

module.exports = compareLists;