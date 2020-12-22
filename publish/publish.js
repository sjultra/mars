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
const fs = require('fs');
const fse = require('fs-extra');
const uuid = require("uuid");

const simpleGit = require('simple-git');

SupportedTypesPublish = ['GIT']
SupportedTypesPublishAuth = ['SSH', 'PAT']

const checkPath = (path) => {
    if (!fs.lstatSync(path).isDirectory()) {
        console.log('Path provided in the config is not a folder.')
        process.exit(0)
    }
}

const getFileList = (path) => {
    //Parse each folder until only files are found
    filelist = {}
    filenames = fs.readdirSync(path)
    for (file of filenames) {
        if (!file.startsWith(".")) {
            newpath = path + "/" + file
            if (fs.lstatSync(newpath).isDirectory()) {
                getFileList(newpath)
            } else {
                size = getFileSize(newpath)
                filelist[file] = size
            }
        }
    }
    return filelist
}

const getFileSize = (filename) => {
    const stats = fs.statSync(filename);
    const { size } = stats;
    // convert to human readable format.
    const i = Math.floor(Math.log(size) / Math.log(1024));
    return (size / Math.pow(1024, i)).toFixed(2) * 1 + ' ' + ['B', 'KB', 'MB', 'GB', 'TB'][i];
}

const Publish = (config) => {
    if (config.publish && config.publish.length >= 1) {
        for (const entry of config.publish) {
            switch (entry.type.toUpperCase()) {
                case SupportedTypesPublish[0].toUpperCase():
                    checkPath(entry.path)
                    console.log(JSON.stringify( getFileList(entry.path),null, 4))
                    const remote = (entry.auth.toUpperCase() == SupportedTypesPublishAuth[0]) ? entry.url : `https://${entry.user}:${entry.key}@${entry.url}`;
                    try {
                        const tmpGitDir = `/tmp/git_${uuid.v1()}`
                        if (!fs.existsSync(tmpGitDir)) { fs.mkdirSync(tmpGitDir) }
                        const git = simpleGit(tmpGitDir);
                        commit = new Date(Date.now()).toISOString();
                        branch = entry.branch;
                        git.checkIsRepo()
                            .then(isRepo => {
                                console.log("Check if path is repo: ", isRepo)
                                !isRepo && git.init()
                                    .then(() => {
                                        console.log("Add remote ", remote)
                                        git.addRemote('origin', remote)
                                            .then(() => {
                                                console.log("Fetch all")
                                                git.fetch().then(() => {
                                                    console.log("Checkout to branch: ", branch)
                                                    git.checkout(branch).then(() => {
                                                        console.log("Copy changed files")
                                                        fse.copySync(entry.path, tmpGitDir)
                                                        console.log("Add all files")
                                                        git.add('.').then(() => {
                                                            console.log("Commit: ", commit)
                                                            git.commit(commit).then(() => {
                                                                console.log("Push to branch: ", branch)
                                                                git.push(['-u', 'origin', branch]).then(() => {
                                                                    console.log("Cleaning Up git directory")
                                                                    fse.removeSync(tmpGitDir)
                                                                    console.log("Done!")
                                                                })
                                                            })
                                                        })
                                                    })
                                                })
                                            })
                                    })
                            });

                    } catch (error) {
                        console.log(error)
                    }
                    break
            }
        }
    }
}

module.exports = { Publish }
