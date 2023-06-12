import requests
import json
import aiohttp
from ipwhois import IPWhois
import datetime
import csv
from os import path, makedirs
from pathlib import Path
import argparse
import ipaddress

def isIpPrivate(ip):
    try:
        ip_obj = ipaddress.ip_address(ip)
        return ip_obj.is_private
    except ValueError:
        return False

SupportedTypesReport = ['CSV', 'JSON']


class Output:
    def __init__(self, report_type, path):
        self.report_type = report_type
        self.path = path

    def check_path(self, path):
        if not Path(path).is_dir():
            print('Path provided in the config is not a folder.')
            exit(0)

    def init_aggregator(self, config):
        aggregator_config = []
        print(config)
        for entry in config:
            obj = {
                'Type': entry['report'].upper(),
                'outputPath': entry['path'].rstrip('/') + '/',
                'workBook': None,
                'workSheetName': None,
                'prisma': None
            }
            if obj['Type'] == SupportedTypesReport[0].upper() or obj['Type'] == SupportedTypesReport[2].upper():
                self.check_path(obj['outputPath'])

            aggregator_config.append(obj)
        return aggregator_config

    async def add_data_to_aggregator(self, aggregator_config, data):
        for entry in aggregator_config:
            if entry['Type'] == SupportedTypesReport[0].upper():
                try:
                    if len(data['data']) > 0:
                        file_path = f"{entry['outputPath']}{data['funcName']}.csv"
                        write_header = not path.exists(file_path)
                        with open(file_path, 'a', newline='') as f:
                            writer = csv.DictWriter(
                                f, fieldnames=data['header'], delimiter='\t')
                            if write_header:
                                writer.writeheader()
                            writer.writerows(data['data'])
                        print(f'Wrote successfully the {file_path} file')

                except Exception as e:
                    print('Error:', e)

            elif entry['Type'] == SupportedTypesReport[2].upper():
                try:
                    if data['funcName'] == "getPrismaPolicies":
                        dir_path = f"{entry['outputPath']}{data['funcName']}"
                        if not path.exists(dir_path):
                            makedirs(dir_path)
                        for data_entry in data['data']:
                            file_name = f"{data_entry['name'].replace(' ', '_').replace('/', '-').replace(':', '-')}_{data_entry['policyId'][-5:]}.json"
                            file_path = path.join(dir_path, file_name)
                            with open(file_path, 'w') as f:
                                json.dump(data_entry, f, indent=4)
                            print(f'Wrote successfully the {file_path} file')

                    else:
                        file_path = f"{entry['outputPath']}{data['funcName']}.json"
                        existing_data = []
                        if path.exists(file_path):
                            with open(file_path, 'r') as f:
                                existing_data = json.load(f)
                        with open(file_path, 'w') as f:
                            combined_data = existing_data + data['data']
                            json.dump(combined_data, f, indent=4)
                        print(f'Wrote successfully the {file_path} file')

                except Exception as e:
                    print('Error:', e)


def ReportBuilder(data, cardinal, ordinal):
    obj = {}
    for element in data:
        el_type = type(element[cardinal]).__name__
        if el_type == "str":
            obj[element[cardinal]] = {element[ordinal]: 1}
        elif el_type == "list":
            for key in element[cardinal]:
                obj[key] = {element[ordinal]: 1}
        elif el_type == "NoneType":
            pass

    retArr = []
    for key, value in obj.items():
        retArr.append({cardinal: key, ordinal: list(value.keys())[0]})

    return retArr


PREDEF = {
    "stable": ['getPrismaStatus', 'getPrismaUsers', 'getPrismaSA', 'getPrismaAuditLogs', 'getPrismaPolicies', 'getPrismaCompliance', 'getPrismaPolicyCompliance', 'getPrismaCloudsAccGroups', 'getPrismaSSOBypass', 'getPrismaAlerts'],
    "beta": ['getPrismaStatus', 'getPrismaUsers', 'getPrismaSA', 'getPrismaAuditLogs', 'getPrismaPolicies', 'getPrismaCompliance', 'getPrismaPolicyCompliance', 'getPrismaCloudsAccGroups', 'getPrismaSSOBypass', 'getPrismaAlerts', 'getPrismaInventoryTag', 'getPrismaResourceScans', 'getPrismaInventoryFilters', 'getPrismaAssets', 'getPrismaCloudAccs', 'getPrismaCloudLicenses', 'getPrismaInventorybyCloud', 'getPrismaCloudLicenses', 'getPrismaInventoryTrend', 'getPrismaServiceInventory', 'getPrismaCloudLabelSummary'],
    "alpha": ['getPrismaCloudsAccGroups'],
    "test": ['getPrismaCloudReportForPolicies']
}

TIMEKEYS = ["eventOccurred", "ruleLastModifiedOn", "requestedTimestamp", "alertTime", "firstSeen", "lastSeen", "alertTime",
            "timestamp", "createdOn", "lastModifiedOn", "createdTs", "lastUsedTime", "expiresOn", "lastModifiedTs", "lastLoginTs"]


def ConvertTimeToHumanReadable(data):
    if isinstance(data, list):
        for entry in data:
            KeysAvailable = [key for key in entry.keys() if key in TIMEKEYS]
            for key in KeysAvailable:
                if entry[key] is not None and entry[key] != '':
                    dateNew = datetime.datetime.fromisoformat(entry[key])
                    entry[key] = dateNew.replace(
                        tzinfo=datetime.timezone.utc).strftime("%Y-%m-%d %H:%M:%S")
    elif isinstance(data, dict):
        KeysAvailable = [key for key in data.keys() if key in TIMEKEYS]
        for key in KeysAvailable:
            if data[key] is not None and data[key] != '':
                dateNew = datetime.datetime.fromisoformat(data[key])
                data[key] = dateNew.replace(
                    tzinfo=datetime.timezone.utc).strftime("%Y-%m-%d %H:%M:%S")


def deObjectify(data):
    Arr = []
    for key in data.keys():
        Arr.extend(data[key])
    return Arr


