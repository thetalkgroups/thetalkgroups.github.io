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

var HOST$1 = "http://83.93.98.21:8000";
var collectionMap = {
    "questions": "question",
    "tips-and-tricks": "tip",
    "trip-reports": "report"
};
var getItemSingular = function (collection) { return collectionMap[collection]; };
var formToJson = function (form) {
    var formData = new FormData(form);
    var json = {};
    formData["forEach"](function (data, key) {
        json[key] = data;
    });
    return json;
};
var setItemToCache = function (prefix, item) { return localStorage.setItem("/item" + prefix.replace("/sticky", "") + "/" + item._id, JSON.stringify(item)); };
var getItemFromCache = function (prefix, id) { return JSON.parse(localStorage.getItem("/item" + prefix.replace("/sticky", "") + "/" + id)); };
var getPage = function () {
    var page = 1;
    var pageMatch = location.search.match(/page=(\d+)/);
    if (pageMatch)
        page = parseInt(pageMatch[1], 10) || 1;
    return page;
};
var getId = function (handleError) {
    var idMatch = location.search.match(/id=(\w+)/);
    if (!idMatch) {
        return handleError(new Error("id missing"));
    }
    return idMatch[1];
};

var List = (function () {
    function List(prefix) {
        this.prefix = prefix;
    }
    List.prototype.setUserId = function (userId) { this.userId = userId; };
    List.prototype.getItems = function (page) {
        var _this = this;
        return this.listItems(page).then(function (_a) {
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
            if (newIds.length === 0)
                return { items: cachedItems, numberOfPages: numberOfPages };
            return _this.fetchItems(newIds).then(function (newItems) {
                newItems.forEach(function (newItem) { return setItemToCache(_this.prefix, newItem); });
                return { items: cachedItems.concat(newItems), numberOfPages: numberOfPages };
            });
        });
    };
    List.prototype.listItems = function (page) {
        return fetch(HOST$1 + this.prefix + "/list/" + page, {
            headers: { "Authorization": this.userId || "UNSET" }
        }).then(function (res) {
            if (!res.ok)
                return res.text().then(function (text) { throw text; });
            return res.json();
        });
    };
    List.prototype.fetchItems = function (ids) {
        return fetch(HOST$1 + this.prefix + "/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": this.userId || "UNSET"
            },
            body: JSON.stringify(ids)
        }).then(function (res) {
            if (!res.ok)
                return res.text().then(function (text) { throw text; });
            return res.json();
        });
    };
    return List;
}());

var initPagination = function (page, numberOfPages, refreshList, handleError) {
    var numberOfNavigations = 0;
    var prev = document.querySelector(".pagination__prev");
    var next = document.querySelector(".pagination__next");
    var pageEl = document.querySelector(".pagination__page");
    var updatePageEl = function () {
        if (page === 1)
            prev.classList.add("disabled");
        else
            prev.classList.remove("disabled");
        if (page === numberOfPages)
            next.classList.add("disabled");
        else
            next.classList.remove("disabled");
        history.pushState(null, null, getUrlWithPage(page));
        pageEl.innerHTML = page + " of " + numberOfPages;
    };
    window.addEventListener("popstate", function () {
        if (numberOfNavigations === 0) {
            history.back();
        }
        else {
            numberOfNavigations -= 1;
            page = getPage();
            updatePageEl();
            refreshList(page).catch(handleError);
        }
    });
    prev.onclick = function () {
        if (prev.classList.contains("disabled"))
            return;
        page -= 1;
        updatePageEl();
        numberOfNavigations += 1;
        refreshList(page).catch(handleError);
    };
    next.onclick = function () {
        if (next.classList.contains("disabled"))
            return;
        page += 1;
        updatePageEl();
        numberOfNavigations += 1;
        refreshList(page).catch(handleError);
    };
    updatePageEl();
};
var getUrlWithPage = function (page) {
    var url = new URL(location.href);
    if (page === 1) {
        url.search = url.search.replace(/&?page=\d+/, "");
    }
    else if (!url.search.match("page=")) {
        url.search += (url.search ? "&" : "") + "page=" + page;
    }
    else {
        url.search = url.search.replace(/page=\d+/, "page=" + page);
    }
    return url.toString();
};

