var HOST = "http://localhost:4001";
var CachedList = (function () {
    function CachedList(prefix, isNew) {
        this.prefix = prefix;
        this.isNew = isNew;
    }
    CachedList.prototype.setCache = function (key, item) {
        localStorage.setItem(key, JSON.stringify(item));
    };
    CachedList.prototype.getCache = function (key) {
        return JSON.parse(localStorage.getItem(key));
    };
    CachedList.prototype.fetchAll = function (ids) {
        return fetch(HOST + this.prefix, {
            method: "POST",
            body: JSON.stringify(ids),
            headers: { "Content-Type": "application/json" }
        }).then(function (res) { return res.json(); });
    };
    CachedList.prototype.fetchList = function (page) {
        return fetch("" + HOST + this.prefix + "/list/" + page)
            .then(function (res) { return res.json(); });
    };
    CachedList.prototype.fetch = function (id) {
        return fetch("" + HOST + this.prefix + "/" + id).then(function (res) { return res.json(); });
    };
    CachedList.prototype.get = function (page) {
        var _this = this;
        return this.fetchList(page)
            .then(function (ids) { return ids.map(function (id) { return _this.getCache(_this.prefix + "-" + id) || id; }); })
            .then(function (items) {
            var newIds = items
                .map(function (id, i) {
                if (typeof id === "string") {
                    delete items[i];
                    return id;
                }
            })
                .filter(Boolean);
            if (newIds.length === 0)
                return items;
            return _this.fetchAll(newIds)
                .then(function (newItems) {
                newItems.forEach(function (newItem) {
                    return _this.setCache(_this.prefix + "-" + newItem._id, newItem);
                });
                return items.concat(newItems);
            });
        });
    };
    CachedList.prototype.getOne = function (id) {
        var _this = this;
        return Promise.resolve(this.getCache(this.prefix + "-" + id))
            .then(function (item) {
            if (_this.isNew(item))
                return _this.fetch(id).then(function (item) {
                    _this.setCache(_this.prefix + "-" + item._id, item);
                    return item;
                });
            return item;
        });
    };
    return CachedList;
}());
var Api = (function () {
    function Api(prefix, isNew) {
        this.prefix = prefix;
        this.cachedList = new CachedList(prefix, isNew);
    }
    Api.prototype.add = function (data) {
        return fetch(HOST + this.prefix, {
            method: "PUT",
            body: JSON.stringify(data),
            headers: { "Content-Type": "application/json" }
        }).then(function (_) { });
    };
    Api.prototype.delete = function (id) {
        return fetch("" + HOST + this.prefix + "/" + id, { method: "DELETE" }).then(function (_) { });
    };
    return Api;
}());
//# sourceMappingURL=cached-list.js.map