async def initPrismaCloud(config, output, tag, DataStore, funcList, stats):
    # Deep copy funcList from config to avoid changing the original
    funcListCP = json.loads(json.dumps(funcList))

    for predefConst in PREDEF.keys():
        if predefConst in funcListCP:
            index = funcListCP.index(predefConst)
            funcListCP[index:index+1] = PREDEF[predefConst]

    apiURL = config['api']
    ApiID = config['ApiID']
    APISecret = config['ApiSecretKey']

    print('Init Prisma cloud')
    api = apiURL + '/login/'
    options = {
        'method': 'POST',
        'headers': {
            'Content-Type': 'application/json',
        },
        'url': api,
        'data': {
            'username': ApiID,
            'password': APISecret,
        },
    }
    try:
        response = await requests.post(api, headers=options['headers'], json=options['data'])
        response_data = response.json()
        DataStore.set('x-redlock-auth', response_data['token'])
        if DataStore.get('x-redlock-auth') is not None:
            print("Init PrismaCloud Aggregator")
            AggConf = InitAggregator(output, tag)
            outputWritter = {'AggConf': AggConf,
                             'AddDataToAggregator': AddDataToAggregator}
            for func in funcListCP:
                runtimeReport = None
                if func == 'getPrismaUsers':
                    runtimeReport = await getPrismaUsers(apiURL, tag, DataStore, outputWritter)
                elif func == 'getPrismaSA':
                    runtimeReport = await getPrismaSA(apiURL, tag, DataStore, outputWritter)
                elif func == 'getPrismaAuditLogs':
                    runtimeReport = await getPrismaAuditLogs(apiURL, tag, DataStore, outputWritter)
                elif func == 'getPrismaPolicies':
                    runtimeReport = await getPrismaPolicies(apiURL, tag, DataStore, outputWritter)
                elif func == 'getPrismaCompliance':
                    runtimeReport = await getPrismaCompliance(apiURL, tag, DataStore, outputWritter)
                elif func == 'getPrismaPolicyCompliance':
                    runtimeReport = await getPrismaPolicyCompliance(apiURL, tag, DataStore, outputWritter)
                elif func == 'getPrismaAlerts':
                    runtimeReport = await getPrismaAlerts(apiURL, tag, DataStore, outputWritter)
                elif func == 'getPrismaAssets':
                    runtimeReport = await getPrismaAssets(apiURL, tag, DataStore, outputWritter)
                elif func == 'getPrismaStatus':
                    runtimeReport = await getPrismaStatus(apiURL, tag, DataStore, outputWritter)
                elif func == 'getPrismaSSOBypass':
                    runtimeReport = await getPrismaSSOBypass(apiURL, tag, DataStore, outputWritter)
                elif func == 'getPrismaCloudsAccGroups':
                    runtimeReport = await getPrismaCloudsAccGroups(apiURL, tag, DataStore, outputWritter)
                elif func == 'getPrismaResourceScans':
                    runtimeReport = await getPrismaResourceScans(apiURL, tag, DataStore, outputWritter)
                # elif func == 'getPrismaLicensing':
                #     runtimeReport = await getPrismaLicensing(apiURL, tag, DataStore, outputWritter)
                elif func == 'getPrismaInventoryTag':
                    runtimeReport = await getPrismaInventoryTag(apiURL, tag, DataStore, outputWritter)
                elif func == 'getPrismaInventoryFilters':
                    runtimeReport = await getPrismaInventoryFilters(apiURL, tag, DataStore, outputWritter)
                elif func == 'getPrismaCloudAccs':
                    runtimeReport = await getPrismaCloudAccs(apiURL, tag, DataStore, outputWritter)
                elif func == 'getPrismaCloudLicenses':
                    runtimeReport = await getPrismaCloudLicenses(apiURL, tag, DataStore, outputWritter)
                elif func == 'getPrismaInventorybyCloud':
                    runtimeReport = await getPrismaInventorybyCloud(apiURL, tag, DataStore, outputWritter)
                elif func == 'getPrismaInventoryTrend':
                    runtimeReport = await getPrismaInventoryTrend(apiURL, tag, DataStore, outputWritter)
                elif func == 'getPrismaServiceInventory':
                    runtimeReport = await getPrismaServiceInventory(apiURL, tag, DataStore, outputWritter)
                elif func == 'getPrismaCloudLabelSummary':
                    runtimeReport = await getPrismaCloudLabelSummary(apiURL, tag, DataStore, outputWritter)
                elif func == 'getPrismaCloudReportForPolicies':
                    runtimeReport = await getPrismaCloudReportForPolicies(apiURL, tag, DataStore, outputWritter)
                if runtimeReport is not None:
                    stats.append(dict(runtimeReport, account_id=ApiID))
            WriteDataFromAggregator(AggConf, tag)
    except Exception as err:
        print('error:', err)
        stats.append({'env_tag': tag, 'name': 'login',
                     'apiurl': options['url'], 'entries': 0, 'account_id': ApiID, 'reason': json.dumps(err, indent=4)})


async def getPrismaAssets(apiURL, tag, DataStore, outputWritter):
    print('Getting PrismaCLoud Assets grouped by resource type information')
    api = apiURL + '/v2/inventory?timeType=to_now&timeUnit=epoch&groupBy=resource.type'
    jwt = DataStore.get('x-redlock-auth')
    options = {
        'method': 'GET',
        'headers': {
            'x-redlock-auth': jwt,
            'accept': 'application/json; charset=UTF-8',
        },
        'params': {'listType': 'TAG'},
        'url': api
    }
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(api, headers=options['headers'], params=options['params']) as response:
                dataResponse = json.loads(await response.text())
                extras = {'timestamp': dataResponse['timestamp'],
                          'requestedTimestamp': dataResponse['requestedTimestamp'], 'env_tag': tag}
                dataRemapped = [{**entry, **extras}
                                for entry in dataResponse['groupedAggregates']]
                ConvertTimeToHumanReadable(dataRemapped)
                data = {'data': dataRemapped, 'funcName': 'getPrismaAssets'}
                outputWritter.AddDataToAggregator(outputWritter.AggConf, data)
                return {'env_tag': tag, 'name': 'getPrismaAssets', 'apiurl': options['url'], 'entries': dataResponse['summary'], 'reason': None}
    except Exception as err:
        print('error:', err)
        return {'env_tag': tag, 'name': 'getPrismaAssets', 'apiurl': options['url'], 'entries': 0, 'reason': str(err)}


