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

const XLSX = require('xlsx');
const fs = require('fs');
const { parse } = require('json2csv');
const { PrismaClient } = require('@prisma/client')
SupportedTypesReport = ['CSV', 'MYSQL', 'JSON']


const checkPath = (path) => {
  if (!fs.lstatSync(path).isDirectory()) {
    console.log('Path provided in the config is not a folder.')
    process.exit(0)
  }
}

const InitAggregator = (config) => {
  AggregatorConfig = []
  for (const entry of config.output) {
    obj = {
      Type: entry.report.toUpperCase(),
      outputPath: entry.path.replace(/\/?$/, '/'),
      workBook: null,
      workSheetName: null,
      prisma: null
    }
    switch (entry.report.toUpperCase()) {
      case SupportedTypesReport[0].toUpperCase() || SupportedTypesReport[2].toUpperCase():
        checkPath(obj.outputPath)
        break

      case SupportedTypesReport[1].toUpperCase():
        if (entry.path != undefined) {
          if (!process.env.DATABASE_URL) {
            process.env.DATABASE_URL = entry.path
          }
        }
        obj.prisma = new PrismaClient()
        break
    }
    AggregatorConfig.push(obj)
  }
  return AggregatorConfig
}
// DATA: { data:null,header:null,workSheetName:null,funcName:null,}
const AddDataToAggregator = async (AggregatorConfig, Data) => {
  for (const entry of AggregatorConfig) {
    switch (entry.Type) {
      case SupportedTypesReport[0].toUpperCase():
        try {
          if (fs.existsSync(`${entry.outputPath}/${Data.funcName}.csv`)) {
            const csv = parse(Data.data, { header: false });
            fs.appendFileSync(
              `${entry.outputPath}/${Data.funcName}.csv`,
              "\n"+csv,
              function (err) {
                if (err) return console.log(err)
                console.log(`Wrote succesfully the ${entry.outputPath}${Data.funcName}.csv file`)
              }
            )
          } else {
            const csv = parse(Data.data, {});
            fs.appendFileSync(
              `${entry.outputPath}/${Data.funcName}.csv`,
              csv,
              function (err) {
                if (err) return console.log(err)
                console.log(`Wrote succesfully the ${entry.outputPath}${Data.funcName}.csv file`)
              }
            )
          }
        } catch (err) {
          console.log('error: ', err)
        }
        break
      case SupportedTypesReport[1].toUpperCase():
        popkey(Data.data, ['mars_tag'])
        for (const dataInstance of Data.data) {
          console.log(Data.funcName)
          await entry.prisma[Data.funcName].create({ data: dataInstance }).catch(err => { console.log(err) })
        }
        break
      case SupportedTypesReport[2].toUpperCase():
        try {
          if (fs.existsSync(`${entry.outputPath}/${Data.funcName}.json`)) {
            const jsonFile = fs.readFileSync(`${entry.outputPath}/${Data.funcName}.json`, 'UTF-8');
            const JSONFILEData = JSON.parse(jsonFile)
            fs.writeFileSync(
              `${entry.outputPath}${Data.funcName}.json`,
              JSON.stringify([...JSONFILEData,...Data.data], null, 4),
              function (err) {
                if (err) return console.log(err)
                console.log(`Wrote succesfully the ${entry.outputPath}${Data.funcName}.json file`)
              }
            )
          } else {
            fs.appendFileSync(
              `${entry.outputPath}${Data.funcName}.json`,
              JSON.stringify(Data.data, null, 4),
              function (err) {
                if (err) return console.log(err)
                console.log(`Wrote succesfully the ${entry.outputPath}${Data.funcName}.json file`)
              }
            )
          }
        } catch (err) {
          console.log('error: ', err)
        }
        break
    }
  }
}

const WriteDataFromAggregator = (AggregatorConfig, PathMod) => {
  for (const entry of AggregatorConfig) {
    switch (entry.Type) {
      case SupportedTypesReport[0].toUpperCase() || SupportedTypesReport[2].toUpperCase():
        break
      case SupportedTypesReport[1].toUpperCase():
        console.log('Disconnecting from MYSQL')
        entry.prisma.$disconnect()
        break
    }
  }
}

const popkey = (data, popkeys) => {
  for (const entry of data) {
    for (const popkey of popkeys) { delete entry[popkey] }
  }
}

module.exports = { InitAggregator, AddDataToAggregator, WriteDataFromAggregator }
