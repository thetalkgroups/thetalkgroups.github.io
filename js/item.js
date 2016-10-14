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
        image.src = api.getImageUrl(reply.image);
    }
    if (reply.permission === "you" || reply.permission === "admin") {
        deleteBtn.removeAttribute("hidden");
        deleteBtn.onclick = function (_) { return api.replys.delete(reply._id, userId)
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
    var page = 1;
    var pageMatch = location.search.match(/page=(\d+)/);
    if (pageMatch)
        page = parseInt(pageMatch[1], 10) || 1;
    window.userService.user.subscribe(function (user) {
        var userId = user ? user.id : null;
        api.items.getOne(id, userId)
            .then(function (item) {
            itemPhoto.src = item.user.photo;
            itemName.innerHTML = item.user.name;
            itemDate.innerHTML = moment(item.date).fromNow();
            itemTitle.innerHTML = item.title;
            if (item.permission === "you" || item.permission === "admin") {
                buttons.removeAttribute("hidden");
                deleteBtn.onclick = function (_) { return confirm("Are you sure you want do delete this " + itemSinglar + "?")
                    ? api.items.delete(id, userId)
                        .then(function (_) { return location.href = location.href.replace(/\w+\.html.*?$/, ""); })
                        .catch(function (error) { return console.error(error); })
                    : undefined; };
                if (item.permission === "admin") {
                    stickyButton.removeAttribute("hidden");
                    stickyButton.innerHTML = item.sticky ? "remove sticky" : "mark as sticky";
                    stickyButton.onclick = function (_) { return confirm("Are you sure you want to " + (item.sticky ? "mark this " + itemSinglar + " as sticky" : "remove sticky from this " + itemSinglar))
                        ? api.setSticky(userId, item.sticky)
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
        api.replys.getReplyList(page, userId)
            .then(function (replys) {
            if (replys.length === 0) {
                replysEl.innerHTML = "<p>there are no replys yet</p>";
            }
            replys.map(function (reply) { return createReplyElement(reply, userId); })
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
                .forEach(function (k) { return data[k] = escapeHtml(data[k]); });
            data["user"] = user;
            api.replys.add(data, onProgress)
                .then(function () { return location.href = location.href; })
                .catch(function (error) { return console.error(error); });
            return false;
        };
    });
});
//# sourceMappingURL=item.js.map