const { parse } = require('json2csv');

const TransformJson = (data, replacements, extras) => {
  let dataRemapped = []
  data.forEach(element => {
    // Remove extra keys
    Object.keys(element).forEach((key) => Object.keys(replacements).includes(key) || delete element[key]);
    const object = {}
    Object.keys(element).map((key) => {
      const newKey = replacements[key] || key;
      if (typeof newKey === "string") {
        object[newKey] = element[key];
        return
      } else {
        Object.keys(newKey).map((subkey) => {
          if (Array.isArray(element[key])) {
            object[newKey[subkey]] = []
            element[key].forEach(subelement => {
              object[newKey[subkey]].push(subelement[subkey])
            });
          } else {
            object[newKey[subkey]] = element[key][subkey];
          }
        })
      }
    });
    const mergedObj = Object.assign({}, object, extras)
    dataRemapped.push(mergedObj)
  });
  return dataRemapped
}
const TranfsormJsonData = (myData, opts) => {
  try {
    return parse(myData, opts);
  } catch (err) {
    console.error(err);
  }
}

module.exports = { TranfsormJsonData, TransformJson }
