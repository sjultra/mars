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

const axios = require("axios");
let xmlParser = require('xml2json');
const { InitAggregator, AddDataToAggregator, WriteDataFromAggregator } = require('./reports/report.js');

const init = async (qcfg, cfgIndex, config, DataStore, funcList, stats) => {
  console.log("Init Qualys");
  const AggConf = InitAggregator(config, config.Qualys[cfgIndex].tag)
  outputWritter = { AggConf, AddDataToAggregator }
  try {
    if (qcfg.api != undefined) {
      for (const func of funcList) {
        var runtimeReport
        switch (func) {
          case 'getQualysAssets':
            runtimeReport = await getQualysAssets(qcfg, cfgIndex, config, DataStore, outputWritter)
            stats.push({ ...runtimeReport, 'account_id': qcfg.username })
            break
          case 'getQualysAWSCloudConnector':
            runtimeReport = await getQualysAWSCloudConnector(qcfg, cfgIndex, config, DataStore, outputWritter)
            stats.push({ ...runtimeReport, 'account_id': qcfg.username })
            break
          case 'beta':
            runtimeReport = await getQualysAssets(qcfg, cfgIndex, config, DataStore, outputWritter)
            stats.push({ ...runtimeReport, 'account_id': qcfg.username })
            runtimeReport = await getQualysAWSCloudConnector(qcfg, cfgIndex, config, DataStore, outputWritter)
            stats.push({ ...runtimeReport, 'account_id': qcfg.username })
            break
        }
      }
      WriteDataFromAggregator(AggConf, config.Qualys[cfgIndex].tag)
    }
  } catch (err) {
    console.log('error:', err)
    stats.push({ 'mars_tag': config.Qualys[cfgIndex].tag, name: 'login', apiurl: options.url, entries: 0, 'account_id': qcfg.username, reason: JSON.stringify(err, null, 4) })
  }
};

const getQualysAssets = async (qcfg, cfgIndex, config, DataStore, outputWritter) => {
  console.log("Getting Qualys information");
  const api = qcfg.api + "/api/2.0/fo/asset/host/?action=list";
  const options = {
    method: "GET",
    headers: {
      "Content-Type": "text/xml",
      "X-Requested-With": "Agent reporter",
    },
    url: api,
    auth: {
      username: qcfg.username,
      password: qcfg.password,
    },
  };
  try {
    const response = await axios(options);
    console.log(response)
    fmtData = xmlParser.toJson(response.data, { object: true }).HOST_LIST_OUTPUT.RESPONSE.HOST_LIST.HOST
    console.log("fmtData: ", JSON.stringify(fmtData))
    const extras = { 'mars_tag': config.Qualys[cfgIndex].tag }
    const dataRemapped = fmtData.map(entry => ({ ...entry, ...extras }))
    data = { data: dataRemapped, funcName: 'getQualysAssets' }
    outputWritter.AddDataToAggregator(outputWritter.AggConf, data)
    return { 'mars_tag': config.Qualys[cfgIndex].tag, name: 'getQualysAssets', apiurl: options.url, entries: dataRemapped.length, reason: null }
  } catch (err) {
    console.log('error:', err)
    return { 'mars_tag': config.Qualys[cfgIndex].tag, name: 'getQualysAssets', apiurl: options.url, entries: 0, reason: JSON.stringify(err, null, 4) }
  }
};

const getQualysAWSCloudConnector = async (qcfg, cfgIndex, config, DataStore, outputWritter) => {
  //   console.log("Getting Qualys information");
  //   const api = qcfg.api + "/cloudview-api/rest/v1/aws/connectors?pageNo=0&pageSize=50";
  //   const options = {
  //     method: "GET",
  //     headers: {
  //       "Content-Type": "text/xml",
  //       "X-Requested-With": "Agent reporter",
  //     },
  //     url: api,
  //     auth: {
  //       username: qcfg.username,
  //       password: qcfg.password,
  //     },
  //   };
  //   try {
  //   const response = await axios(options);
  //   console.log(response)
  //   fmtData = xmlParser.toJson(response.data, { object: true })
  //   console.log("fmtData: ", JSON.stringify(fmtData))
  //   const extras = { 'mars_tag': config.Qualys[cfgIndex].tag }
  //   const dataRemapped = fmtData.map(entry => ({ ...entry, ...extras }))
  //   data = { data: dataRemapped, funcName: 'getQualysAWSCloudConnector' }
  //   outputWritter.AddDataToAggregator(outputWritter.AggConf, data)
  //   return { 'mars_tag': config.Qualys[cfgIndex].tag, name: 'getQualysAWSCloudConnector', apiurl: options.url, entries: dataRemapped.length, reason: null }
  // } catch (err) {
  //   console.log('error:', err)
  //   return { 'mars_tag': config.Qualys[cfgIndex].tag, name: 'getQualysAWSCloudConnector', apiurl: options.url, entries: 0, reason: JSON.stringify(err, null, 4) }
  // }
};

module.exports = { init };