var userId = null;
var wasUnset = false;
var itemSingular = getItemSingular(collection);
window.addEventListener("load", function () {
    var replysEl = document.querySelector(".replys");
    var itemHeader = document.querySelector(".item__header");
    var itemPhoto = document.querySelector(".item__photo");
    var itemName = document.querySelector(".item__name");
    var itemDate = document.querySelector(".item__date");
    var itemTitle = document.querySelector(".item__title");
    var itemContent = document.querySelector(".item__content");
    var itemSpinner = document.querySelector(".item__spinner");
    var itemAdminActions = document.querySelector(".item__header .admin-actions");
    var itemBanButton = document.querySelector(".item__header .admin-actions__ban");
    var itemKickButton = document.querySelector(".item__header .admin-actions__kick");
    var loginWarning = document.querySelector(".login-warning");
    var reply = document.querySelector(".reply-form");
    var uploadedImageEl = document.querySelector(".reply-form__uploaded-image");
    var imageInput = document.getElementById("image");
    var buttons = document.querySelector(".item__header__top__buttons");
    var deleteBtn = document.querySelector(".item__delete");
    var stickyButton = document.querySelector(".item__sticky");
    var noReplys = document.querySelector(".replys__no-replys");
    var pagination = document.querySelector(".pagination");
    var replysSpinner = document.querySelector(".replys__spinner");
    var errorEl = document.querySelector(".error");
    var errorMessage = document.querySelector(".error__message");
    var kickUserPrompt = document.querySelector(".kick-user-prompt");
    var kickUserAmount = document.querySelector(".kick-user-prompt__amount");
    var kickUserMeasurement = document.querySelector(".kick-user-prompt__measurement");
    var kickUserButton = document.querySelector(".kick-user-prompt__button");
    var kickUserCancle = document.querySelector(".kick-user-prompt__cancle");
    var breadcrumbSection = document.querySelector(".breadcrumb p");
    breadcrumbSection.innerHTML = getItemSingular(collection);
    var handleError = function (error) {
        console.error(error);
        errorEl.removeAttribute("hidden");
        errorMessage.innerHTML = error.constructor.name.endsWith("Error") ? error.message : error.toString();
        clearTimeout(replySpinnerTimeoutId);
        itemHeader.setAttribute("hidden", "");
        replysSpinner.setAttribute("hidden", "");
        reply.setAttribute("hidden", "");
        replysEl.setAttribute("hidden", "");
        pagination.setAttribute("hidden", "");
        loginWarning.setAttribute("hidden", "");
    };
    var id = getId(handleError);
    if (!id)
        return;
    var replyPrefix = prefix + ("/" + id + "/replys");
    var replyList = new List(replyPrefix);
    var deleteItem = function (id, pre) {
        return fetch("" + HOST + pre + "/" + id, {
            method: "DELETE",
            headers: { "Authorization": userId }
        }).then(function (res) {
            if (!res.ok)
                return res.text().then(function (text) { throw text; });
        });
    };
    var itemSpinnerTimeoutId;
    var getItem = function () {
        itemSpinnerTimeoutId = setTimeout(function () { return itemSpinner.removeAttribute("hidden"); }, 100);
        return Promise.resolve(getItemFromCache(prefix, id))
            .then(function (item) {
            if (item && item.content)
                return item;
            return fetch(HOST + prefix + "/" + id, {
                headers: { "Authorization": userId }
            })
                .then(function (res) {
                if (!res.ok)
                    res.text().then(function (text) { throw text; });
                else {
                    return res.json().then(function (item) {
                        setItemToCache(prefix, item);
                        return item;
                    });
                }
            });
        });
    };
    var setSticky = function (sticky) {
        if (sticky === void 0) { sticky = false; }
        localStorage.removeItem("/item" + prefix + "/" + id);
        return fetch("" + HOST + prefix + "/" + id + "/sticky", {
            method: "POST",
            body: JSON.stringify({ value: sticky }),
            headers: {
                "Content-Type": "application/json",
                "Authorization": userId
            }
        })
            .then(function (res) {
            if (!res.ok)
                return res.text().then(function (text) { throw text; });
        });
    };
    var addReply = function (data) {
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
                xhr_1.open("POST", HOST + "/files", true);
                xhr_1.send(fd_1);
            });
        }
        else {
            delete data["image"];
        }
        return next.then(function () {
            return fetch(HOST + replyPrefix, {
                method: "PUT",
                body: JSON.stringify(data),
                headers: { "Content-Type": "application/json", "Authorization": userId }
            });
        })
            .then(function (res) {
            if (!res.ok)
                return res.text().then(function (text) { throw text; });
        });
    };
    var createReplyElement = function (reply) {
        var template = document.importNode(document.getElementById("reply").content, true);
        var el = document.createElement("article");
        el.appendChild(template);
        var photo = el.querySelector(".reply__photo");
        var name = el.querySelector(".reply__name");
        var date = el.querySelector(".reply__date");
        var answer = el.querySelector(".reply__answer");
        var image = el.querySelector(".reply__image");
        var deleteBtn = el.querySelector(".reply__delete");
        var adminActions = el.querySelector(".admin-actions");
        var banButton = el.querySelector(".admin-actions__ban");
        var kickButton = el.querySelector(".admin-actions__kick");
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
            deleteBtn.onclick = function (_) { return deleteItem(reply._id, replyPrefix)
                .then(function () { return history.go(); })
                .catch(handleError); };
            if (reply.permission === "admin") {
                var hideAdminActions_1 = function () {
                    adminActions.setAttribute("hidden", "");
                    document.removeEventListener("click", hideAdminActions_1);
                };
                photo.onclick = function (_) {
                    adminActions.removeAttribute("hidden");
                    setTimeout(function () { return document.addEventListener("click", hideAdminActions_1); });
                };
                banButton.onclick = function (_) { return banUser(reply.user.name, replyPrefix, reply._id); };
                kickButton.onclick = function (_) { return kickUser(replyPrefix, reply._id); };
            }
        }
        return el;
    };
    var banUser = function (username, prefix, itemId) {
        confirm("Are you sure you want to ban '" + username + "'?")
            ? fetch(HOST + "/users/ban/", {
                method: "PUT",
                body: JSON.stringify({ prefix: prefix, itemId: itemId }),
                headers: { "Content-Type": "application/json", "Authorization": userId }
            })
                .then(function (res) {
                if (!res.ok)
                    return res.text().then(function (text) { throw text; });
            })
                .catch(handleError)
            : null;
    };
    var kickUser = function (pre, itemId) {
        kickUserPrompt.removeAttribute("hidden");
        kickUserCancle.onclick = function (_) {
            kickUserPrompt.setAttribute("hidden", "");
            kickUserAmount.value = "0";
            kickUserMeasurement.selectedIndex = 0;
        };
        kickUserButton.onclick = function (_) {
            var measurement = parseInt(kickUserMeasurement.selectedOptions[0].value, 10);
            var amount = parseInt(kickUserAmount.value, 10);
            var kickTime = amount * measurement;
            fetch(HOST + "/users/kick/" + kickTime, {
                method: "PUT",
                body: JSON.stringify({ prefix: pre, itemId: itemId }),
                headers: { "Content-Type": "application/json", "Authorization": userId }
            })
                .then(function (res) {
                if (!res.ok)
                    return res.text().then(function (text) { throw text; });
                kickUserPrompt.setAttribute("hidden", "");
            })
                .catch(handleError);
        };
    };
    var page = getPage();
    var replySpinnerTimeoutId = -1;
    imageInput.addEventListener("change", function () {
        var fr = new FileReader();
        var uploadedImage = imageInput.files[0];
        fr.onload = function (event) {
            uploadedImageEl.src = event.target.result;
            uploadedImageEl.removeAttribute("hidden");
            uploadedImageEl.nextElementSibling.setAttribute("hidden", "");
        };
        fr.readAsDataURL(uploadedImage);
    });
    var showItem = function (item) {
        clearTimeout(itemSpinnerTimeoutId);
        itemSpinner.setAttribute("hidden", "");
        itemPhoto.src = item.user.photo;
        itemName.innerHTML = item.user.name;
        itemDate.innerHTML = moment(item.date).fromNow();
        itemTitle.innerHTML = item.title;
        if (item.permission === "you" || item.permission === "admin") {
            buttons.removeAttribute("hidden");
            deleteBtn.onclick = function (_) { return confirm("Are you sure you want do delete this " + itemSingular + "?")
                ? deleteItem(id, prefix)
                    .then(function (_) { return location.href = location.href.replace(/\w+\.html.*?$/, ""); })
                    .catch(handleError)
                : undefined; };
            if (item.permission === "admin") {
                var hideItemAdminActions_1 = function () {
                    itemAdminActions.setAttribute("hidden", "");
                    document.removeEventListener("click", hideItemAdminActions_1);
                };
                itemPhoto.onclick = function (_) {
                    itemAdminActions.removeAttribute("hidden");
                    setTimeout(function () { return document.addEventListener("click", hideItemAdminActions_1); });
                };
                itemBanButton.onclick = function (_) { return banUser(item.user.name, prefix, item._id); };
                itemKickButton.onclick = function (_) { return kickUser(prefix, item._id); };
                stickyButton.removeAttribute("hidden");
                stickyButton.innerHTML = item.sticky ? "remove sticky" : "mark as sticky";
                stickyButton.onclick = function (_) { return confirm("Are you sure you want to " + (item.sticky
                    ? "mark this " + itemSingular + " as sticky"
                    : "remove sticky from this " + itemSingular))
                    ? setSticky(item.sticky)
                        .then(function (_) { return history.go(); })
                        .catch(handleError)
                    : undefined; };
            }
        }
        var content = Object.keys(item.content)
            .reduce(function (content, k) { return content + ("<div class=\"" + k + "\">" + item.content[k] + "</div>"); }, "");
        itemContent.innerHTML = content;
    };
    var listReplys = function (page) {
        replySpinnerTimeoutId = setTimeout(function () { return replysSpinner.removeAttribute("hidden"); }, 100);
        replysEl.innerHTML = "";
        return replyList.getItems(page)
            .then(function (value) {
            clearTimeout(replySpinnerTimeoutId);
            replysSpinner.setAttribute("hidden", "");
            var items = value.items, numberOfPages = value.numberOfPages;
            items.map(function (reply) { return createReplyElement(reply); })
                .forEach(function (replyEl) { return replysEl.appendChild(replyEl); });
            return value;
        });
    };
    getItem().then(function (item) {
        if (item.permission === "none") {
            wasUnset = true;
        }
        return item;
    }).then(showItem).catch(handleError);
    userService.user.subscribe(function (user) {
        userId = user ? user.id : null;
        replyList.setUserId(userId);
        if (userId && wasUnset) {
            localStorage.removeItem("/item" + prefix + "/" + id);
        }
        getItem().then(showItem).catch(handleError);
        listReplys(page)
            .then(function (_a) {
            var items = _a.items, numberOfPages = _a.numberOfPages;
            if (numberOfPages === 1 || numberOfPages === 0) {
                pagination.setAttribute("hidden", "");
            }
            else {
                initPagination(page, numberOfPages, listReplys, handleError);
            }
            if (items.length === 0) {
                noReplys.removeAttribute("hidden");
            }
        })
            .catch(handleError);
        if (!user) {
            loginWarning.removeAttribute("hidden");
            reply.setAttribute("hidden", "");
            buttons.setAttribute("hidden", "");
            return;
        }
        loginWarning.setAttribute("hidden", "");
        reply.removeAttribute("hidden");
        reply.onsubmit = function (event) {
            var data = formToJson(reply);
            event.preventDefault();
            data["user"] = user;
            addReply(data)
                .then(function () { return history.go(); })
                .catch(handleError);
            return false;
        };
    });
});
//# sourceMappingURL=item.roll.js.map
