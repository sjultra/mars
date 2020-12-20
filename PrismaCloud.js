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

const axios = require('axios');
const { InitAggregator, AddDataToAggregator, WriteDataFromAggregator } = require('./reports/report.js');
const { ReportBuilder } = require('./reports/utils.js');

const PREDEF = {
    "stable": ['getPrismaStatus', 'getPrismaUsers', 'getPrismaSA', 'getPrismaAuditLogs', 'getPrismaPolicies', 'getPrismaCompliance', 'getPrismaPolicyCompliance', 'getPrismaConnClouds', 'getPrismaSSOBypass', 'getPrismaAlerts'],
    "beta": ['getPrismaStatus', 'getPrismaUsers', 'getPrismaSA', 'getPrismaAuditLogs', 'getPrismaPolicies', 'getPrismaCompliance', 'getPrismaPolicyCompliance', 'getPrismaConnClouds', 'getPrismaSSOBypass', 'getPrismaAlerts', 'getPrismaInventoryTag', 'getPrismaResourceScans', 'getPrismaInventoryFilters'],
    "alpha": ['getPrismaInventoryFilters']
}

const TIMEKEYS = ["ruleLastModifiedOn","requestedTimestamp", "alertTime", "firstSeen", "lastSeen", "alertTime", "timestamp", "createdOn", "lastModifiedOn", "createdTs", "lastUsedTime", "expiresOn", "lastModifiedTs", "lastLoginTs"]



const ConvertTimeToHumanReadable = (data) => {
    if (Array.isArray(data)) {
        for (const entry of data) {
            const KeysAvailable = Object.keys(entry).filter(value => TIMEKEYS.includes(value));
            for (const key of KeysAvailable) {
                if (entry[key] !== undefined && entry[key] !== null && entry[key] !== '') {
                    const dateNew = new Date(entry[key])
                    entry[key] = dateNew.toISOString().replace("T", " ").replace("Z", "")
                }
            }
        }
    } else if (data instanceof Object) {
        const KeysAvailable = Object.keys(data).filter(value => TIMEKEYS.includes(value));
        for (const key of KeysAvailable) {
            if (data[key] !== undefined && data[key] !== null && data[key] !== '') {
                const dateNew = new Date(data[key])
                data[key] = dateNew.toISOString().replace("T", " ").replace("Z", "")
            }
        }
    }
}

const deObjectify = (data) => {
    const Arr = []
    for (const key of Object.keys(data)) {
        Arr.push(...data[key])
    }
    return Arr
}