async def getPrismaStatus(apiURL, tag, DataStore, outputWritter):
    print('Getting PrismaCLoud Status information')
    api = apiURL + '/check'
    jwt = DataStore.get('x-redlock-auth')
    options = {
        'method': 'GET',
        'headers': {
            'x-redlock-auth': jwt,
            'accept': '*/*',
        },
        'url': api,
    }
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(api, headers=options['headers']) as response:
                return {'env_tag': tag, 'name': 'getPrismaStatus', 'apiurl': options['url'], 'entries': response.statusText, 'reason': None}
    except Exception as err:
        print('error:', err)
        return {'env_tag': tag, 'name': 'getPrismaStatus', 'apiurl': options['url'], 'entries': 0, 'reason': str(err)}


async def getPrismaSSOBypass(apiURL, tag, DataStore, outputWritter):
    print('Getting PrismaCLoud SSO Bypass information')
    api = apiURL + '/user/saml/bypass'
    jwt = DataStore.get('x-redlock-auth')
    options = {
        'method': 'GET',
        'headers': {
            'x-redlock-auth': jwt,
            'accept': '*/*',
        },
        'url': api,
    }
    try:
        extras = {'env_tag': tag}
        async with aiohttp.ClientSession() as session:
            async with session.get(api, headers=options['headers']) as response:
                dataRemapped = [{'Email': entry, **extras} for entry in await response.json()]
                ConvertTimeToHumanReadable(dataRemapped)
                data = {'data': dataRemapped, 'funcName': 'getPrismaSSOBypass'}
                outputWritter.AddDataToAggregator(outputWritter.AggConf, data)
                return {'env_tag': tag, 'name': 'getPrismaSSOBypass', 'apiurl': options['url'], 'entries': len(dataRemapped), 'reason': None}
    except Exception as err:
        print('error:', err)
        return {'env_tag': tag, 'name': 'getPrismaSSOBypass', 'apiurl': options['url'], 'entries': 0, 'reason': str(err)}


async def getPrismaUsers(apiURL, tag, DataStore, outputWritter):
    print('Getting PrismaCLoud Users information')
    api = apiURL + '/user'
    jwt = DataStore.get('x-redlock-auth')
    options = {
        'method': 'GET',
        'headers': {
            'x-redlock-auth': jwt,
            'accept': '*/*',
        },
        'url': api,
    }
    try:
        extras = {'env_tag': tag}
        async with aiohttp.ClientSession() as session:
            async with session.get(api, headers=options['headers']) as response:
                dataRemapped = [{**entry, **extras} for entry in await response.json()]
                ConvertTimeToHumanReadable(dataRemapped)
                data = {'data': dataRemapped, 'funcName': 'getPrismaUsers'}
                outputWritter.AddDataToAggregator(outputWritter.AggConf, data)
                return {'env_tag': tag, 'name': 'getPrismaUsers', 'apiurl': options['url'], 'entries': len(dataRemapped), 'reason': None}
    except Exception as err:
        print('error:', err)
        return {'env_tag': tag, 'name': 'getPrismaUsers', 'apiurl': options['url'], 'entries': 0, 'reason': str(err)}


async def getPrismaSA(apiURL, tag, DataStore, outputWritter):
    print('Getting PrismaCLoud SA information')
    api = apiURL + '/access_keys'
    jwt = DataStore.get('x-redlock-auth')
    options = {
        'method': 'GET',
        'headers': {
            'x-redlock-auth': jwt,
            'accept': '*/*',
        },
        'url': api,
    }
    try:
        extras = {'env_tag': tag}
        async with aiohttp.ClientSession() as session:
            async with session.get(api, headers=options['headers']) as response:
                dataRemapped = [{**entry, **extras} for entry in await response.json()]
                ConvertTimeToHumanReadable(dataRemapped)
                data = {'data': dataRemapped, 'funcName': 'getPrismaSA'}
                outputWritter.AddDataToAggregator(outputWritter.AggConf, data)
                return {'env_tag': tag, 'name': 'getPrismaSA', 'apiurl': options['url'], 'entries': len(dataRemapped), 'reason': None}
    except Exception as err:
        print('error:', err)
        return {'env_tag': tag, 'name': 'getPrismaSA', 'apiurl': options['url'], 'entries': 0, 'reason': str(err)}


async def getPrismaAuditLogs(apiURL, tag, DataStore, outputWritter):
    print('Getting PrismaCLoud Audit Logs information')
    api = apiURL + '/audit/redlock'
    jwt = DataStore.get('x-redlock-auth')
    options = {
        'method': 'GET',
        'headers': {
            'x-redlock-auth': jwt,
            'accept': 'application/json; charset=UTF-8',
        },
        'params': {'timeType': 'relative', 'timeAmount': '7', 'timeUnit': 'day'},
        'url': api,
    }
    try:
        extras = {'env_tag': tag}
        async with aiohttp.ClientSession() as session:
            async with session.get(api, headers=options['headers'], params=options['params']) as response:
                dataRemapped = [{**entry, 'whois': None, **extras} for entry in await response.json() if not isIpPrivate(entry['ipAddress'])]
                for entry in dataRemapped:
                    data = IPWhois(entry['ipAddress']).lookup_rdap()
                    entry['whois'] = {'NetName': data['NetName'],
                                      'Country': data['organisation']['Country']}
                ConvertTimeToHumanReadable(dataRemapped)
                data = {'data': dataRemapped, 'funcName': 'getPrismaAuditLogs'}
                outputWritter.AddDataToAggregator(outputWritter.AggConf, data)
                return {'env_tag': tag, 'name': 'getPrismaAuditLogs', 'apiurl': options['url'], 'entries': len(dataRemapped), 'reason': None}
    except Exception as err:
        print('error:', err)
        return {'env_tag': tag, 'name': 'getPrismaAuditLogs', 'apiurl': options['url'], 'entries': 0, 'reason': str(err)}


