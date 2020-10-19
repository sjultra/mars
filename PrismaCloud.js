const axios = require("axios");
const { TranfsormJsonData, TransformJson } = require("./reports/utils");
const init = async (pcfg, cfgIndex, config, DataStore, funcList, LogWritter) => {
    try {
        console.log("Init Prisma cloud");
        const api = pcfg.api + "/login/";
        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            url: api,
            data: {
                username: pcfg.ApiID,
                password: pcfg.ApiSecretKey,
            },
        };
        await axios(options).then(response => {
            DataStore.set("x-redlock-auth", response.data.token);
            if (DataStore.get("x-redlock-auth") != undefined) {
                funcList.forEach(func => {
                    switch (func) {
                        case "getUsers": getUsers(pcfg.api, cfgIndex, config, DataStore, LogWritter); break;
                        case "getSA": getSA(pcfg.api, cfgIndex, config, DataStore, LogWritter); break;
                        case "getAuditLogs": getAuditLogs(pcfg.api, cfgIndex, config, DataStore, LogWritter); break;
                        case "getPoliciesLogs": getPoliciesLogs(pcfg.api, cfgIndex, config, DataStore, LogWritter); break;
                        case "getComplianceLogs": getComplianceLogs(pcfg.api, cfgIndex, config, DataStore, LogWritter); break;
                        case "getPolicyComplianceLogs": getPolicyComplianceLogs(pcfg.api, cfgIndex, config, DataStore, LogWritter); break;
                    }
                });
            }
        })
    } catch (err) {
        console.log("error:", err)
    }
};

const getUsers = async (pcfgapi, cfgIndex, config, DataStore, LogWritter) => {
    try {
        console.log("Getting PrismaCLoud information");
        const api = pcfgapi + "/user";
        const jwt = DataStore.get("x-redlock-auth");
        const options = {
            method: "GET",
            headers: {
                "x-redlock-auth": jwt,
                accept: "*/*",
            },
            url: api,
        };
        const response = await axios(options);
        LogWritter(config, "json", `${JSON.stringify(response.data, null, 4)}`, `prisma_get_users_${cfgIndex}`)
    } catch (err) {
        console.log("error:", err)
    }
};

const getSA = async (pcfgapi, cfgIndex, config, DataStore, LogWritter) => {
    try {
        console.log("Getting PrismaCLoud information");
        const api = pcfgapi + "/access_keys";
        const jwt = DataStore.get("x-redlock-auth");
        const options = {
            method: "GET",
            headers: {
                "x-redlock-auth": jwt,
                accept: "*/*",
            },
            url: api,
        };
        const response = await axios(options);
        LogWritter(config, "json", `${JSON.stringify(response.data, null, 4)}`, `prisma_get_SA_${cfgIndex}`)
    } catch (err) {
        LogWritter(config, "err", `${JSON.stringify(err, null, 4)}`, `prisma_get_SA_${cfgIndex}`)
    }
};

const getAuditLogs = async (pcfgapi, cfgIndex, config, DataStore, LogWritter) => {
    try {
        console.log("Getting PrismaCLoud information");
        const api = pcfgapi + "/audit/redlock";
        const jwt = DataStore.get("x-redlock-auth");
        const options = {
            method: "GET",
            headers: {
                "x-redlock-auth": jwt,
                accept: "application/json; charset=UTF-8",
            },
            params: { timeType: "relative", timeAmount: "7", timeUnit: "day" }, // check here
            url: api,
        };
        const response = await axios(options);
        LogWritter(config, "json", `${JSON.stringify(response.data, null, 4)}`, `prisma_get_Audit_Logs_${cfgIndex}`)
    } catch (err) {
        console.log("error:", err)
    }
};

