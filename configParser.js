const fs = require("fs");

class config {
    constructor(path) {
        if (fs.existsSync(`${path}`)) {
            const raw = fs.readFileSync(`${path}`);
            let config = JSON.parse(raw);
            this._ = config;
            return this._;
        } else {
            const raw = fs.readFileSync("./config.json");
            let config = JSON.parse(raw);
            this._ = config;
            return this._;
        }
    }
}

module.exports = config;