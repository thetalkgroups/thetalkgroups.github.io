var HOST = "http://localhost:4001";
var itemSinglar = location.pathname.match(/\/(\w+)\/(?=([\w-]+\.html.*?)?$)/)[1].replace(/s$/, "");


var setItemToCache = function (prefix, item) { return localStorage.setItem(prefix.replace("/sticky", "") + "/" + item._id, JSON.stringify(item)); };
var getItemFromCache = function (prefix, id) { return JSON.parse(localStorage.getItem(prefix.replace("/sticky", "") + "/" + id)); };

var List = (function () {
    function List(prefix) {
        this.prefix = prefix;
    }
    List.prototype.getItems = function (page, offset, userId) {
        var _this = this;
        if (offset === void 0) { offset = 0; }
        return this.listItems(page, offset).then(function (ids) {
            var cachedItems = [];
            var newIds = [];
            ids.forEach(function (id) {
                var cachedItem = getItemFromCache(_this.prefix, id);
                if (cachedItem)
                    cachedItems.push(cachedItem);
                else
                    newIds.push(id);
            });
            return _this.fetchItems(newIds, userId).then(function (newItems) {
                newItems.forEach(function (newItem) { return setItemToCache(_this.prefix, newItem); });
                return cachedItems.concat(newItems);
            });
        });
    };
    List.prototype.listItems = function (page, offset) {
        return fetch(HOST + this.prefix + "/list/" + page + "-" + offset).then(function (res) { return res.json(); });
    };
    List.prototype.fetchItems = function (ids, userId) {
        return fetch(HOST + this.prefix + "/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": userId
            },
            body: JSON.stringify(ids)
        }).then(function (res) { return res.json(); });
    };
    return List;
}());

var EventEmitter = (function () {
    function EventEmitter() {
        this.nextId = 0;
        this.subscribers = [];
    }
    EventEmitter.prototype.subscribe = function (func) {
        var _this = this;
        var thisId = this.nextId;
        this.nextId += 1;
        if (this.value !== undefined) {
            func(this.value);
        }
        this.subscribers.push({ id: thisId, func: func });
        return function () {
            _this.subscribers = _this.subscribers.filter(function (_a) {
                var id = _a.id;
                return id !== thisId;
            });
        };
    };
    EventEmitter.prototype.next = function (value) {
        var _this = this;
        this.value = value;
        this.subscribers.forEach(function (_a) {
            var func = _a.func;
            return func(_this.value);
        });
    };
    return EventEmitter;
}());

var config = {
    apiKey: "AIzaSyAjSDRU_Sl8DbTftnDghDsZJsxlAEvQpxE",
    authDomain: "fir-auth-test-fe62c.firebaseapp.com",
    databaseURL: "https://fir-auth-test-fe62c.firebaseio.com"
};
var providers = {
    "google": new firebase.auth.GoogleAuthProvider(),
    "twitter": new firebase.auth.TwitterAuthProvider(),
    "facebook": new firebase.auth.FacebookAuthProvider()
};
firebase.initializeApp(config);
var UserService = (function () {
    function UserService() {
        var _this = this;
        this.user = new EventEmitter();
        if (!Object.keys(localStorage).find(function (k) { return k.startsWith("firebase"); })) {
            this.user.next(null);
        }
        firebase.auth().onAuthStateChanged(function (_a) {
            var displayName = _a.displayName, photoURL = _a.photoURL, email = _a.email, uid = _a.uid;
            return _this.user.next({ id: uid, name: displayName, photo: photoURL, email: email });
        });
    }
    UserService.prototype.signIn = function (provider) {
        return firebase.auth().signInWithPopup(providers[provider]);
    };
    UserService.prototype.signOut = function () {
        this.user.next(null);
        return firebase.auth().signOut();
    };
    return UserService;
}());

var userService = new UserService();

var stickyList = new List(prefix + "/sticky");
var normalList = new List(prefix);
var pageMatch = location.search.match(/page=(\d+)/);
var page = 1;
if (pageMatch)
    page = parseInt(pageMatch[1], 10) || 1;
var createListItemElement = function (item) {
    var template = document.importNode(document.getElementById("list-item").content, true);
    var el = document.createElement("article");
    el.appendChild(template);
    var itemName = el.querySelector(".list-item__name");
    var itemDate = el.querySelector(".list-item__date");
    var itemTitle = el.querySelector(".list-item__title");
    el.className = "list-item";
    itemName.innerText = item.user.name;
    itemDate.innerText = moment(item.date).fromNow();
    itemTitle.innerText = item.title;
    itemTitle.href = itemSinglar + ".html?id=" + item._id;
    return el;
};
window.addEventListener("load", function () {
    var normalListEl = document.querySelector(".list__normal");
    var stickyListEl = document.querySelector(".list__sticky");
    var askAQuestion = document.querySelector(".list-header__add-item");
    userService.user
        .subscribe(function (user) {
        if (!user) {
            askAQuestion.hidden = true;
            return;
        }
        askAQuestion.hidden = false;
    });
    stickyList.getItems(page)
        .then(function (stickyItems) {
        stickyItems.map(createListItemElement).forEach(function (itemEl) { return stickyListEl.appendChild(itemEl); });
        return normalList.getItems(page, stickyItems.length).then(function (normalItems) {
            return normalItems.map(createListItemElement).forEach(function (itemEl) { return normalListEl.appendChild(itemEl); });
        });
    })
        .catch(function (error) { return console.error(error); });
});
//# sourceMappingURL=list.roll.js.map
