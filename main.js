const { program } = require("commander");
const fs = require("fs");
const QualysApi = require("./Qualys");
const CSCCApi = require("./CSCC");
const PrismaCloudApi = require("./PrismaCloud");
const cfgParser = require("./configParser.js");
const DStore = require("./dataStore");
const version = require("./package.json").version;
const { LogWritter } = require("./LogWritter")
program.option("-c, --config <src>", "Path to the config file");
program.option("-o, --output <src>", "Path to the output folder");

program.version(version);
program.parse(process.argv);
if (program.debug) console.log(program.opts());

console.log("Initializing memory cache ...");
const Stor = new DStore();

console.log("Loading config ...");
console.log(`${program.config}`, fs.existsSync(`${program.config}`));
config = new cfgParser(program.config);
output = program.output

console.log("Running:");

if (config.Qualys) {
    config.Qualys.forEach((entry,index) => {
        QualysApi.init(entry.credentials, index, config, Stor, entry.requests, LogWritter)
    });
}

if (config.CSCC) {
    config.CSCC.forEach((entry,index) => {
        CSCCApi.init(entry.credentials, index, config, Stor, entry.requests, LogWritter)
    });
}

if (config.PrismaCloud) {
    config.PrismaCloud.forEach((entry, index) => {
        PrismaCloudApi.init(entry.credentials, index, config, Stor, entry.requests, LogWritter);
    });
}
