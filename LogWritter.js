const sc = require('@google-cloud/security-center');
const fs = require('fs');

const LogWritter = async(config,filetype, Data, func) => {
    console.log(config.output.mode)
    switch(config.output.mode.toUpperCase()) {
        case "FILE":
            try {
                fs.appendFile(`${config.output.path}/${func}.${filetype}`, Data, function (err) {
                  if (err) return console.log(err);
                  console.log(`Wrote succesfully the ${func} log`);
                })
              } catch (err) {
                console.log("error: ", err);
            }
            
        break;
        case "MYSQL":
          // code block
          break;
        default:
          // code block
      }
    };
  

module.exports = { LogWritter };