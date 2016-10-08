function formToJson(form) {
    var formData = new FormData(form);
    var json = {};
    formData["forEach"](function (data, key) {
        json[key] = data;
    });
    return json;
}
var createReplyElement = function (item) {
    var el = document.createElement("article");
    var photo = document.createElement("img");
    var text = document.createElement("section");
    var textHeader = document.createElement("section");
    var name = document.createElement("p");
    var date = document.createElement("p");
    var answer = document.createElement("p");
    photo.className = "reply__photo";
    photo.src = item.user.photo;
    name.className = "reply__name";
    name.innerText = item.user.name;
    date.className = "reply__date";
    date.innerText = moment(item.date).fromNow();
    textHeader.appendChild(name);
    textHeader.appendChild(date);
    answer.className = "reply__answer";
    answer.innerText = item.answer;
    text.className = "reply__text";
    text.appendChild(textHeader);
    text.appendChild(answer);
    el.className = "reply";
    el.appendChild(photo);
    el.appendChild(text);
    return el;
};
window.addEventListener("load", function () {
    var page = 1;
    var pageMatch = location.search.match(/page=(\d+)/);
    if (pageMatch)
        page = parseInt(pageMatch[1], 10) || 1;
    var itemEl = document.querySelector(".item");
    var replysEl = document.createElement("section");
    return api.list.getOne(id).then(function (item) {
        return api.replys.get(page).then(function (replys) {
            replysEl.className = "replys";
            replys.map(createReplyElement).forEach(function (replyEl) { return replysEl.appendChild(replyEl); });
            itemEl.innerHTML = "\n                <section class=\"item__header\">\n                    <header class=\"item__header__top\">\n                        <img class=\"item__photo\" src=\"" + item.user.photo + "\" alt=\"photo\">\n                        <section>\n                            <p class=\"item__name\">" + item.user.name + "</p>\n                            <p class=\"item__date\">" + moment(item.date).fromNow() + "</p>\n                        </section>\n                    </header>\n                    <h2 class=\"item__title\">" + item.title + "</h2>\n                    <p class=\"item__content\">" + item.content + "</p>\n                </section>                \n            ";
            itemEl.appendChild(replysEl);
            itemEl.innerHTML += "\n                <section class=\"login-warning\">\n                    <p><a href=\"/sign-in.html\">login</a> to reply</p>\n                </section>\n\n                <form class=\"reply-form\" hidden>\n                    <label for=\"image\"><img src=\"/assets/static/ic_camera_alt_black_24px.svg\" alt=\"upload photo\"></label>\n                    <input id=\"image\" name=\"image\" type=\"file\" accept=\"image/*\" hidden>\n                    <textarea id=\"answer\" name=\"answer\" placeholder=\"type your answer here...\" required></textarea>\n                    <button type=\"submit\">reply</button>\n                </form>\n            ";
        });
    })
        .then(function (_) {
        var loginWarning = itemEl.querySelector(".login-warning");
        var reply = itemEl.querySelector(".reply-form");
        window.userService.user.subscribe(function (user) {
            if (!user) {
                loginWarning.hidden = false;
                reply.hidden = true;
                return;
            }
            delete user.id;
            loginWarning.hidden = true;
            reply.hidden = false;
            reply.onsubmit = function (event) {
                event.preventDefault();
                var data = formToJson(reply);
                data.user = user;
                api.add(data, true)
                    .then(function () { return location.href = location.href; })
                    .catch(function (error) { return console.error(error); });
                return false;
            };
        });
    })
        .catch(function (error) { return console.error(error); });
});
//# sourceMappingURL=item.js.map