async def getPrismaPolicies(apiURL, tag, DataStore, outputWritter):
    print('Getting PrismaCLoud Policies Information')
    api = apiURL + '/v2/policy'
    jwt = DataStore.get('x-redlock-auth')
    options = {
        'method': 'GET',
        'headers': {
            'x-redlock-auth': jwt,
            'accept': 'application/json; charset=UTF-8',
        },
        'url': api,
    }
    try:
        extras = {'env_tag': tag}
        async with aiohttp.ClientSession() as session:
            async with session.get(api, headers=options['headers']) as response:
                dataRemapped = []
                for entry in await response.json():
                    dataRemapped.append({
                        **extras,
                        'cloudType': entry.get('cloudType', ''),
                        'createdBy': entry.get('createdBy', ''),
                        'createdOn': entry.get('createdOn', ''),
                        'deleted': entry.get('deleted'),
                        'description': JSON.stringify(entry.get('description', '')).substring(0, 3200) + "..." if entry.get('description') else '',
                        'enabled': entry.get('enabled'),
                        'labels': entry.get('labels', [])[:10] if entry.get('labels') and len(entry.get('labels')) > 1 else [],
                        'lastModifiedBy': entry.get('lastModifiedBy', ''),
                        'lastModifiedOn': entry.get('lastModifiedOn', ''),
                        'name': entry.get('name', ''),
                        'owner': entry.get('owner', ''),
                        'policyCategory': entry.get('policyCategory', ''),
                        'policyClass': entry.get('policyClass', ''),
                        'policyId': entry.get('policyId', ''),
                        'policyMode': entry.get('policyMode', ''),
                        'policySubTypes': entry.get('policySubTypes', ''),
                        'policyType': entry.get('policyType', ''),
                        'recommendation': JSON.stringify(entry.get('recommendation', '')).substring(0, 3200) + "..." if entry.get('recommendation') else '',
                        'remediable': entry.get('remediable'),
                        'rule': entry.get('rule', ''),
                        'ruleLastModifiedOn': entry.get('ruleLastModifiedOn', ''),
                        'severity': entry.get('severity', ''),
                        'systemDefault': entry.get('systemDefault')
                    })
                dataRemappedCP = JSON.parse(JSON.stringify(dataRemapped))
                await getQueryForPolicy(apiURL, DataStore, dataRemapped, lambda data: ConvertTimeToHumanReadable(data))
                summaryData = ReportBuilder(dataRemappedCP, 'labels', 'name')
                data = {'data': summaryData,
                        'funcName': 'getlabelSummaryPrismaPolicies'}
                outputWritter.AddDataToAggregator(outputWritter.AggConf, data)
                return {'env_tag': tag, 'name': 'getPrismaPolicies', 'apiurl': options['url'], 'entries': len(dataRemapped), 'reason': None}
    except Exception as err:
        print('error:', err)
        return {'env_tag': tag, 'name': 'getPrismaPolicies', 'apiurl': options['url'], 'entries': 0, 'reason': str(err)}


async def getPrismaAlerts(apiURL, tag, DataStore, outputWritter):
    print('Getting PrismaCLoud Alerts Information')
    api = apiURL + '/alert?alert.status=open&timeType=relative&timeAmount=3&timeUnit=week&detailed=true'
    jwt = DataStore.get('x-redlock-auth')
    options = {
        'method': 'GET',
        'headers': {
            'x-redlock-auth': jwt,
            'accept': 'application/json; charset=UTF-8',
        },
        'url': api,
    }
    try:
        extras = {'env_tag': tag}
        async with aiohttp.ClientSession() as session:
            async with session.get(api, headers=options['headers']) as response:
                dataRemapped = []
                for entry in await response.json():
                    dataRemapped.append({
                        'id': entry.get('id', ''),
                        **extras,
                        'status': entry.get('status', ''),
                        'reason': entry.get('reason', ''),
                        'firstSeen': entry.get('firstSeen', ''),
                        'lastSeen': entry.get('lastSeen', ''),
                        'alertTime': entry.get('alertTime', ''),
                        'policy': JSON.stringify(entry.get('policy', '')).substring(0, 3200) + "..." if entry.get('policy') else '',
                        'alertRules': entry.get('alertRules', ''),
                        'riskDetail': entry.get('riskDetail', ''),
                        'resource': JSON.stringify(entry.get('resource', '')).substring(0, 3200) + "..." if entry.get('resource') else '',
                        'history': entry.get('history', [])[:10] if entry.get('history') and len(entry.get('history')) > 1 else '',
                        'eventOccurred': entry.get('eventOccurred', ''),
                        'triggeredBy': entry.get('triggeredBy', ''),
                        'saveSearchId': entry.get('saveSearchId', ''),
                        'investigateOptions': entry.get('investigateOptions', ''),
                        'anomalyDetail': entry.get('anomalyDetail', ''),
                        'networkAnomaly': entry.get('networkAnomaly', ''),
                    })
                ConvertTimeToHumanReadable(dataRemapped)
                data = {'data': dataRemapped, 'funcName': 'getPrismaAlerts'}
                outputWritter.AddDataToAggregator(outputWritter.AggConf, data)
                return {'env_tag': tag, 'name': 'getPrismaAlerts', 'apiurl': options['url'], 'entries': len(dataRemapped), 'reason': None}
    except Exception as err:
        print('error:', err)
        return {'env_tag': tag, 'name': 'getPrismaAlerts', 'apiurl': options['url'], 'entries': 0, 'reason': str(err)}


async def getPrismaCompliance(apiURL, tag, DataStore, outputWritter):
    print('Getting PrismaCLoud Compliance information')
    api = apiURL + '/compliance'
    jwt = DataStore.get('x-redlock-auth')
    options = {
        'method': 'GET',
        'headers': {
            'x-redlock-auth': jwt,
            'accept': 'application/json; charset=UTF-8',
        },
        'url': api,
    }
    try:
        extras = {'env_tag': tag}
        async with aiohttp.ClientSession() as session:
            async with session.get(api, headers=options['headers']) as response:
                dataRemapped = []
                for entry in await response.json():
                    dataRemapped.append({**entry, **extras})
                ConvertTimeToHumanReadable(dataRemapped)
                data = {'data': dataRemapped,
                        'funcName': 'getPrismaCompliance'}
                outputWritter.AddDataToAggregator(outputWritter.AggConf, data)
                return {'env_tag': tag, 'name': 'getPrismaCompliance', 'apiurl': options['url'], 'entries': len(dataRemapped), 'reason': None}
    except Exception as err:
        print(err)
        return {'env_tag': tag, 'name': 'getPrismaCompliance', 'apiurl': options['url'], 'entries': 0, 'reason': str(err)}


