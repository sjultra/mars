/*
     Copyright 2020 SJULTRA, inc.
   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at
       http://www.apache.org/licenses/LICENSE-2.0
   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
 */

BaseTypes = ['string', 'boolean', 'number',]

// const TransformJson = (data, replacements, extras) => {
//   let dataRemapped = []
//   data.forEach(element => {
//     // Remove extra keys
//     // console.log("\n log0", "element: ", JSON.stringify(element, null, 4), "\n")
//     // Object.keys(element).forEach((key) =>console.log("\n log0.5", "rm element: ",key , Object.keys(replacements).includes(key), "\n")    );
//     Object.keys(element).forEach((key) => Object.keys(replacements).includes(key) || delete element[key]);
//     // console.log("\n log1", "element: ", element, "\n")
//     const object = {}
//     Object.keys(element).map((key) => {
//       const newKey = replacements[key] || key;
//       // console.log("\n log2", "key: ", key, "newkey: ", newKey, "object[newKey]: ", object[newKey], "element[key]: ", element[key], "\n")
//       if (typeof newKey === "string") {
//         object[newKey] = element[key];
//         return
//       } else {
//         Object.keys(newKey).map((subkey) => {
//           // console.log("\n log3", "element[key]: ", element[key], "\n")
//           if (Array.isArray(element[key])) {
//             object[newKey[subkey]] = []
//             element[key].forEach(subelement => {
//               object[newKey[subkey]].push(subelement[subkey])
//             });
//           } else if (BaseTypes.includes(typeof element[key][subkey])) {
//             // console.log("\n log4", newKey[subkey], "subkey: ", subkey, "element[key][subkey]: ", element[key][subkey], "\n")
//             object[newKey[subkey]] = element[key][subkey];
//           } else {
//             // console.log("\n log5 "," newKey[subkey]: ", newKey[subkey], "\n subkey: ", subkey,"\n element: ", element, "\n element[key]: ", element[key], "\n element[key][subkey]: ", element[key][subkey], "\n Object.keys(newKey[subkey]): ",JSON.stringify(Object.keys(newKey[subkey])),"\n Object.keys(newKey[subkey])[0]: ",JSON.stringify(Object.keys(newKey[subkey])[0]),"\n")
//             if(Object.keys(element[key]).includes(subkey)){
//             const ParsedOutput = ParseObjDeep(element[key][subkey], newKey[subkey], Object.keys(newKey[subkey])[0])
//             object[ParsedOutput[1]] = ParsedOutput[0]
//             }
//           }
//         })
//       }
//     });
//     const mergedObj = Object.assign({}, object, extras)
//     dataRemapped.push(mergedObj)
//   });
//   return dataRemapped
// }

const ParseObjDeep = (data, keyvalues, key) => {
  if (BaseTypes.includes(typeof keyvalues[key])) {
    return [data[key], keyvalues[key]]
  } else {
    return ParseObjDeep(data[key], keyvalues[key], Object.keys(keyvalues[key])[0])
  }
}


const ReportBuilder = (data, cardinal, ordinal) => {
  obj = {}
  for (const element of data) {
    switch (typeof element[cardinal]) {
      case "string":
        obj[element[cardinal]][element[ordinal]] = 1
        break
      case "object":
        if (Array.isArray(element[cardinal])) {
          for (const key of element[cardinal]) {
            obj[key] = { [element[ordinal]]: 1 }
          }
        }
        break
      case "undefined":
        break
    }
  }
  retArr=[]
  for (const key of Object.entries(obj)){
    retArr.push({ [`${cardinal}`]:key[0], [`${ordinal}`]:Object.keys(key[1])[0]})
  }
  return retArr
}


module.exports = { ReportBuilder }
