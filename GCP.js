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

const init = async (gcpcfg, cfgIndex, config, DataStore, funcList, stats) => {
  try {
    console.log("Init GCP");
    if (gcpcfg.ORG_ID != undefined) {
      if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        process.env.GOOGLE_APPLICATION_CREDENTIALS = gcpcfg.GOOGLE_APPLICATION_CREDENTIALS
      }
      AccID = getAccID(gcpcfg.GOOGLE_APPLICATION_CREDENTIALS)
      const AggConf = InitAggregator(config, config.GCP[cfgIndex].tag)
      outputWritter = { AggConf, AddDataToAggregator }

      for (const func of funcList) {
        var runtimeReport
        switch (func) {
          case "getGCPVMs":
            runtimeReport = await getGCPVMs(gcpcfg.ORG_ID, cfgIndex, config, DataStore, outputWritter);
            stats.push({ ...runtimeReport, 'account_id': AccID })
            break;
          case "getGCPProjects":
            runtimeReport = await getGCPProjects(gcpcfg.ORG_ID, cfgIndex, config, DataStore, outputWritter);
            stats.push({ ...runtimeReport, 'account_id': AccID })
            break;
          case 'beta':
            runtimeReport = await getGCPVMs(gcpcfg.ORG_ID, cfgIndex, config, DataStore, outputWritter);
            stats.push({ ...runtimeReport, 'account_id': AccID })
            runtimeReport = await getGCPProjects(gcpcfg.ORG_ID, cfgIndex, config, DataStore, outputWritter);
            stats.push({ ...runtimeReport, 'account_id': AccID })
            break

          // case "getGCPAssets":
          //   runtimeReport = await getGCPAssets(gcpcfg.ORG_ID, cfgIndex, config, DataStore, outputWritter);
          //   break;
          // case "getGCPFindings":
          //   runtimeReport = await getGCPFindings(gcpcfg.ORG_ID, cfgIndex, config, DataStore, outputWritter);
          //   break;
          // case "getGCPLicense":
          //   runtimeReport = await getGCPLicense(gcpcfg.ORG_ID, cfgIndex, config, DataStore, outputWritter);
          //   break;
          // case "getGCPIP":
          //   runtimeReport = await getGCPIP(gcpcfg.ORG_ID, cfgIndex, config, DataStore, outputWritter);
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

const getGCPProjects = async (organizationId, cfgIndex, config, DataStore, outputWritter) => {
  try {
    const { Resource } = require('@google-cloud/resource');
    const resource = new Resource();
    const [projects] = await resource.getProjects();
    const replacements = {
      "metadata": {
        "projectNumber": "project_id",
        "projectId": "project_name",
        "createTime": "first_seen",
        "parent": {
          "id": "organization"
        }
      }
    }
    const headerList = [
      'mars_tag',
      'project_id',
      'project_name',
      'first_seen',
      'organization'
    ]
    const extras = { 'mars_tag': config.GCP[cfgIndex].tag }
    const dataRemapped = TransformJson(projects, replacements, extras)
    data = { data: dataRemapped, header: { header: headerList }, workSheetName: 'getGCPProjects', funcName: 'getGCPProjects' }
    await outputWritter.AddDataToAggregator(outputWritter.AggConf, data)
    return { name: 'getGCPProjects', apiurl: "@google-cloud/resource", entries: projects.length, reason: null }
  } catch (err) {
    console.log('error:', err)
    return { name: 'getGCPProjects', apiurl: "@google-cloud/resource", entries: 0, reason: JSON.stringify(err, null, 4) }
  }
}

const getGCPVMs = async (organizationId, cfgIndex, config, DataStore, outputWritter) => {
  try {
    const { Resource } = require('@google-cloud/resource');
    const resource = new Resource();
    const [projects] = await resource.getProjects();
    vmlist = []
    for (const project of projects) {
      const client = new Compute({ projectId: project.id })
      await client.getVMs().then(vms => {
        const replacements = {
          "id": "instance_id",
          "metadata": {
            "creationTimestamp": "creation_tls",
            "lastStartTimestamp": "first_seen",
            "lastStopTimestamp": "last_seen",
            "name": "vm_name",
            "status": "current_status",
            "machineType": "machine_type",
            "cpuPlatform": "cpu_type",
          },
          "zone": {
            "id": "zone",
          }
        }
        const extras = { 'mars_tag': config.GCP[cfgIndex].tag }
        dataArr = TransformObjToArr(vms)
        const dataRemapped = TransformJson(dataArr, replacements, extras)
        vmlist.push(...dataRemapped)
      }).catch(err => {
        console.log('catch getvms error:', JSON.stringify(err.message, null, 4))
      })
    }
    const headerList = [
      'mars_tag',
      'instance_id',
      'zone',
      'first_seen',
      'current_status',
      'machine_type',
      'cpu_type',
      'vm_name',
      'creation_tls',
      'last_seen'
    ]
    for (const vm of vmlist) {
      const re = /\/([a-z]\d)-.*$/
      vm.machine_type = re.exec(vm.machine_type)[0].replace("/", "")
    }
    data = { data: vmlist, header: { header: headerList }, workSheetName: 'getGCPVMs', funcName: 'getGCPVMs' }
    await outputWritter.AddDataToAggregator(outputWritter.AggConf, data)
    return { name: 'getGCPVMs', apiurl: "Compute Engine API", entries: vmlist.length, reason: null }
  } catch (err) {
    console.log('error:', err)
    return { name: 'getGCPVMs', apiurl: "Compute Engine API", entries: 0, reason: JSON.stringify(err, null, 4) }
  }
};

// const getGCPAssets = async (organizationId, cfgIndex, config, DataStore, LogWritter) => {
//   try {
//     const client = new sc.SecurityCenterClient();
//     const orgName = client.organizationPath(organizationId);
//     const [response] = await client.listAssets({ parent: orgName });
//     const replacements = {
//       "asset": {
//         "resourceProperties": {
//           "projectId": {
//             "stringValue": "project_id",
//           },
//           "createTime": {
//             "stringValue": "creation_tls"
//           }
//         }
//       }
//     }
//     const headerList = [
//       'mars_tag',
//       'project_id',
//       'creation_tls'
//     ]
//     const extras = { 'mars_tag': config.GCP[cfgIndex].tag }
//     const dataRemapped = TransformJson(response, replacements, extras)
//     console.log(`${JSON.stringify(dataRemapped, null, 4)}`)
//     return { name: 'getGCPAssets', apiurl: "Security Center API", entries: vmlist.length, reason: null }
//   } catch (err) {
//     console.log('error:', err)
//     return { name: 'getGCPAssets', apiurl: "Security Center API", entries: 0, reason: JSON.stringify(err, null, 4) }
//   }
// };

// const getGCPFindings = async (organizationId, cfgIndex, config, DataStore, LogWritter) => {
//   try {
//     const client = new sc.SecurityCenterClient();
//     const orgName = client.organizationPath(organizationId);
//     const [response] = await client.listFindings({ parent: orgName });
//     console.log(`${JSON.stringify(response, null, 4)}`)

//     return { name: 'getGCPFindings', apiurl: "Security Center API", entries: vmlist.length, reason: null }
//   } catch (err) {
//     console.log('error:', err)
//     return { name: 'getGCPFindings', apiurl: "Security Center API", entries: 0, reason: JSON.stringify(err, null, 4) }
//   }
// };

module.exports = { init };