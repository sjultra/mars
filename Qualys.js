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
const FormData = require('form-data');
const xmlParser = require('xml2json');
const { InitAggregator, AddDataToAggregator, WriteDataFromAggregator } = require('./reports/report.js');


const PREDEF = {
  "stable": ['getQualysAssets'],
  "beta": ['getQualysAssets', 'getQualysScans'],
  "alpha": [""]
}

const init = async (qcfg, cfgIndex, config, DataStore, funcList, stats) => {
  for (const predefConst of Object.keys(PREDEF)) {
    if (funcList.indexOf(predefConst) != -1) {
      funcList.splice(funcList.indexOf(predefConst), 1, ...PREDEF[predefConst]);
    }
  }
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
          case 'getQualysScans':
            runtimeReport = await getQualysScans(qcfg, cfgIndex, config, DataStore, outputWritter)
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
  /*
  Download a list of scanned hosts in the user’s account. By default, all scanned hosts in the
user account are included and basic information about each host is provided. Hosts in the
XML output are sorted by host ID in ascending order.
  The output of the Host List API is paginated. By default, a maximum of 1,000 host records
are returned per request. You can customize the page size (i.e. the number of host records)
by using the parameter “truncation_limit=10000” for instance. In this case the results will
be return with pages of 10,000 host records.
  */
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
    fmtData = xmlParser.toJson(response.data, { object: true }).HOST_LIST_OUTPUT.RESPONSE.HOST_LIST.HOST
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


const getQualysScans = async (qcfg, cfgIndex, config, DataStore, outputWritter) => {
  console.log("Getting Qualys information");
  /*
  List IP addresses in the user account. By default, all hosts in the user account are
included. Optional input parameters support filtering the list by IP addresses and host
tracking method.
  */
  const api = qcfg.api + "/api/2.0/fo/asset/ip/?action=list";
  var bodyFormData = new FormData();
  bodyFormData.append('action', 'list');
  bodyFormData.append('compliance_enabled', '1');

  const options = {
    method: "POST",
    headers: {
      'Content-Type': 'multipart/form-data',
      'X-Requested-With': 'Agent reporter',
    },
    url: api,
    auth: {
      username: qcfg.username,
      password: qcfg.password,
    },
    data:bodyFormData
  };
  try {
    const response = await axios(options);
    console.log(response)
    fmtDataIP_SET=xmlParser.toJson(response.data, { object: true }).IP_LIST_OUTPUT.RESPONSE.IP_SET
    fmtDataIP = fmtDataIP_SET.IP
    fmtDataIP_RANGE = fmtDataIP_SET.IP_RANGE
    console.log("fmtDataIP: ", JSON.stringify(fmtDataIP))
    console.log("fmtDataIP_RANGE: ", JSON.stringify(fmtDataIP_RANGE))
    const extras = { 'mars_tag': config.Qualys[cfgIndex].tag }
    const dataRemapped = fmtDataIP.map(entry => ({ ...entry, ...extras }))
    data = { data: dataRemapped, funcName: 'getQualysScans' }
    outputWritter.AddDataToAggregator(outputWritter.AggConf, data)
    return { 'mars_tag': config.Qualys[cfgIndex].tag, name: 'getQualysScans', apiurl: options.url, entries: dataRemapped.length, reason: null }
  } catch (err) {
    console.log('error:', err)
    return { 'mars_tag': config.Qualys[cfgIndex].tag, name: 'getQualysScans', apiurl: options.url, entries: 0, reason: JSON.stringify(err, null, 4) }
  }
};



module.exports = { init };