const init = async (pcfg, cfgIndex, config, DataStore, funcList, stats) => {

    if (funcList.includes("beta")) {
        funcList = PREDEF.beta
    } else if (funcList.includes("stable")) {
        funcList = PREDEF.stable
    } else if (funcList.includes("alpha")) {
        funcList = PREDEF.alpha
    }

    console.log('Init Prisma cloud');
    const api = pcfg.api + '/login/';
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        url: api,
        data: {
            username: pcfg.ApiID,
            password: pcfg.ApiSecretKey,
        },
    };

    try {
        await axios(options).then(async (response) => {
            DataStore.set('x-redlock-auth', response.data.token);
            if (DataStore.get('x-redlock-auth') != undefined) {
                const AggConf = InitAggregator(config, config.PrismaCloud[cfgIndex].tag)
                outputWritter = { AggConf, AddDataToAggregator }
                for (const func of funcList) {
                    var runtimeReport
                    switch (func) {
                        case 'getPrismaUsers':
                            runtimeReport = await getPrismaUsers(pcfg.api, cfgIndex, config, DataStore, outputWritter);
                            stats.push({ ...runtimeReport, 'account_id': pcfg.ApiID })
                            break
                        case 'getPrismaSA':
                            runtimeReport = await getPrismaSA(pcfg.api, cfgIndex, config, DataStore, outputWritter)
                            stats.push({ ...runtimeReport, 'account_id': pcfg.ApiID })
                            break
                        case 'getPrismaAuditLogs':
                            runtimeReport = await getPrismaAuditLogs(pcfg.api, cfgIndex, config, DataStore, outputWritter);
                            stats.push({ ...runtimeReport, 'account_id': pcfg.ApiID })
                            break
                        case 'getPrismaPolicies':
                            runtimeReport = await getPrismaPolicies(pcfg.api, cfgIndex, config, DataStore, outputWritter)
                            stats.push({ ...runtimeReport, 'account_id': pcfg.ApiID })
                            break
                        case 'getPrismaCompliance':
                            runtimeReport = await getPrismaCompliance(pcfg.api, cfgIndex, config, DataStore, outputWritter)
                            stats.push({ ...runtimeReport, 'account_id': pcfg.ApiID })
                            break
                        case 'getPrismaPolicyCompliance':
                            runtimeReport = await getPrismaPolicyCompliance(pcfg.api, cfgIndex, config, DataStore, outputWritter)
                            stats.push({ ...runtimeReport, 'account_id': pcfg.ApiID })
                            break
                        case 'getPrismaAlerts':
                            runtimeReport = await getPrismaAlerts(pcfg.api, cfgIndex, config, DataStore, outputWritter)
                            stats.push({ ...runtimeReport, 'account_id': pcfg.ApiID })
                            break
                        case 'getPrismaStatus':
                            runtimeReport = await getPrismaStatus(pcfg.api, cfgIndex, config, DataStore, outputWritter)
                            stats.push({ ...runtimeReport, 'account_id': pcfg.ApiID })
                            break
                        case 'getPrismaSSOBypass':
                            runtimeReport = await getPrismaSSOBypass(pcfg.api, cfgIndex, config, DataStore, outputWritter)
                            stats.push({ ...runtimeReport, 'account_id': pcfg.ApiID })
                            break
                        case 'getPrismaConnClouds':
                            runtimeReport = await getPrismaConnClouds(pcfg.api, cfgIndex, config, DataStore, outputWritter)
                            stats.push({ ...runtimeReport, 'account_id': pcfg.ApiID })
                            break
                        case 'getPrismaResourceScans':
                            runtimeReport = await getPrismaResourceScans(pcfg.api, cfgIndex, config, DataStore, outputWritter)
                            stats.push({ ...runtimeReport, 'account_id': pcfg.ApiID })
                            break
                        case 'getPrismaLicensing':
                            runtimeReport = await getPrismaLicensing(pcfg.api, cfgIndex, config, DataStore, outputWritter)
                            stats.push({ ...runtimeReport, 'account_id': pcfg.ApiID })
                            break
                        case 'getPrismaInventoryTag':
                            runtimeReport = await getPrismaInventoryTag(pcfg.api, cfgIndex, config, DataStore, outputWritter)
                            stats.push({ ...runtimeReport, 'account_id': pcfg.ApiID })
                            break
                        case 'getPrismaInventoryFilters':
                            runtimeReport = await getPrismaInventoryFilters(pcfg.api, cfgIndex, config, DataStore, outputWritter)
                            stats.push({ ...runtimeReport, 'account_id': pcfg.ApiID })
                            break
                    }
                };
                WriteDataFromAggregator(AggConf, config.PrismaCloud[cfgIndex].tag)
            }
        })
    } catch (err) {
        console.log('error:', err)
        stats.push({ 'mars_tag': config.PrismaCloud[cfgIndex].tag, name: 'login', apiurl: options.url, entries: 0, 'account_id': pcfg.ApiID, reason: JSON.stringify(err, null, 4) })
    }
};


const getPrismaSSOBypass = async (pcfgapi, cfgIndex, config, DataStore, outputWritter) => {
    console.log('Getting PrismaCLoud SSO Bypass information');
    const api = pcfgapi + '/user/saml/bypass';
    const jwt = DataStore.get('x-redlock-auth');
    const options = {
        method: 'GET',
        headers: {
            'x-redlock-auth': jwt,
            accept: '*/*',
        },
        url: api,
    };
    try {
        const extras = { 'mars_tag': config.PrismaCloud[cfgIndex].tag }
        const response = await axios(options)
        const dataRemapped = response.data.map(entry => ({ Email: entry, ...extras }))
        ConvertTimeToHumanReadable(dataRemapped)
        data = { data: dataRemapped, funcName: 'getPrismaSSOBypass' }
        outputWritter.AddDataToAggregator(outputWritter.AggConf, data)
        return { 'mars_tag': config.PrismaCloud[cfgIndex].tag, name: 'getPrismaSSOBypass', apiurl: options.url, entries: response.data.length, reason: null }
    } catch (err) {
        console.log('error:', err)
        return { 'mars_tag': config.PrismaCloud[cfgIndex].tag, name: 'getPrismaSSOBypass', apiurl: options.url, entries: 0, reason: JSON.stringify(err, null, 4) }
    }
};

