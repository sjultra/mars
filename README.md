# Project Mars  ☄️
The main goal of the project Mars is to provide an easy to use log agregation and report generation platform.


# Architecture 
![](https://dev.azure.com/sjultra/84b44f65-71ec-4e78-94e7-f37950720110/_apis/git/repositories/63b6cf20-429e-46f5-a227-c93f38893dbf/items?path=%2FDrawings%2Fimage%2FMars_Architecture.png&versionDescriptor%5BversionOptions%5D=0&versionDescriptor%5BversionType%5D=0&versionDescriptor%5Bversion%5D=CB&resolveLfs=true&%24format=octetStream&api-version=5.0)




# Getting started:
1. Compiling a [Config](./CONFIG_README.md) that fulfills the needs
1. Running the docker container 


The example assums that the following folders exist:
1. config.local - containing a correct config.local.json
1. output.local - a empty folder that will have the logs gathered from the tool

**Config** - All paths for the that point to files should be written with the idea that in the example the folder structure is as follows:
- /root/Mars - $HOME
- /root/Mars/config - config folder
- /root/Mars/output - output folder 

### To run the docker run command
```
docker run --name=Mars -d \
--mount type=bind,source="$(pwd)"/config.local,target=/root/Mars/config \
--mount type=bind,source="$(pwd)"/output.local,target=/root/Mars/output \
 taeduard/sjumars:latest /bin/bash  -c "node main.js -c ./config/config.local.json"
```
