
### Example config file: [link](./config.json)


# Prisma Cloud config
```
    "PrismaCloud": [
        {
            "credentials": {
                "api": "https://api.prismacloud.io",
                "ApiID": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
                "ApiSecretKey": "xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
            },
            "requests": [
                "getUsers",
                "getSA",
                "getAuditLogs"
            ]
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
            ]
        }
    ],
```

# CSCC config
```
    "CSCC": [
        {
            "credentials": {
                "GOOGLE_APPLICATION_CREDENTIALS": "./SA_File.json",
                "ORG_ID": "xxxxxxxxxxxx"
            },
            "requests": [
                "get_assets"
            ]
        }
    ],

```

# Output config
```
    "output": {
        "mode": "File",
        "path": "./local"
    }
```
