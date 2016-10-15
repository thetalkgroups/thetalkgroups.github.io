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
    .filter(function (k) { return k.startsWith("/group"); })
    .forEach(function (k) { return localStorage.removeItem(k); }); };
var userService = new UserService();

var isParentOf = function (target, selector) {
    if (target.nodeName === "HTML")
        return false;
    if (target.matches(selector))
        return true;
    return isParentOf(target.parentNode, selector);
};
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
        return this.listItems(page, offset).then(function (_a) {
            var ids = _a.ids, numberOfPages = _a.numberOfPages;
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
                return { items: cachedItems.concat(newItems), numberOfPages: numberOfPages };
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

var initPagination = function (page, numberOfPages) {
    var prev = document.querySelector(".pagination__prev");
    var next = document.querySelector(".pagination__next");
    var pageEl = document.querySelector(".pagination__page");
    if (page !== 1) {
        prev.href = getUrlWithPage(page - 1);
    }
    if (page < numberOfPages) {
        next.href = getUrlWithPage(page + 1);
    }
    pageEl.innerHTML = page + " of " + numberOfPages;
};
var getUrlWithPage = function (page) {
    var url = new URL(location.href);
    if (!url.search.match("page=")) {
        url.search += (url.search ? "&" : "") + "page=" + page;
    }
    else {
        url.search = url.search.replace(/page=\d+/, "page=" + page);
    }
    return url.toString();
};

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
        initPagination(page, stickyItems.numberOfPages);
        stickyItems.items.map(createListItemElement).forEach(function (itemEl) { return stickyListEl.appendChild(itemEl); });
        return normalList.getItems(page, stickyItems.items.length)
            .then(function (normalItems) {
            return normalItems.items.map(createListItemElement).forEach(function (itemEl) { return normalListEl.appendChild(itemEl); });
        });
    })
        .catch(function (error) { return console.error(error); });
});
//# sourceMappingURL=list.roll.js.map