const getPrismaConnClouds = async (pcfgapi, cfgIndex, config, DataStore, outputWritter) => {
    console.log('Getting PrismaCLoud Connected Clouds information');
    const api = pcfgapi + '/cloud';
    const jwt = DataStore.get('x-redlock-auth');
    const options = {
        method: 'GET',
        headers: {
            'x-redlock-auth': jwt,
            accept: '*/*',
        },
        url: api,
    };
    try {
        const extras = { 'mars_tag': config.PrismaCloud[cfgIndex].tag }
        const response = await axios(options)
        const dataRemapped = response.data.map(entry => ({ ...entry, ...extras }))
        ConvertTimeToHumanReadable(dataRemapped)
        data = { data: dataRemapped, funcName: 'getPrismaConnClouds' }
        outputWritter.AddDataToAggregator(outputWritter.AggConf, data)
        return { 'mars_tag': config.PrismaCloud[cfgIndex].tag, name: 'getPrismaConnClouds', apiurl: options.url, entries: response.data.length, reason: null }
    } catch (err) {
        console.log('error:', err)
        return { 'mars_tag': config.PrismaCloud[cfgIndex].tag, name: 'getPrismaConnClouds', apiurl: options.url, entries: 0, reason: JSON.stringify(err, null, 4) }
    }
};

const getPrismaInventoryTag = async (pcfgapi, cfgIndex, config, DataStore, outputWritter) => {
    console.log('Getting PrismaCLoud Inventory Tags information');
    const api = pcfgapi + '/v2/inventory';
    const jwt = DataStore.get('x-redlock-auth');
    const options = {
        method: 'GET',
        headers: {
            'x-redlock-auth': jwt,
            accept: 'application/json; charset=UTF-8',
        },
        params: { listType: 'TAG' },
        url: api
    };
    try {
        const response = await axios(options)
        const dataResponse = JSON.parse(JSON.stringify(response.data.groupedAggregates))
        const extras = { timestamp: response.data.timestamp, requestedTimestamp: response.data.requestedTimestamp, 'mars_tag': config.PrismaCloud[cfgIndex].tag }
        const dataRemapped = dataResponse.map(entry => ({ ...entry, ...extras }))
        ConvertTimeToHumanReadable(dataRemapped)
        data = { data: dataRemapped, funcName: 'getPrismaInventoryTag' }
        outputWritter.AddDataToAggregator(outputWritter.AggConf, data)
        return { 'mars_tag': config.PrismaCloud[cfgIndex].tag, name: 'getPrismaInventoryTag', apiurl: options.url, entries: response.data.summary, reason: null }
    } catch (err) {
        console.log('error:', err)
        return { 'mars_tag': config.PrismaCloud[cfgIndex].tag, name: 'getPrismaInventoryTag', apiurl: options.url, entries: 0, reason: JSON.stringify(err, null, 4) }
    }
};

const getPrismaInventoryFilters = async (pcfgapi, cfgIndex, config, DataStore, outputWritter) => {
    console.log('Getting PrismaCLoud Inventory Filters information');
    const api = pcfgapi + '/filter/inventory';
    const jwt = DataStore.get('x-redlock-auth');
    const options = {
        method: 'GET',
        headers: {
            'x-redlock-auth': jwt,
            accept: 'application/json; charset=UTF-8',
        },
        url: api
    };
    try {
        const response = await axios(options)
        const dataResponse = JSON.parse(JSON.stringify(response.data))
        const extras = { timestamp: response.data.timestamp, 'mars_tag': config.PrismaCloud[cfgIndex].tag }
        const dataRemapped = dataResponse.map(entry => ({ ...entry, ...extras }))
        ConvertTimeToHumanReadable(dataRemapped)
        data = { data: dataRemapped, funcName: 'getPrismaInventoryFilters' }
        outputWritter.AddDataToAggregator(outputWritter.AggConf, data)
        return { 'mars_tag': config.PrismaCloud[cfgIndex].tag, name: 'getPrismaInventoryFilters', apiurl: options.url, entries: dataRemapped.length, reason: null }
    } catch (err) {
        console.log('error:', err)
        return { 'mars_tag': config.PrismaCloud[cfgIndex].tag, name: 'getPrismaInventoryFilters', apiurl: options.url, entries: 0, reason: JSON.stringify(err, null, 4) }
    }
};

