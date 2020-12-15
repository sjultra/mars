
### Example config file: [link](./config.json)

Config sections:
* [Prisma Cloud config](#Prisma-Cloud-config)
* [Qualys config](#Qualys-config)
* [GCP config](#GCP-config)
* Output Examples:
    * [Output config file](#Output-config-file)
    * [Output config mysql](#Output-config-mysql)
* [Convertor config](#Convertor-config)
* [Publisher config](#Publisher-config)


# Prisma Cloud config
There are also for requests the following options as bundles:
```
    "stable": ['getPrismaStatus', 'getPrismaUsers', 'getPrismaSA', 'getPrismaAuditLogs', 'getPrismaPolicies', 'getPrismaCompliance', 'getPrismaPolicyCompliance','getPrismaConnClouds', 'getPrismaSSOBypass', 'getPrismaAlerts'],
    "beta": ['getPrismaStatus', 'getPrismaUsers', 'getPrismaSA', 'getPrismaAuditLogs', 'getPrismaPolicies', 'getPrismaCompliance', 'getPrismaPolicyCompliance', 'getPrismaConnClouds', 'getPrismaSSOBypass', 'getPrismaAlerts','getPrismaResourceLists','getPrismaResourceScans'],
```

```
    "PrismaCloud": [
        {
            "credentials": {
                "api": "https://api.prismacloud.io",
                "ApiID": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
                "ApiSecretKey": "xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
            },
            "requests": [
                "getPrismaUsers",
                "getPrismaSA",
                "getPrismaAuditLogs",
                "getPrismaPolicies",
                "getPrismaCompliance",
                "getPrismaPolicyCompliance",
                "getPrismaAlerts"
            ],
            "tag":"Credentials identifier tag"
        }
    ],
```

# Qualys config
```
    "Qualys": [
        {
            "credentials": {
                "api": "https://qualysapi.qualys.com",
                "username": "XXXXXXXXXX",
                "password": "XXXXXXXXXX"
            },
            "requests": [
                "get_assets"
            ],
            "tag":"Credentials identifier tag"
        }
    ],
```

# GCP config
```
    "GCP": [
        {
            "credentials": {
                "GOOGLE_APPLICATION_CREDENTIALS": "./SA_File.json",
                "ORG_ID": "xxxxxxxxxxxx"
            },
            "requests": [
                "getGCPVMs",
                "getGCPProjects",
                "getGCPAssets",
                "getGCPFindings",
                "getGCPLicense",
                "getGCPIP"
            ],
            "tag":"Credentials identifier tag"
        }
    ],

```

# Output config file
```
"output": [
    {
        "report": "JSON",
        "path": "./local"
    },
    {
        "report": "CSV",
        "path": "./local"
    },
    {
        "report": "JSON",
        "path": "./local"
    }
]
```

# Output config mysql
```
"output": [
    {
        "report": "MYSQL",
        "path": "mysql://root:my-secret-pw@localhost:3306/Mars"
    }
]
```

# Convertor config
```
   "convertor": [
        {
            "type": "csvToXLSX",
            "path": "/root/Mars/output/",
            "outputPath":"/root/Mars/output2/"
        },
        {
            "type": "jsonToXLSX",
            "path": "/root/Mars/output/",
            "outputPath":"/root/Mars/output2/"
        }
    ]
```

# Publisher config 

If there are multiple entries in publish - they shouldn't be of the same repository and same branch - because the code will be executed async - and that will introduce overhead during the runtime as such the second entry will diverge from the time it cloned the repo to the moment of the push, because most likely the first entry will run first.

```
"publish": [
   {
            "type": "git",
            "auth":"ssh",
            "url": "git@github.com:sjultra/secret-repo.git",
            "path": "/root/Mars/output/",
            "branch": "main"
        },
        {
            "type": "git",
            "auth":"pat",
            "url": "github.com/sjultra/secret-repo",
            "user": "sjultra",
            "key": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
            "path": "/root/Mars/output/",
            "branch": "main"
        }
]
```