const getPoliciesLogs = async (pcfgapi, cfgIndex, config, DataStore, LogWritter) => {
    try {
        console.log("Getting PrismaCLoud information");
        const api = pcfgapi + "/v2/policy";
        const jwt = DataStore.get("x-redlock-auth");
        const options = {
            method: "GET",
            headers: {
                "x-redlock-auth": jwt,
                accept: "application/json; charset=UTF-8",
            },
            url: api,
        };
        const response = await axios(options);
        const opts = { fields: ["Instance", "Policy Descriptor", "Policy Name", "Compliance Requirement", "Compliance Section", "Category", "Policy Class", "Policy Sub Types", "Cloud", "Severity", "Policy Type", "Labels", "Remediable", "Policy Mode", "Standards", "Last Modified By", "Last Modified By", "Status", "RQL"] }
        const replacements = {
            'policyUpi': 'Policy Descriptor',
            'name': 'Policy Name',
            'complianceMetadata': {
                'requirementName': 'Compliance Requirement',
                'sectionId': 'Compliance Section',
                'standardName': 'Standards'
            },
            'rule': { 'criteria': 'RQL' },
            'policyCategory': 'Category',
            'policyClass': 'Policy Class',
            'policySubTypes': 'Policy Sub Types',
            'severity': 'Severity',
            'policyType': 'Policy Type',
            'labels': 'Labels',
            'remediable': 'Remediable',
            'policyMode': 'Policy Mode',
            'lastModifiedBy': 'Last Modified By',
            'lastModifiedOn': 'Last Modified On',
            'enabled': 'Status',
            'cloudType': 'Cloud'
        }
        const extras = { 'Instance': config.PrismaCloud[cfgIndex].tag }
        const dataRemapped = TransformJson(response.data, replacements, extras)
        getQueryForPolicy(pcfgapi, DataStore, dataRemapped, (data) => {
            outputData = TranfsormJsonData(data, opts);
            LogWritter(config, "csv", `${outputData}`, `prisma_get_Policies_${cfgIndex}`);
        })

    } catch (err) {
        console.log("error:", err)
    }
};

const getComplianceLogs = async (pcfgapi, cfgIndex, config, DataStore, LogWritter) => {
    try {
        console.log("Getting PrismaCLoud information");
        const api = pcfgapi + "/compliance";
        const jwt = DataStore.get("x-redlock-auth");
        const options = {
            method: "GET",
            headers: {
                "x-redlock-auth": jwt,
                accept: "application/json; charset=UTF-8",
            },
            url: api,
        };
        const response = await axios(options);
        const opts = { fields: ["Instance", "Name", "Description", "Cloud", "Created By", "Last Modified By", "Last Modified On", "Policies Assigned"] }
        const replacements = {
            'description': 'Description',
            'createdBy': 'Created By',
            'lastModifiedBy': 'Last Modified By',
            'lastModifiedOn': 'Last Modified On',
            'policiesAssignedCount': 'Policies Assigned',
            'cloudType': 'Cloud',
            'name': 'Name'
        };
        const extras = { 'Instance': config.PrismaCloud[cfgIndex].tag }
        const dataRemapped = TransformJson(response.data, replacements, extras)
        outputData = TranfsormJsonData(dataRemapped, opts)
        LogWritter(config, "csv", `${outputData}`, `prisma_get_Compliance_${cfgIndex}`)
    } catch (err) {
        console.log(err)
        LogWritter(config, "err", `${JSON.stringify(err, null, 4)}`, `prisma_get_Compliance_${cfgIndex}`)
    }
};

const getPolicyComplianceLogs = async (pcfgapi, cfgIndex, config, DataStore, LogWritter) => {
    try {
        const api = pcfgapi + "/policy/compliance";
        const jwt = DataStore.get("x-redlock-auth");
        const options = {
            method: "GET",
            headers: {
                "x-redlock-auth": jwt,
                accept: "application/json; charset=UTF-8",
            },
            url: api,
        };
        const response = await axios(options);
        LogWritter(config, "json", `${JSON.stringify(response.data, null, 4)}`, `prisma_get_Policy_Compliance_${cfgIndex}`)
    } catch (err) {
        console.log("error:", err)
    }
};


const getQueryForPolicy = async (pcfgapi, DataStore, data, callback) => {
    try {
        console.log("Getting PrismaCLoud information");
        for (const element of data) {
            if (element.RQL && element.RQL.match(/.{8}-.{4}-.{4}-.{4}-.{12}/g)) {
                const api = pcfgapi + `/search/history/${element.RQL}`;
                const jwt = DataStore.get("x-redlock-auth");
                const options = {
                    method: "GET",
                    headers: {
                        "x-redlock-auth": jwt,
                        accept: "application/json; charset=UTF-8",
                    },
                    url: api,
                };
                await axios(options).then((response) => {
                    element.RQL = response.data.query
                })
            } else {
                element.RQL = 'N/A'
            }
        }
        callback(data)
    } catch (err) {
        console.log("error:", err)
    }
};



module.exports = { init };