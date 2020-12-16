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
const fs = require('fs');
const csv = require('csv-parse/lib/sync');
const xlsx = require('xlsx');

SupportedTypesConvert = ['csvToXLSX', 'jsonToXLSX']

const checkPath = (path) => {
    if (!fs.lstatSync(path).isDirectory()) {
        console.log('Path provided in the config is not a folder.')
        process.exit(0)
    }
}

const Convert = (config) => {
    if (config.convertor && config.convertor.length >= 1) {
        for (const entry of config.convertor) {
            if (!entry.Filename) {
                entry.Filename = "XLSXSummary.xlsx"
            }
            checkPath(entry.path)
            checkPath(entry.outputPath)
            switch (entry.type.toUpperCase()) {
                case SupportedTypesConvert[0].toUpperCase():
                    try {
                        filenames = fs.readdirSync(entry.path)
                        if (filenames.length > 0) {
                            const wb = xlsx.utils.book_new();
                            for (const file of filenames) {
                                if (file.endsWith(".csv")) {
                                    const csvFile = fs.readFileSync(`${entry.path}/${file}`, 'UTF-8');
                                    const csvOptions = {
                                        columns: true,
                                        delimiter: ',',
                                        ltrim: true,
                                        rtrim: true,
                                    };
                                    console.log("\n Adding to xlsx the file: ", file, "\n")
                                    const csvData = csv(csvFile, csvOptions)
                                    if (csvData.length > 0) {
                                        const ws = xlsx.utils.json_to_sheet(csvData)
                                        xlsx.utils.book_append_sheet(wb, ws, file.slice(3, -4));
                                    }
                                }
                            }
                            xlsx.writeFile(wb, entry.outputPath + "/" + entry.Filename);
                        }
                    } catch (error) {
                        console.log(error)
                    }
                    break
                case SupportedTypesConvert[1].toUpperCase():
                    try {
                        filenames = fs.readdirSync(entry.path)
                        if (filenames.length > 0) {
                            const wb = xlsx.utils.book_new();
                            for (const file of filenames) {
                                if (file.endsWith(".json")) {
                                    console.log("\n Adding to xlsx the file: ", file, "\n")
                                    const jsonFile = fs.readFileSync(`${entry.path}/${file}`, 'UTF-8');
                                    const JSONFILEData = JSON.parse(jsonFile)
                                    if (JSONFILEData.length > 0) {
                                        const ws = xlsx.utils.json_to_sheet(JSONFILEData);
                                        xlsx.utils.book_append_sheet(wb, ws, file.slice(3, -5));
                                    }
                                }
                            }
                            xlsx.writeFile(wb, entry.outputPath + "/" + entry.Filename);
                        }
                    } catch (error) {
                        console.log(error)
                    }
                    break
            }
        }
    }
}



module.exports = { Convert }
