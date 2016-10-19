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

var clearItemsFromCahce = function () { return Object.keys(localStorage)
    .filter(function (k) { return k.startsWith("/item"); })
    .forEach(function (k) { return localStorage.removeItem(k); }); };
var userService = new UserService();
var isParentOf = function (target, selector) {
    if (target.nodeName === "HTML")
        return false;
    if (target.matches(selector))
        return true;
    return isParentOf(target.parentNode, selector);
};

if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/service-worker.js", { scope: "/" })
        .then(function () { return console.log("service worker registered"); });
}
window.addEventListener("load", function () {
    var navigation = document.querySelector(".navigation");
    var header = document.querySelector(".header");
    var breadcrumb = document.querySelector(".breadcrumb");
    var wrapper = document.querySelector(".wrapper");
    var openNavButton = document.querySelector(".header__top-bar__open-nav-button");
    var closeNavButton = document.querySelector(".navigation__close-nav-button");
    var userNameOnly = document.querySelector(".header__top-bar__user-name");
    var signInButton = document.querySelector(".header__top-bar__sign-in-button");
    var userCard = document.querySelector(".header__user");
    var userName = document.querySelector(".header__user__name");
    var userEmail = document.querySelector(".header__user__email");
    var userPhoto = document.querySelector(".header__user__photo");
    var signOutButton = document.querySelector(".header__user__sign-out-button");
    signInButton.hidden = false;
    var openNav = function () {
        navigation.classList.add("open");
        setTimeout(function () { return document.addEventListener("click", shadowClose); });
    };
    var shadowClose = function (_a) {
        var target = _a.target;
        if (isParentOf(target, ".navigation"))
            return;
        closeNav();
    };
    var closeNav = function () {
        navigation.classList.remove("open");
        document.removeEventListener("click", shadowClose);
    };
    var smallHeaderHeight = 72;
    var topElement = breadcrumb || wrapper;
    var topElementMargin = 16;
    var resizeHeader = function () {
        var headerHeight = document.body.getBoundingClientRect().right * headerImageHWRatio;
        var headerHiddenHeight = headerHeight - smallHeaderHeight;
        var scrollTop = window.scrollY;
        if (scrollTop > headerHiddenHeight) {
            header.style.top = -headerHiddenHeight + "px";
            topElement.style.marginTop = headerHeight + topElementMargin + "px";
            header.classList.add("small");
        }
        else {
            topElement.removeAttribute("style");
            header.classList.remove("small");
        }
    };
    var updateUser = function (user) {
        if (!user) {
            signInButton.hidden = false;
            userNameOnly.hidden = true;
            userCard.classList.add("not-signed-in");
        }
        else {
            signInButton.hidden = true;
            userNameOnly.hidden = false;
            userCard.classList.remove("not-signed-in");
            userNameOnly.innerText = user.name;
            userName.innerText = user.name;
            userEmail.innerText = user.email;
            userPhoto.src = user.photo;
        }
    };
    var hidden = true;
    var showUserCard = function () {
        userCard.hidden = false;
        if (hidden) {
            setTimeout(function () { return document.addEventListener("click", hideUserCard); });
            hidden = false;
        }
    };
    var hideUserCard = function (event) {
        event.preventDefault();
        if (isParentOf(event.target, ".header__user"))
            return;
        hidden = true;
        userCard.hidden = true;
        document.removeEventListener("click", hideUserCard);
    };
    var signOut = function () {
        clearItemsFromCahce();
        hideUserCard({ target: document.body, preventDefault: function () { return null; } });
        userService.signOut();
    };
    userService.user.subscribe(updateUser);
    window.addEventListener("scroll", resizeHeader);
    openNavButton.addEventListener("click", openNav);
    closeNavButton.addEventListener("click", closeNav);
    signOutButton.addEventListener("click", signOut);
    userNameOnly.addEventListener("click", showUserCard);
});

var HOST = "https://83.93.98.21:8000";

var formToJson = function (form) {
    var formData = new FormData(form);
    var json = {};
    formData["forEach"](function (data, key) {
        json[key] = data;
    });
    return json;
};

var addItem = function (data, userId) {
    return fetch(HOST + prefix, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": userId
        },
        body: JSON.stringify(data)
    })
        .then(function (res) {
        if (!res.ok) {
            res.text().then(function (text) { return console.error(text); });
            return;
        }
        return res;
    });
};
window.addEventListener("load", function () {
    var loginWarning = document.querySelector(".login-warning");
    var form = document.querySelector(".add-item");
    var fieldsEl = form.querySelector(".fields");
    var errorEl = document.querySelector(".error");
    var handleError = function (error) {
        console.error(error);
        errorEl.removeAttribute("hidden");
        loginWarning.setAttribute("hidden", "");
        form.setAttribute("hidden", "");
    };
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
        if (!user) {
            form.setAttribute("hidden", "");
            loginWarning.removeAttribute("hidden");
            return;
        }
        form.removeAttribute("hidden");
        loginWarning.setAttribute("hidden", "");
        var onAddItem = function (event) {
            event.preventDefault();
            var formData = formToJson(form);
            var otherFormData = Object.keys(formData).filter(function (k) { return k !== "title"; })
                .reduce(function (obj, k) {
                obj[k] = formData[k];
                return obj;
            }, {});
            var data = {
                _id: undefined,
                permission: undefined,
                title: formData["title"],
                user: { id: user.id, name: user.name, photo: user.photo },
                content: otherFormData,
                fields: fields.map(function (field) { return field.name; })
            };
            addItem(data, user.id)
                .then(function () { return location.href = location.href.replace(/[\w-]+\.html$/, ""); })
                .catch(function (error) { return console.error(error); });
            return false;
        };
        form.addEventListener("submit", onAddItem);
    });
});
//# sourceMappingURL=add-item.roll.js.map
