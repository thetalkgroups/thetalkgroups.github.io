var createReplyElement = function (item) {
    var template = document.importNode(document.getElementById("reply").content, true);
    var el = document.createElement("article");
    el.appendChild(template);
    var photo = el.querySelector(".reply__photo");
    var name = el.querySelector(".reply__name");
    var date = el.querySelector(".reply__date");
    var answer = el.querySelector(".reply__answer");
    var image = el.querySelector(".reply__image");
    el.className = "reply";
    photo.src = item.user.photo;
    name.innerText = item.user.name;
    date.innerText = moment(item.date).fromNow();
    answer.innerText = item.answer;
    if (item.image) {
        image.hidden = false;
        image.src = api.getImageUrl(item.image);
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
    var page = 1;
    var pageMatch = location.search.match(/page=(\d+)/);
    if (pageMatch)
        page = parseInt(pageMatch[1], 10) || 1;
    api.list.getOne(id)
        .then(function (item) {
        itemPhoto.src = item.user.photo;
        itemName.innerText = item.user.name;
        itemDate.innerText = moment(item.date).fromNow();
        itemTitle.innerText = item.title;
        itemContent.innerText = item.content;
    })
        .catch(function (error) { return console.error(error); });
    api.replys.get(page)
        .then(function (replys) {
        return replys.map(createReplyElement).forEach(function (replyEl) { return replysEl.appendChild(replyEl); });
    })
        .catch(function (error) { return console.error(error); });
    window.userService.user.subscribe(function (user) {
        if (!user) {
            loginWarning.hidden = false;
            reply.hidden = true;
            return;
        }
        delete user.id;
        loginWarning.hidden = true;
        reply.hidden = false;
        var onProgress = function (progress) {
            console.log(progress);
        };
        reply.onsubmit = function (event) {
            event.preventDefault();
            var data = formToJson(reply);
            data["user"] = user;
            api.add(data, onProgress)
                .then(function () { return location.href = location.href; })
                .catch(function (error) { return console.error(error); });
            return false;
        };
    });
});
//# sourceMappingURL=item.js.map