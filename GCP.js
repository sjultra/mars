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

const sc = require('@google-cloud/security-center');
const Compute = require('@google-cloud/compute');
const { TranfsormJsonData, TransformObjToArr, TransformJson, ReportBuilder, ReportBuilderConvert } = require('./reports/utils');
const { InitAggregator, AddDataToAggregator, WriteDataFromAggregator } = require('./reports/report');
const fs = require("fs");

const getAccID = (path) => {
  if (fs.existsSync(`${path}`)) {
    const raw = fs.readFileSync(`${path}`);
    let SA = JSON.parse(raw);
    return SA.client_id
  }
}


const PREDEF = {
  "stable": ['getGCPAssets'],
  "beta": ['getGCPAssets'],
  "alpha": [""]
}


const init = async (gcpcfg, cfgIndex, config, DataStore, funcList, stats) => {
  for (const predefConst of Object.keys(PREDEF)) {
    if (funcList.indexOf(predefConst) != -1) {
      funcList.splice(funcList.indexOf(predefConst), 1, ...PREDEF[predefConst]);
    }
  }

  try {
    console.log("Init GCP");
    if (gcpcfg.ORG_ID != undefined) {
      process.env.GOOGLE_APPLICATION_CREDENTIALS = gcpcfg.GOOGLE_APPLICATION_CREDENTIALS
      AccID = getAccID(gcpcfg.GOOGLE_APPLICATION_CREDENTIALS)
      const AggConf = InitAggregator(config, config.GCP[cfgIndex].tag)
      outputWritter = { AggConf, AddDataToAggregator }

      for (const func of funcList) {
        var runtimeReport
        switch (func) {
          case "getGCPAssets":
            runtimeReport = await getGCPAssets(gcpcfg.ORG_ID, cfgIndex, config, DataStore, outputWritter);
            break;
          // case "getGCPFindings":
          //   runtimeReport = await getGCPFindings(gcpcfg.ORG_ID, cfgIndex, config, DataStore, outputWritter);
          //   break;

        }
      };
      WriteDataFromAggregator(AggConf, config.GCP[cfgIndex].tag)
    }
  } catch (err) {
    console.log(err)
    stats.push({ name: 'login', apiurl: options.url, entries: 0, 'account_id': AccID, reason: JSON.stringify(err, null, 4) })
  }
};

const getGCPAssets = async (organizationId, cfgIndex, config, DataStore, LogWritter) => {
  try {
    const client = new sc.SecurityCenterClient();
    const orgName = client.organizationPath(organizationId);
    const [response] = await client.listAssets({ parent: orgName, filter:  'security_center_properties.resource_type="google.compute.instance"'  });
    const extras = { 'mars_tag': config.GCP[cfgIndex].tag }
    const dataRemapped = response.map(entry => ({ ...entry, ...extras }))
    data = { data: dataRemapped, funcName: 'getGCPAssets' }
    outputWritter.AddDataToAggregator(outputWritter.AggConf, data)
    return { name: 'getGCPAssets', apiurl: "Security Cloud Center API", entries: response.length, reason: null }
  } catch (err) {
    console.log('error:', err)
    return { name: 'getGCPAssets', apiurl: "Security Cloud Center API", entries: 0, reason: JSON.stringify(err, null, 4) }
  }
};



module.exports = { init };