const getPrismaResourceScans = async (pcfgapi, cfgIndex, config, DataStore, outputWritter) => {
    console.log('Getting PrismaCLoud Resource Scans information');
    const api = pcfgapi + '/resource/scan_info';
    const jwt = DataStore.get('x-redlock-auth');
    const options = {
        method: 'GET',
        headers: {
            'x-redlock-auth': jwt,
            accept: 'application/json; charset=UTF-8',
        },
        url: api
    };
    try {
        const response = await axios(options)
        const dataResponse = JSON.parse(JSON.stringify(response.data.resources))
        const extras = { timestamp: response.data.timestamp, 'mars_tag': config.PrismaCloud[cfgIndex].tag }
        const dataRemapped = dataResponse.map(entry => ({ ...entry, ...extras }))
        ConvertTimeToHumanReadable(dataRemapped)
        data = { data: dataRemapped, funcName: 'getPrismaResourceScans' }
        outputWritter.AddDataToAggregator(outputWritter.AggConf, data)
        return { 'mars_tag': config.PrismaCloud[cfgIndex].tag, name: 'getPrismaResourceScans', apiurl: options.url, entries: dataRemapped.length, reason: null }
    } catch (err) {
        console.log('error:', err)
        return { 'mars_tag': config.PrismaCloud[cfgIndex].tag, name: 'getPrismaResourceScans', apiurl: options.url, entries: 0, reason: JSON.stringify(err, null, 4) }
    }
};

const getPrismaStatus = async (pcfgapi, cfgIndex, config, DataStore, outputWritter) => {
    console.log('Getting PrismaCLoud Status information');
    const api = pcfgapi + '/check';
    const jwt = DataStore.get('x-redlock-auth');
    const options = {
        method: 'GET',
        headers: {
            'x-redlock-auth': jwt,
            accept: '*/*',
        },
        url: api,
    };
    try {
        const response = await axios(options)
        return { 'mars_tag': config.PrismaCloud[cfgIndex].tag, name: 'getPrismaStatus', apiurl: options.url, entries: response.statusText, reason: null }
    } catch (err) {
        console.log('error:', err)
        return { 'mars_tag': config.PrismaCloud[cfgIndex].tag, name: 'getPrismaStatus', apiurl: options.url, entries: 0, reason: JSON.stringify(err, null, 4) }
    }
};

const getPrismaUsers = async (pcfgapi, cfgIndex, config, DataStore, outputWritter) => {
    console.log('Getting PrismaCLoud Users information');
    const api = pcfgapi + '/user';
    const jwt = DataStore.get('x-redlock-auth');
    const options = {
        method: 'GET',
        headers: {
            'x-redlock-auth': jwt,
            accept: '*/*',
        },
        url: api,
    };
    try {
        const extras = { 'mars_tag': config.PrismaCloud[cfgIndex].tag }
        const response = await axios(options)
        const dataRemapped = response.data.map(entry => ({ ...entry, ...extras }))
        ConvertTimeToHumanReadable(dataRemapped)
        data = { data: dataRemapped, funcName: 'getPrismaUsers' }
        outputWritter.AddDataToAggregator(outputWritter.AggConf, data)
        return { 'mars_tag': config.PrismaCloud[cfgIndex].tag, name: 'getPrismaUsers', apiurl: options.url, entries: response.data.length, reason: null }
    } catch (err) {
        console.log('error:', err)
        return { 'mars_tag': config.PrismaCloud[cfgIndex].tag, name: 'getPrismaUsers', apiurl: options.url, entries: 0, reason: JSON.stringify(err, null, 4) }
    }
};

