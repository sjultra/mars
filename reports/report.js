const XLSX = require('xlsx');

SupportedTypes=['XLSX']

const InitAggregator = (config) => {
    switch (config.output.report.toUpperCase()) {
        case SupportedTypes[0].toUpperCase():
            return  XLSX.utils.book_new();
      }    
}

const AddDataToAggregator = (wb,config, Data, header, workSheetName) => {
  switch (config.output.report.toUpperCase()) {
    case SupportedTypes[0].toUpperCase():
      try {
        const worksheet = XLSX.utils.json_to_sheet(Data, header);
        XLSX.utils.book_append_sheet(wb, worksheet, workSheetName);
      } catch (err) {
        console.log('error: ', err)
      }      
      break
  }
}
const WriteDataFromAggregator =  (wb,config) => {
    switch (config.output.report.toUpperCase()) {
        case SupportedTypes[0].toUpperCase():
          try {
            XLSX.writeFile(wb, `${config.output.path}`);
        } catch (err) {
            console.log('error: ', err)
          }          
          break
      }  
}
module.exports = { InitAggregator,AddDataToAggregator,WriteDataFromAggregator }
