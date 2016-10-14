var pageMatch = location.search.match(/page=(\d+)/);
var page = 1;
if (pageMatch)
    page = parseInt(pageMatch[1], 10) || 1;
var listNormal = document.querySelector(".list__normal");
var listSticky = document.querySelector(".list__sticky");
api.items.getItemList(page)
    .then(function (items) {
    items.sticky.map(createListItemElement).forEach(function (itemEl) { return listSticky.appendChild(itemEl); });
    items.normal.map(createListItemElement).forEach(function (itemEl) { return listNormal.appendChild(itemEl); });
})
    .then(function (_) {
    var questionListEl = document.querySelector(".list");
    var askAQuestion = document.querySelector(".list-header__add-item");
    window.userService.user.subscribe(function (user) {
        if (!user)
            return;
        askAQuestion.hidden = false;
    });
})
    .catch(function (error) { return console.error(error); });
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
//# sourceMappingURL=list.js.map