const getPrismaSA = async (pcfgapi, cfgIndex, config, DataStore, outputWritter) => {
    console.log('Getting PrismaCLoud SA information');
    const api = pcfgapi + '/access_keys';
    const jwt = DataStore.get('x-redlock-auth');
    const options = {
        method: 'GET',
        headers: {
            'x-redlock-auth': jwt,
            accept: '*/*',
        },
        url: api,
    };
    try {
        const extras = { 'mars_tag': config.PrismaCloud[cfgIndex].tag }
        const response = await axios(options)
        const dataRemapped = response.data.map(entry => ({ ...entry, ...extras }))
        ConvertTimeToHumanReadable(dataRemapped)
        data = { data: dataRemapped, funcName: 'getPrismaSA' }
        outputWritter.AddDataToAggregator(outputWritter.AggConf, data)
        return { 'mars_tag': config.PrismaCloud[cfgIndex].tag, name: 'getPrismaSA', apiurl: options.url, entries: response.data.length, reason: null }
    } catch (err) {
        console.log('error:', err)
        return { 'mars_tag': config.PrismaCloud[cfgIndex].tag, name: 'getPrismaSA', apiurl: options.url, entries: 0, reason: JSON.stringify(err, null, 4) }
    }
};
const getPrismaAuditLogs = async (pcfgapi, cfgIndex, config, DataStore, outputWritter) => {
    console.log('Getting PrismaCLoud Audit Logs information');
    const api = pcfgapi + '/audit/redlock';
    const jwt = DataStore.get('x-redlock-auth');
    const options = {
        method: 'GET',
        headers: {
            'x-redlock-auth': jwt,
            accept: 'application/json; charset=UTF-8',
        },
        params: { timeType: 'relative', timeAmount: '7', timeUnit: 'day' },
        url: api,
    };
    try {
        const extras = { 'mars_tag': config.PrismaCloud[cfgIndex].tag }
        const response = await axios(options)
        const dataRemapped = response.data.map(entry => ({ ...entry, ...extras }))
        ConvertTimeToHumanReadable(dataRemapped)
        data = { data: dataRemapped, funcName: 'getPrismaAuditLogs' }
        outputWritter.AddDataToAggregator(outputWritter.AggConf, data)
        return { 'mars_tag': config.PrismaCloud[cfgIndex].tag, name: 'getPrismaAuditLogs', apiurl: options.url, entries: response.data.length, reason: null }
    } catch (err) {
        console.log('error:', err)
        return { 'mars_tag': config.PrismaCloud[cfgIndex].tag, name: 'getPrismaAuditLogs', apiurl: options.url, entries: 0, reason: JSON.stringify(err, null, 4) }
    }
};

const getPrismaPolicies = async (pcfgapi, cfgIndex, config, DataStore, outputWritter) => {
    console.log('Getting PrismaCLoud Policies Information');
    const api = pcfgapi + '/v2/policy';
    const jwt = DataStore.get('x-redlock-auth');
    const options = {
        method: 'GET',
        headers: {
            'x-redlock-auth': jwt,
            accept: 'application/json; charset=UTF-8',
        },
        url: api,
    };
    try {
        const extras = { 'mars_tag': config.PrismaCloud[cfgIndex].tag }
        const response = await axios(options)
        const dataRemapped = response.data.map(entry => ({ ...entry, ...extras }))
        const dataRemappedCP = JSON.parse(JSON.stringify(dataRemapped))
        await getQueryForPolicy(pcfgapi, DataStore, dataRemapped, (data) => {
            ConvertTimeToHumanReadable(data)
            data = { data: data, funcName: 'getPrismaPolicies' }
            outputWritter.AddDataToAggregator(outputWritter.AggConf, data)
        })
        summaryData = ReportBuilder(dataRemappedCP, 'labels', 'name')
        data = { data: summaryData, funcName: 'getlabelSummaryPrismaPolicies' }
        outputWritter.AddDataToAggregator(outputWritter.AggConf, data)
        return { 'mars_tag': config.PrismaCloud[cfgIndex].tag, name: 'getPrismaPolicies', apiurl: options.url, entries: dataRemapped.length, reason: null }
    } catch (err) {
        console.log('error:', err)
        return { 'mars_tag': config.PrismaCloud[cfgIndex].tag, name: 'getPrismaPolicies', apiurl: options.url, entries: 0, reason: JSON.stringify(err, null, 4) }
    }
};

