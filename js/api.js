var HOST = "http://localhost:4001";
var itemSinglar = location.pathname.match(/\/(\w+)\/(?=([\w-]+\.html.*?)?$)/)[1].replace(/s$/, "");
var _clearItemsFromCahce = function () { return Object.keys(localStorage)
    .filter(function (k) { return k.startsWith("/group"); })
    .forEach(function (k) { return localStorage.removeItem(k); }); };
var formToJson = function (form) {
    var formData = new FormData(form);
    var json = {};
    formData["forEach"](function (data, key) {
        json[key] = data;
    });
    return json;
};
var escapeHtml = function (content) {
    if (typeof content === "string")
        return content.replace(/</g, "&lt;");
    return content;
};
function setCache(key, item) {
    localStorage.setItem(key, JSON.stringify(item));
}
function getCache(key) {
    return JSON.parse(localStorage.getItem(key));
}
var CachedList = (function () {
    function CachedList(prefix, isNew) {
        this.prefix = prefix;
        this.isNew = isNew;
    }
    CachedList.prototype.fetchAll = function (ids, userId) {
        return fetch(HOST + this.prefix, {
            method: "POST",
            body: JSON.stringify(ids),
            headers: Object.assign({ "Content-Type": "application/json" }, userId ? { "Authorization": userId } : undefined)
        }).then(function (res) { return res.json(); });
    };
    CachedList.prototype.fetchList = function (page) {
        return fetch("" + HOST + this.prefix + "/list/" + page)
            .then(function (res) { return res.json(); });
    };
    CachedList.prototype.fetch = function (id, userId) {
        return fetch("" + HOST + this.prefix + "/" + id, userId ? { headers: { "Authorization": userId } } : undefined)
            .then(function (res) { return res.json(); });
    };
    CachedList.prototype.get = function (page, userId) {
        var _this = this;
        return this.fetchList(page)
            .then(function (ids) { return ids.map(function (id) { return getCache(_this.prefix + "-" + id) || id; }); })
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
            return _this.fetchAll(newIds, userId)
                .then(function (newItems) {
                newItems.forEach(function (newItem) {
                    return setCache(_this.prefix + "-" + newItem._id, newItem);
                });
                return items.concat(newItems);
            });
        });
    };
    CachedList.prototype.getOne = function (id, userId) {
        var _this = this;
        return Promise.resolve(getCache(this.prefix + "-" + id))
            .then(function (item) {
            if (_this.isNew(item))
                return _this.fetch(id, userId)
                    .then(function (item) {
                    setCache(_this.prefix + "-" + item._id, item);
                    return item;
                });
            return item;
        });
    };
    CachedList.prototype.delete = function (id, userId) {
        return fetch("" + HOST + this.prefix + "/" + id, { method: "DELETE", headers: { "Authorization": userId } });
    };
    CachedList.prototype.add = function (data, onProgress) {
        var _this = this;
        var image = data["image"];
        var next = Promise.resolve();
        if (onProgress && image.size) {
            var fd_1 = new FormData();
            var xhr_1 = new XMLHttpRequest();
            fd_1.append("image", image);
            next = new Promise(function (resolve, reject) {
                xhr_1.onload = function () {
                    data["image"] = xhr_1.responseText;
                    resolve();
                };
                xhr_1.onerror = reject;
                xhr_1.onprogress = function (_a) {
                    var lengthComputable = _a.lengthComputable, total = _a.total, loaded = _a.loaded;
                    if (!lengthComputable)
                        return onProgress(-1);
                    onProgress(loaded / total);
                };
                xhr_1.open("POST", HOST + "/files", true);
                xhr_1.send(fd_1);
            });
        }
        else {
            delete data["image"];
        }
        return next.then(function () {
            return fetch(HOST + _this.prefix, {
                method: "PUT",
                body: JSON.stringify(data),
                headers: { "Content-Type": "application/json" }
            });
        });
    };
    return CachedList;
}());
var Api = (function () {
    function Api(prefix, itemId, isNew) {
        this.prefix = prefix;
        this.itemId = itemId;
        this.items = new CachedList(prefix, isNew);
        if (itemId) {
            this.replys = new CachedList(prefix + "/" + itemId + "/replys", null);
        }
    }
    Api.prototype.getImageUrl = function (image) {
        return HOST + "/files/" + image;
    };
    return Api;
}());
//# sourceMappingURL=api.js.map