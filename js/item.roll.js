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
var formToJson = function (form) {
    var formData = new FormData(form);
    var json = {};
    formData["forEach"](function (data, key) {
        json[key] = data;
    });
    return json;
};
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

var replyPrefix = prefix + ("/" + id + "/replys");
var replyList = new List(replyPrefix);
var deleteItem = function (id, userId, pre) {
    return fetch("" + HOST + pre + "/" + id, {
        method: "DELETE",
        headers: { "Authorization": userId }
    });
};
var getItem = function (userId) {
    return Promise.resolve(getItemFromCache(prefix, id))
        .then(function (item) {
        if (item && item.content)
            return item;
        return fetch(HOST + prefix + "/" + id, {
            headers: { "Authorization": userId }
        })
            .then(function (res) { return res.json(); })
            .then(function (item) {
            setItemToCache(prefix, item);
            return item;
        });
    });
};
var setSticky = function (userId, sticky) {
    if (sticky === void 0) { sticky = false; }
    localStorage.removeItem(prefix + "/" + id);
    return fetch("" + HOST + prefix + "/" + id + "/sticky", {
        method: "POST",
        body: JSON.stringify({ value: sticky }),
        headers: {
            "Content-Type": "application/json",
            "Authorization": userId
        }
    });
};
var addReply = function (data, onProgress) {
    var image = data["image"];
    var next = Promise.resolve();
    if (image.size) {
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
                    return onProgress(new Error("length is not computeable"));
                onProgress(loaded / total);
            };
            xhr_1.open("POST", HOST + "/files", true);
            xhr_1.send(fd_1);
        });
    }
    else {
        onProgress(new Error("no image was uploaded"));
        delete data["image"];
    }
    return next.then(function () {
        return fetch(HOST + replyPrefix, {
            method: "PUT",
            body: JSON.stringify(data),
            headers: { "Content-Type": "application/json" }
        });
    });
};
var createReplyElement = function (reply, userId) {
    var template = document.importNode(document.getElementById("reply").content, true);
    var el = document.createElement("article");
    el.appendChild(template);
    var photo = el.querySelector(".reply__photo");
    var name = el.querySelector(".reply__name");
    var date = el.querySelector(".reply__date");
    var answer = el.querySelector(".reply__answer");
    var image = el.querySelector(".reply__image");
    var deleteBtn = el.querySelector(".reply__delete");
    el.className = "reply";
    photo.src = reply.user.photo;
    name.innerHTML = reply.user.name;
    date.innerHTML = moment(reply.date).fromNow();
    answer.innerHTML = reply.answer;
    if (reply.image) {
        image.hidden = false;
        image.src = HOST + "/files/" + reply.image;
    }
    if (reply.permission === "you" || reply.permission === "admin") {
        deleteBtn.removeAttribute("hidden");
        deleteBtn.onclick = function (_) { return deleteItem(reply._id, userId, replyPrefix)
            .then(function (_) { return location.href = location.href; })
            .catch(function (error) { return console.error(error); }); };
    }
    return el;
};
window.addEventListener("load", function () {
    var replysEl = document.querySelector(".replys");
    var itemPhoto = document.querySelector(".item__photo");
    var itemName = document.querySelector(".item__name");
    var itemDate = document.querySelector(".item__date");
    var itemTitle = document.querySelector(".item__title");
    var itemContent = document.querySelector(".item__content");
    var loginWarning = document.querySelector(".login-warning");
    var reply = document.querySelector(".reply-form");
    var buttons = document.querySelector(".item__header__top__buttons");
    var deleteBtn = document.querySelector(".item__delete");
    var stickyButton = document.querySelector(".item__sticky");
    var noReplys = document.querySelector(".replys__no-replys");
    var pagination = document.querySelector(".pagination");
    var page = 1;
    var pageMatch = location.search.match(/page=(\d+)/);
    if (pageMatch)
        page = parseInt(pageMatch[1], 10) || 1;
    userService.user.subscribe(function (user) {
        var userId = user ? user.id : null;
        getItem(userId)
            .then(function (item) {
            itemPhoto.src = item.user.photo;
            itemName.innerHTML = item.user.name;
            itemDate.innerHTML = moment(item.date).fromNow();
            itemTitle.innerHTML = item.title;
            if (item.permission === "you" || item.permission === "admin") {
                buttons.removeAttribute("hidden");
                deleteBtn.onclick = function (_) { return confirm("Are you sure you want do delete this " + itemSinglar + "?")
                    ? deleteItem(id, userId, prefix)
                        .then(function (_) { return location.href = location.href.replace(/\w+\.html.*?$/, ""); })
                        .catch(function (error) { return console.error(error); })
                    : undefined; };
                if (item.permission === "admin") {
                    stickyButton.removeAttribute("hidden");
                    stickyButton.innerHTML = item.sticky ? "remove sticky" : "mark as sticky";
                    stickyButton.onclick = function (_) { return confirm("Are you sure you want to " + (item.sticky ? "mark this " + itemSinglar + " as sticky" : "remove sticky from this " + itemSinglar))
                        ? setSticky(userId, item.sticky)
                            .then(function (_) { return location.href = location.href; })
                            .catch(function (error) { return console.error(error); })
                        : undefined; };
                }
            }
            var content = Object.keys(item.content)
                .reduce(function (content, k) { return content + ("<div class=\"" + k + "\">" + item.content[k] + "</div>"); });
            itemContent.innerHTML = content;
        })
            .catch(function (error) { return console.error(error); });
        replyList.getItems(page, 0, userId)
            .then(function (_a) {
            var items = _a.items, numberOfPages = _a.numberOfPages;
            if (numberOfPages === 1) {
                pagination.setAttribute("hidden", "");
            }
            else {
                initPagination(page, numberOfPages);
            }
            if (items.length === 0) {
                noReplys.removeAttribute("hidden");
            }
            items.map(function (reply) { return createReplyElement(reply, userId); })
                .forEach(function (replyEl) { return replysEl.appendChild(replyEl); });
        })
            .catch(function (error) { return console.error(error); });
        if (!user) {
            loginWarning.removeAttribute("hidden");
            reply.setAttribute("hidden", "");
            buttons.setAttribute("hidden", "");
            return;
        }
        loginWarning.setAttribute("hidden", "");
        reply.removeAttribute("hidden");
        var onProgress = function (progress) {
            console.log(progress);
        };
        reply.onsubmit = function (event) {
            event.preventDefault();
            var data = formToJson(reply);
            Object.keys(data).filter(function (k) { return k !== "image"; })
                .forEach(function (k) { return data[k] = data[k]; });
            data["user"] = user;
            addReply(data, onProgress)
                .then(function () { return location.href = location.href; })
                .catch(function (error) { return console.error(error); });
            return false;
        };
    });
});
//# sourceMappingURL=item.roll.js.map