async def getPrismaPolicyCompliance(apiURL, tag, DataStore, outputWritter):
    print('Getting PrismaCLoud Policy Compliance Information')
    api = apiURL + '/policy/compliance'
    jwt = DataStore.get('x-redlock-auth')
    options = {
        'method': 'GET',
        'headers': {
            'x-redlock-auth': jwt,
            'accept': 'application/json; charset=UTF-8',
        },
        'url': api,
    }
    try:
        extras = {'env_tag': tag}
        async with aiohttp.ClientSession() as session:
            async with session.get(api, headers=options['headers']) as response:
                dataResp = deObjectify(await response.json())
                dataRemapped = []
                for entry in dataResp:
                    dataRemapped.append({**entry, **extras})
                ConvertTimeToHumanReadable(dataRemapped)
                data = {'data': dataRemapped,
                        'funcName': 'getPrismaPolicyCompliance'}
                outputWritter.AddDataToAggregator(outputWritter.AggConf, data)
                return {'env_tag': tag, 'name': 'getPrismaPolicyCompliance', 'apiurl': options['url'], 'entries': len(dataResp), 'reason': None}
    except Exception as err:
        print(err)
        return {'env_tag': tag, 'name': 'getPrismaPolicyCompliance', 'apiurl': options['url'], 'entries': 0, 'reason': str(err)}


async def getQueryForPolicy(apiURL, DataStore, data, callback):
    try:
        print('Getting PrismaCLoud RQL Information')
        for element in data:
            if element.get('rule', {}).get('criteria', '') and re.match(r".{8}-.{4}-.{4}-.{4}-.{12}", element['rule']['criteria']):
                api = apiURL + f"/search/history/{element['rule']['criteria']}"
                jwt = DataStore.get('x-redlock-auth')
                options = {
                    'method': 'GET',
                    'headers': {
                        'x-redlock-auth': jwt,
                        'accept': 'application/json; charset=UTF-8',
                    },
                    'url': api,
                }
                async with aiohttp.ClientSession() as session:
                    async with session.get(api, headers=options['headers']) as response:
                        rqlData = await response.json()
                element['rql'] = rqlData
            else:
                element['rql'] = 'N/A'
        callback(data)
    except Exception as err:
        print('error:', err)
        raise err


async def getPrismaCloudsAccGroups(apiURL, tag, DataStore, outputWritter):
    print('Getting PrismaCLoud Connected Clouds information')
    api = apiURL + '/cloud/group'
    jwt = DataStore.get('x-redlock-auth')
    options = {
        'method': 'GET',
        'headers': {
            'x-redlock-auth': jwt,
            'accept': '*/*',
        },
        'url': api,
    }
    try:
        extras = {'env_tag': tag}
        async with aiohttp.ClientSession() as session:
            async with session.get(api, headers=options['headers']) as response:
                dataResponse = json.loads(await response.text())
                dataResponseCP = []
                for entry in dataResponse:
                    if len(entry['accounts']) < 1:
                        dataResponseCP.append({
                            'id': entry.get('id', ''),
                            'name': entry.get('name', ''),
                            'description': entry.get('description', 'N/A'),
                            'lastModifiedBy': entry.get('lastModifiedBy', ''),
                            'lastModifiedTs': entry.get('lastModifiedTs', ''),
                            'accountIds': 'N/A',
                            'nonOnboardedCloudAccountIds': entry.get('nonOnboardedCloudAccountIds', ''),
                            'autoCreated': entry.get('autoCreated', ''),
                            'account': 'N/A',
                            'alertRules': entry.get('alertRules', 'N/A'),
                            'parentInfo': entry.get('parentInfo', 'N/A'),
                            **extras
                        })
                    else:
                        for entry2 in entry['accounts']:
                            dataResponseCP.append({
                                'id': entry.get('id', ''),
                                'name': entry.get('name', ''),
                                'account': entry2,
                                'description': entry.get('description', 'N/A'),
                                'lastModifiedBy': entry.get('lastModifiedBy', ''),
                                'lastModifiedTs': entry.get('lastModifiedTs', ''),
                                'accountIds': entry.get('accountIds', ''),
                                'nonOnboardedCloudAccountIds': entry.get('nonOnboardedCloudAccountIds', ''),
                                'autoCreated': entry.get('autoCreated', ''),
                                'alertRules': entry.get('alertRules', 'N/A'),
                                'parentInfo': entry.get('parentInfo', 'N/A'),
                                **extras
                            })
                ConvertTimeToHumanReadable(dataResponseCP)
                data = {'data': dataResponseCP,
                        'funcName': 'getPrismaCloudsAccGroups'}
                outputWritter.AddDataToAggregator(outputWritter.AggConf, data)
                return {'env_tag': tag, 'name': 'getPrismaCloudsAccGroups', 'apiurl': options['url'], 'entries': len(dataResponseCP), 'reason': None}
    except Exception as err:
        print('error:', err)
        return {'env_tag': tag, 'name': 'getPrismaCloudsAccGroups', 'apiurl': options['url'], 'entries': 0, 'reason': str(err)}


async def getPrismaInventoryTag(api_url, tag, data_store, output_writer):
    print('Getting PrismaCLoud Inventory Tags information')
    api = api_url + '/v2/inventory'
    jwt = data_store.get('x-redlock-auth')
    headers = {
        'x-redlock-auth': jwt,
        'accept': 'application/json; charset=UTF-8'
    }
    params = {
        'listType': 'TAG'
    }
    url = api_url + '/v2/inventory'
    options = {
        'headers': headers,
        'params': params,
        'url': api
    }
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(url, headers=headers, params=params) as response:
                response_data = await response.json()

        data_response = json.loads(json.dumps(
            response_data['groupedAggregates']))
        extras = {
            'timestamp': response_data['timestamp'],
            'requestedTimestamp': response_data['requestedTimestamp'],
            'mars_tag': tag
        }
        data_remapped = [{**entry, **extras} for entry in data_response]
        ConvertTimeToHumanReadable(data_remapped)
        data = {
            'data': data_remapped,
            'funcName': 'getPrismaInventoryTag'
        }
        output_writer.AddDataToAggregator(output_writer.AggConf, data)
        return {
            'mars_tag': tag,
            'name': 'getPrismaInventoryTag',
            'apiurl': options['url'],
            'entries': response_data['summary'],
            'reason': None
        }
    except Exception as err:
        print('error:', err)
        return {
            'mars_tag': tag,
            'name': 'getPrismaInventoryTag',
            'apiurl': options['url'],
            'entries': 0,
            'reason': json.dumps(err, indent=4)
        }


