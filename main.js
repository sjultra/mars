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

const { program } = require("commander");
const fs = require("fs");
const QualysApi = require("./Qualys.js");
const GCPApi = require("./GCP.js");
const PrismaCloudApi = require("./PrismaCloud.js");
const cfgParser = require("./configParser.js");
const DStore = require("./dataStore.js");
const version = require("./package.json").version;
const { InitAggregator, AddDataToAggregator, WriteDataFromAggregator } = require("./reports/report.js");
const { Publish } = require('./publish/publish.js')
const { Convert } = require('./convert/convert.js')

program.option("-c, --config <src>", "Path to the config file");
program.option("-o, --output <src>", "Path to the output folder");

program.version(version);
program.parse(process.argv);
if (program.debug) console.log(program.opts());

console.log("Initializing memory cache ...");
const Stor = new DStore();

console.log("Loading config ...");
console.log(`${program.config}`, fs.existsSync(`${program.config}`));
cfg = new cfgParser(program.config);
output = program.output
console.log("Running:");

const runtimeReportOBJ = []


const runTimeStats = async () => {
    headerList = ['account_id', 'name', 'apiurl', 'entries', 'reason']
    const AggConf = await InitAggregator(cfg)
    data = { data: runtimeReportOBJ, funcName: 'runTimeStats' }
    await AddDataToAggregator(AggConf, data)
    await WriteDataFromAggregator(AggConf, 'runTimeStats')
}

const publish = async () => {
    Publish(cfg)
}

const convert = async () => {
    Convert(cfg)
}

const main = async () => {
    if (cfg.Qualys) {
        for (const [index, entry] of cfg.Qualys.entries()) {
            console.log("inits config")
            await QualysApi.init(entry.credentials, index, cfg, Stor, entry.requests, runtimeReportOBJ)
        }
    }

    if (cfg.GCP) {
        for (const [index, entry] of cfg.GCP.entries()) {
            console.log("inits config")
            await GCPApi.init(entry.credentials, index, cfg, Stor, entry.requests, runtimeReportOBJ)
        }
    }

    if (cfg.PrismaCloud) {
        for (const [index, entry] of cfg.PrismaCloud.entries()) {
            console.log("inits config")
            await PrismaCloudApi.init(entry.credentials, index, cfg, Stor, entry.requests, runtimeReportOBJ)
        }
    }

    await runTimeStats()
    
    if (cfg.convertor) {
        await convert()
    }

    if (cfg.publish) {
        await publish()
    }
}

// process.on('unhandledRejection', (reason) => {
//     console.log('Reason: ' + reason);
// });


main()