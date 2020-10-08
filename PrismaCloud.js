const axios = require("axios");

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
                    }
                });
            }
        })
    } catch (err) {
        LogWritter(config, "err", `${JSON.stringify(err, null, 4)}`, `prisma_init_${cfgIndex}`)
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
        LogWritter(config, "err", `${JSON.stringify(err, null, 4)}`, `prisma_get_users_${cfgIndex}`)
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
        LogWritter(config, "err", `${JSON.stringify(err, null, 4)}`, `prisma_get_Audit_Logs_${cfgIndex}`)
    }
};

module.exports = { init };