async def getPrismaAssets(apiURL, tag, DataStore, outputWriter):
    print('Getting PrismaCLoud Assets grouped by resource type information')
    api = apiURL + '/v2/inventory?timeType=to_now&timeUnit=epoch&groupBy=resource.type'
    jwt = DataStore.get('x-redlock-auth')
    headers = {
        'x-redlock-auth': jwt,
        'accept': 'application/json; charset=UTF-8'
    }
    params = {'listType': 'TAG'}
    options = {
        'method': 'GET',
        'headers': headers,
        'params': params,
        'url': api
    }
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(api, headers=headers, params=params) as response:
                response_data = await response.json()

        data_response = json.loads(json.dumps(
            response_data['groupedAggregates']))
        extras = {
            'timestamp': response_data['timestamp'],
            'requestedTimestamp': response_data['requestedTimestamp'],
            'mars_tag': tag
        }
        data_remapped = [dict(entry, **extras) for entry in data_response]
        ConvertTimeToHumanReadable(data_remapped)
        data = {
            'data': data_remapped,
            'funcName': 'getPrismaAssets'
        }
        outputWriter.AddDataToAggregator(outputWriter.AggConf, data)
        return {
            'mars_tag': tag,
            'name': 'getPrismaAssets',
            'apiurl': options['url'],
            'entries': response_data['summary'],
            'reason': None
        }
    except aiohttp.ClientError as err:
        print('Error:', err)
        return {
            'mars_tag': tag,
            'name': 'getPrismaAssets',
            'apiurl': options['url'],
            'entries': 0,
            'reason': str(err)
        }


async def getPrismaInventoryFilters(apiURL, tag, DataStore, outputWritter):
    print('Getting PrismaCLoud Inventory Filters information')
    api = apiURL + '/filter/inventory'
    jwt = DataStore.get('x-redlock-auth')
    headers = {
        'x-redlock-auth': jwt,
        'accept': 'application/json; charset=UTF-8',
    }
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(api, headers=headers) as response:
                dataResponse = await response.json()
                extras = {
                    'timestamp': dataResponse['timestamp'], 'mars_tag': tag}
                dataRemapped = [{**entry, **extras} for entry in dataResponse]
                # Assume ConvertTimeToHumanReadable is defined somewhere in your python script
                ConvertTimeToHumanReadable(dataRemapped)
                data = {'data': dataRemapped,
                        'funcName': 'getPrismaInventoryFilters'}
                # Assume outputWritter has an AddDataToAggregator method defined
                outputWritter.AddDataToAggregator(outputWritter.AggConf, data)
                return {'mars_tag': tag, 'name': 'getPrismaInventoryFilters', 'apiurl': api, 'entries': len(dataRemapped), 'reason': None}
    except Exception as e:
        print('error:', e)
        return {'mars_tag': tag, 'name': 'getPrismaInventoryFilters', 'apiurl': api, 'entries': 0, 'reason': json.dumps(str(e))}


async def getPrismaResourceScans(apiURL, tag, DataStore, outputWritter):
    print('Getting PrismaCLoud Resource Scans information')
    api = apiURL + '/resource/scan_info'
    jwt = DataStore.get('x-redlock-auth')
    headers = {
        'x-redlock-auth': jwt,
        'accept': 'application/json; charset=UTF-8',
    }
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(api, headers=headers) as response:
                responseData = await response.json()
                dataResponse = responseData['resources']
                extras = {
                    'timestamp': responseData['timestamp'], 'mars_tag': tag}
                dataRemapped = [{**entry, **extras} for entry in dataResponse]
                ConvertTimeToHumanReadable(dataRemapped)
                data = {'data': dataRemapped,
                        'funcName': 'getPrismaResourceScans'}
                outputWritter.AddDataToAggregator(outputWritter.AggConf, data)
                return {'mars_tag': tag, 'name': 'getPrismaResourceScans', 'apiurl': api, 'entries': len(dataRemapped), 'reason': None}
    except Exception as e:
        print('error:', e)
        return {'mars_tag': tag, 'name': 'getPrismaResourceScans', 'apiurl': api, 'entries': 0, 'reason': json.dumps(str(e))}


async def getPrismaInventoryTrend(apiURL, tag, DataStore, outputWritter):
    print('Getting PrismaCLoud Inventory Trend information')
    api = apiURL + '/v2/inventory/trend?timeType=relative&timeAmount=1&timeUnit=month'
    jwt = DataStore.get('x-redlock-auth')
    headers = {
        'x-redlock-auth': jwt,
        'accept': 'application/json; charset=UTF-8',
    }
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(api, headers=headers) as response:
                dataResponse = await response.json()
                extras = {'mars_tag': tag}
                dataRemapped = [{**entry, **extras} for entry in dataResponse]
                ConvertTimeToHumanReadable(dataRemapped)
                data = {'data': dataRemapped,
                        'funcName': 'getPrismaInventoryTrend'}
                outputWritter.AddDataToAggregator(outputWritter.AggConf, data)
                return {'mars_tag': tag, 'name': 'getPrismaInventoryTrend', 'apiurl': api, 'entries': len(dataRemapped), 'reason': None}
    except Exception as e:
        print('error:', e)
        return {'mars_tag': tag, 'name': 'getPrismaInventoryTrend', 'apiurl': api, 'entries': 0, 'reason': json.dumps(str(e))}


