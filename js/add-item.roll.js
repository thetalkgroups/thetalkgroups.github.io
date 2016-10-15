var HOST = "http://localhost:4001";
var itemSinglar = location.pathname.match(/\/(\w+)\/(?=([\w-]+\.html.*?)?$)/)[1].replace(/s$/, "");
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

var addItem = function (data) {
    return fetch(HOST + prefix, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });
};
window.addEventListener("load", function () {
    var loginWarning = document.querySelector(".login-warning");
    var form = document.querySelector(".add-item");
    var fieldsEl = form.querySelector(".fields");
    fields.forEach(function (field) {
        var label = document.createElement("label");
        var input = document.createElement(field.type);
        label.innerText = field.name;
        label.setAttribute("for", field.name);
        input.id = field.name;
        input.name = field.name;
        input.required = field.required;
        fieldsEl.appendChild(label);
        fieldsEl.appendChild(input);
    });
    userService.user.subscribe(function (user) {
        if (!user)
            return;
        form.hidden = false;
        loginWarning.hidden = true;
        var onAddItem = function (event) {
            event.preventDefault();
            var formData = formToJson(form);
            var otherFormData = Object.keys(formData).filter(function (k) { return k === "title"; })
                .reduce(function (obj, k) {
                obj[k] = escapeHtml(formData[k]);
                return obj;
            }, {});
            var data = {
                _id: undefined,
                permission: undefined,
                title: escapeHtml(formData["title"]),
                user: { id: user.id, name: user.name, photo: user.photo },
                content: otherFormData,
                fields: fields.map(function (field) { return field.name; })
            };
            addItem(data)
                .then(function () { return location.href = location.href.replace(/[\w-]+\.html$/, ""); })
                .catch(function (error) { return console.error(error); });
            return false;
        };
        form.addEventListener("submit", onAddItem);
    });
});
//# sourceMappingURL=add-item.roll.js.map
