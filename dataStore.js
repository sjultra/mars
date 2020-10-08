class DStore {
    constructor() {
        this._data = {};
        return this;
    }

    set(id, item) {
        this._data[id] = item;
    }

    get(id) {
        return this._data[id];
    }

    del(id) {
        delete this._data[id];
    }
    debug(str = "") {
        console.log(str, JSON.stringify(this._data));
    }
}

module.exports = DStore;