async def getPrismaServiceInventory(apiURL, tag, DataStore, outputWritter):
    print('Getting PrismaCLoud Service Inventory information')
    api = apiURL + '/v2/inventory?timeType=to_now&timeUnit=epoch&groupBy=cloud.service'
    jwt = DataStore.get('x-redlock-auth')
    headers = {
        'x-redlock-auth': jwt,
        'accept': 'application/json; charset=UTF-8',
    }
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(api, headers=headers) as response:
                dataResponse = await response.json()
                extras = {'mars_tag': tag}
                dataRemapped = [{**entry, **extras} for entry in dataResponse]
                ConvertTimeToHumanReadable(dataRemapped)
                data = {'data': dataRemapped,
                        'funcName': 'getPrismaServiceInventory'}
                outputWritter.AddDataToAggregator(outputWritter.AggConf, data)
                return {'mars_tag': tag, 'name': 'getPrismaServiceInventory', 'apiurl': api, 'entries': len(dataRemapped), 'reason': None}
    except Exception as e:
        print('error:', e)
        return {'mars_tag': tag, 'name': 'getPrismaServiceInventory', 'apiurl': api, 'entries': 0, 'reason': json.dumps(str(e))}


async def getPrismaCloudLabelSummary(apiURL, tag, DataStore, outputWritter):
    print('Getting PrismaCLoud Label Summary information')
    api = apiURL + '/label/summary'
    jwt = DataStore.get('x-redlock-auth')
    headers = {
        'x-redlock-auth': jwt,
        'accept': 'application/json; charset=UTF-8',
    }
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(api, headers=headers) as response:
                dataResponse = await response.json()
                extras = {'mars_tag': tag}
                dataRemapped = [{**entry, **extras} for entry in dataResponse]
                ConvertTimeToHumanReadable(dataRemapped)
                data = {'data': dataRemapped,
                        'funcName': 'getPrismaCloudLabelSummary'}
                outputWritter.AddDataToAggregator(outputWritter.AggConf, data)
                return {'mars_tag': tag, 'name': 'getPrismaCloudLabelSummary', 'apiurl': api, 'entries': len(dataRemapped), 'reason': None}
    except Exception as e:
        print('error:', e)
        return {'mars_tag': tag, 'name': 'getPrismaCloudLabelSummary', 'apiurl': api, 'entries': 0, 'reason': json.dumps(str(e))}


async def getPrismaCloudReportForPolicies(apiURL, tag, DataStore, outputWritter):
    print('Getting PrismaCLoud Count Policies information')
    api = apiURL + '/v2/policy'
    jwt = DataStore.get('x-redlock-auth')
    headers = {
        'x-redlock-auth': jwt,
        'accept': 'application/json; charset=UTF-8',
    }
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(api, headers=headers) as response:
                dataResponse = await response.json()

                Summary_label = {'true': 0, 'false': 0, 'total': 0}
                for entry in dataResponse:
                    if entry['cloudType'] not in Summary_label:
                        Summary_label[entry['cloudType']] = {str(entry['enabled']): 1, 'false': 0} if entry['enabled'] else {
                            str(entry['enabled']): 1, 'true': 0}
                        Summary_label[str(entry['enabled'])] += 1
                    else:
                        Summary_label[entry['cloudType']
                                      ][str(entry['enabled'])] += 1
                        Summary_label[str(entry['enabled'])] += 1

                Summary_label['total'] = Summary_label['true'] + \
                    Summary_label['false']

                Summary_final_labels = []
                keys = ['true', 'false', 'total']
                for key in Summary_label:
                    if key not in keys:
                        Summary_final_labels.append({'Total': Summary_label['total'], 'EnabledTotal': Summary_label['true'], 'DisabledTotal': Summary_label[
                                                    'false'], 'cloudType': key, "Enabled": Summary_label[key]['true'], "Disabled": Summary_label[key]['false']})

                data = {'data': Summary_final_labels,
                        'funcName': 'getPrismaCloudReportForPolicies'}
                outputWritter.AddDataToAggregator(outputWritter.AggConf, data)
                return {'mars_tag': tag, 'name': 'getPrismaCloudReportForPolicies', 'apiurl': api, 'entries': len(Summary_final_labels), 'reason': None}
    except Exception as e:
        print('error:', e)
        return {'mars_tag': tag, 'name': 'getPrismaCloudReportForPolicies', 'apiurl': api, 'entries': 0, 'reason': json.dumps(str(e))}


async def getPrismaInventorybyCloud(apiURL, tag, DataStore, outputWritter):
    print('Getting PrismaCLoud Resource Scans information')
    api = apiURL + '/v2/inventory?timeType=to_now&timeUnit=epoch&groupBy=cloud.type'
    jwt = DataStore.get('x-redlock-auth')
    headers = {
        'x-redlock-auth': jwt,
        'accept': 'application/json; charset=UTF-8',
    }
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(api, headers=headers) as response:
                dataResponse = await response.json()
                dataResponse = dataResponse['groupedAggregates']
                extras = {
                    'timestamp': dataResponse['timestamp'], 'mars_tag': tag}
                dataRemapped = [{**entry, **extras} for entry in dataResponse]
                ConvertTimeToHumanReadable(dataRemapped)
                data = {'data': dataRemapped,
                        'funcName': 'getPrismaInventorybyCloud'}
                outputWritter.AddDataToAggregator(outputWritter.AggConf, data)
                return {'mars_tag': tag, 'name': 'getPrismaInventorybyCloud', 'apiurl': api, 'entries': len(dataRemapped), 'reason': None}
    except Exception as e:
        print('error:', e)
        return {'mars_tag': tag, 'name': 'getPrismaInventorybyCloud', 'apiurl': api, 'entries': 0, 'reason': json.dumps(str(e))}


async def getPrismaCloudAccs(apiURL, tag, DataStore, outputWritter):
    print('Getting PrismaCloud Resource Scans information')
    api = apiURL + '/cloud'
    jwt = DataStore.get('x-redlock-auth')
    headers = {
        'x-redlock-auth': jwt,
        'accept': 'application/json; charset=UTF-8',
    }
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(api, headers=headers) as response:
                dataResponse = await response.json()
                extras = {
                    'timestamp': dataResponse['timestamp'], 'mars_tag': tag}
                dataRemapped = [{**entry, **extras} for entry in dataResponse]
                ConvertTimeToHumanReadable(dataRemapped)
                data = {'data': dataRemapped, 'funcName': 'getPrismaCloudAccs'}
                outputWritter.AddDataToAggregator(outputWritter.AggConf, data)
                return {'mars_tag': tag, 'name': 'getPrismaCloudAccs', 'apiurl': api, 'entries': len(dataRemapped), 'reason': None}
    except Exception as e:
        print('error:', e)
        return {'mars_tag': tag, 'name': 'getPrismaCloudAccs', 'apiurl': api, 'entries': 0, 'reason': json.dumps(str(e))}