const getPrismaAlerts = async (pcfgapi, cfgIndex, config, DataStore, outputWritter) => {
    console.log('Getting PrismaCLoud Alerts Information');
    const api = pcfgapi + '/alert?timeType=relative&timeAmount=1&timeUnit=week&detailed=true';
    const jwt = DataStore.get('x-redlock-auth');
    const options = {
        method: 'GET',
        headers: {
            'x-redlock-auth': jwt,
            accept: 'application/json; charset=UTF-8',
        },
        url: api,
    };
    try {
        const extras = { 'mars_tag': config.PrismaCloud[cfgIndex].tag }
        const response = await axios(options)
        const dataRemapped = response.data.map(entry => ({ ...entry, ...extras }))
        ConvertTimeToHumanReadable(dataRemapped)
        data = { data: dataRemapped, funcName: 'getPrismaAlerts' }
        outputWritter.AddDataToAggregator(outputWritter.AggConf, data)
        return { 'mars_tag': config.PrismaCloud[cfgIndex].tag, name: 'getPrismaAlerts', apiurl: options.url, entries: dataRemapped.length, reason: null }
    } catch (err) {
        console.log('error:', err)
        return { 'mars_tag': config.PrismaCloud[cfgIndex].tag, name: 'getPrismaAlerts', apiurl: options.url, entries: 0, reason: JSON.stringify(err, null, 4) }
    }
};

const getPrismaCompliance = async (pcfgapi, cfgIndex, config, DataStore, outputWritter) => {
    console.log('Getting PrismaCLoud Compliance information');
    const api = pcfgapi + '/compliance';
    const jwt = DataStore.get('x-redlock-auth');
    const options = {
        method: 'GET',
        headers: {
            'x-redlock-auth': jwt,
            accept: 'application/json; charset=UTF-8',
        },
        url: api,
    };
    try {
        const extras = { 'mars_tag': config.PrismaCloud[cfgIndex].tag }
        const response = await axios(options)
        const dataRemapped = response.data.map(entry => ({ ...entry, ...extras }))
        ConvertTimeToHumanReadable(dataRemapped)
        data = { data: dataRemapped, funcName: 'getPrismaCompliance' }
        outputWritter.AddDataToAggregator(outputWritter.AggConf, data)
        return { 'mars_tag': config.PrismaCloud[cfgIndex].tag, name: 'getPrismaCompliance', apiurl: options.url, entries: dataRemapped.length, reason: null }
    } catch (err) {
        console.log(err)
        return { 'mars_tag': config.PrismaCloud[cfgIndex].tag, name: 'getPrismaCompliance', apiurl: options.url, entries: 0, reason: JSON.stringify(err, null, 4) }
    }
};

const getPrismaPolicyCompliance = async (pcfgapi, cfgIndex, config, DataStore, outputWritter) => {
    console.log('Getting PrismaCLoud Policy Compliance Information');
    const api = pcfgapi + '/policy/compliance';
    const jwt = DataStore.get('x-redlock-auth');
    const options = {
        method: 'GET',
        headers: {
            'x-redlock-auth': jwt,
            accept: 'application/json; charset=UTF-8',
        },
        url: api,
    };
    try {
        const extras = { 'mars_tag': config.PrismaCloud[cfgIndex].tag }
        const response = await axios(options)
        const dataResp = deObjectify(response.data)
        const dataRemapped = dataResp.map(entry => ({ ...entry, ...extras }))
        ConvertTimeToHumanReadable(dataRemapped)
        data = { data: dataRemapped, funcName: 'getPrismaPolicyCompliance' }
        outputWritter.AddDataToAggregator(outputWritter.AggConf, data)
        return { 'mars_tag': config.PrismaCloud[cfgIndex].tag, name: 'getPrismaPolicyCompliance', apiurl: options.url, entries: dataResp.length, reason: null }
    } catch (err) {
        console.log(err)
        return { 'mars_tag': config.PrismaCloud[cfgIndex].tag, name: 'getPrismaPolicyCompliance', apiurl: options.url, entries: 0, reason: JSON.stringify(err, null, 4) }
    }
};


const getQueryForPolicy = async (pcfgapi, DataStore, data, callback) => {
    try {
        console.log('Getting PrismaCLoud RQL Information');
        for (const element of data) {
            if (element.rule.criteria && element.rule.criteria.match(/.{8}-.{4}-.{4}-.{4}-.{12}/g)) {
                const api = pcfgapi + `/search/history/${element.rule.criteria}`;
                const jwt = DataStore.get('x-redlock-auth');
                const options = {
                    method: 'GET',
                    headers: {
                        'x-redlock-auth': jwt,
                        accept: 'application/json; charset=UTF-8',
                    },
                    url: api,
                }
                response = await axios(options)
                element.rql = response.data
            } else {
                element.rql = 'N/A'
            }
        }
        callback(data)
    } catch (err) {
        console.log('error:', err)
        throw err
    }
};


module.exports = { init };