async def getPrismaCloudLicenses(apiURL, tag, DataStore, outputWritter):
    print('Getting PrismaCloud Resource Scans information')
    api = apiURL + '/license/api/v1/usage/time_series'
    jwt = DataStore.get('x-redlock-auth')
    headers = {
        'x-redlock-auth': jwt,
        'Content-Type': 'application/json',
    }
    data = {"accountIds": [], "timeRange": {"value": {"unit": "year", "amount": 10},
                                            "type": "relative", "relativeTimeType": "BACKWARD"}, "cloudType": "", "csvHeaderRequired": False}
    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(api, headers=headers, json=data) as response:
                dataResponse = await response.json()
                dataResponse = dataResponse['dataPoints']
                extras = {
                    'timestamp': dataResponse['timestamp'], 'mars_tag': tag}
                dataRemapped = [{**entry, 'workloadsPurchased': dataResponse['workloadsPurchased'], 'timeUnit': dataResponse['timeUnit'],
                                 'availableAsOf': dataResponse['availableAsOf'], **extras} for entry in dataResponse]
                ConvertTimeToHumanReadable(dataRemapped)
                data = {'data': dataRemapped,
                        'funcName': 'getPrismaCloudLicenses'}
                outputWritter.AddDataToAggregator(outputWritter.AggConf, data)
                return {'mars_tag': tag, 'name': 'getPrismaCloudLicenses', 'apiurl': api, 'entries': len(dataRemapped), 'reason': None}
    except Exception as e:
        print('error:', e)
        return {'mars_tag': tag, 'name': 'getPrismaCloudLicenses', 'apiurl': api, 'entries': 0, 'reason': json.dumps(str(e))}


async def getPrismaStatus(apiURL, tag, DataStore, outputWritter):
    print('Getting PrismaCLoud Status information')
    api = apiURL + '/check'
    jwt = DataStore.get('x-redlock-auth')
    headers = {
        'x-redlock-auth': jwt,
        'accept': '*/*',
    }
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(api, headers=headers) as response:
                return {'mars_tag': tag, 'name': 'getPrismaStatus', 'apiurl': api, 'entries': response.status, 'reason': None}
    except Exception as e:
        print('error:', e)
        return {'mars_tag': tag, 'name': 'getPrismaStatus', 'apiurl': api, 'entries': 0, 'reason': json.dumps(str(e))}


async def getPrismaUsers(apiURL, tag, DataStore, outputWritter):
    print('Getting PrismaCLoud Users information')
    api = apiURL + '/user'
    jwt = DataStore.get('x-redlock-auth')
    headers = {
        'x-redlock-auth': jwt,
        'accept': '*/*',
    }

    async with aiohttp.ClientSession() as session:
        async with session.get(api, headers=headers) as response:
            try:
                response_data = await response.json()
                extras = {'mars_tag': tag}
                data_remapped = [{**entry, **extras}
                                 for entry in response_data]
                ConvertTimeToHumanReadable(data_remapped)
                data = {'data': data_remapped, 'funcName': 'getPrismaUsers'}
                outputWritter.AddDataToAggregator(outputWritter.AggConf, data)
                return {'mars_tag': tag, 'name': 'getPrismaUsers', 'apiurl': api, 'entries': len(response_data), 'reason': None}
            except Exception as err:
                print('error:', err)
                return {'mars_tag': tag, 'name': 'getPrismaUsers', 'apiurl': api, 'entries': 0, 'reason': json.dumps(err, indent=4)}


async def getPrismaSA(apiURL, tag, DataStore, outputWritter):
    print('Getting PrismaCLoud SA information')
    api = apiURL + '/access_keys'
    jwt = DataStore.get('x-redlock-auth')
    headers = {
        'x-redlock-auth': jwt,
        'accept': '*/*',
    }

    async with aiohttp.ClientSession() as session:
        async with session.get(api, headers=headers) as response:
            try:
                response_data = await response.json()
                extras = {'mars_tag': tag}
                data_remapped = [{**entry, **extras}
                                 for entry in response_data]
                ConvertTimeToHumanReadable(data_remapped)
                data = {'data': data_remapped, 'funcName': 'getPrismaSA'}
                outputWritter.AddDataToAggregator(outputWritter.AggConf, data)
                return {'mars_tag': tag, 'name': 'getPrismaSA', 'apiurl': api, 'entries': len(response_data), 'reason': None}
            except Exception as err:
                print('error:', err)
                return {'mars_tag': tag, 'name': 'getPrismaSA', 'apiurl': api, 'entries': 0, 'reason': json.dumps(err, indent=4)}



def main():
    parser = argparse.ArgumentParser(description='Script description')
    parser.add_argument('--api-url', required=True, help='API URL')
    parser.add_argument('--api-ID', required=True, help='API ID or username')
    parser.add_argument('--api-SECRET', required=True, help='API secret key or password')
    parser.add_argument('--report-type', choices=['CSV', 'JSON'], nargs='+', default='CSV', help='Type of report')
    parser.add_argument('--output-path', default='/tmp', help='Path to the output folder')
    args = parser.parse_args()

    config = {
        'api': args.api_url,
        'ApiID': args.api_ID,
        'ApiSecretKey': args.api_SECRET,
    }

    output = []

    if len(args.report_type) == 1:
        output.append({
            'report': args.report_type[0],
            'path': args.output_path
        })
    else:
        for report_type in args.report_type:
            output.append({
                'report': report_type,
                'path': args.output_path
            })



    # config = {
    #     'api': 'https://api.prismacloud.com',  # Example API URL
    #     'ApiID': 'your_api_id',  # Example API ID or username
    #     'ApiSecretKey': 'your_api_secret_key',  # Example API secret key or password
    # }
    # output = [
    #     {
    #         'report': 'CSV',
    #         'path': '/path/to/output/folder'
    #     },
    #     {
    #         'report': 'JSON',
    #         'path': '/path/to/another/output/folder'
    #     }
    # ]


    dataStore = {}

    initPrismaCloud(config, output, "testtag", dataStore, "alpha",)


if __name__ == '__main__':
    main()
