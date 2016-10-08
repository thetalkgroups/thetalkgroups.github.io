var pageMatch = location.search.match(/page=(\d+)/);
var page = 1;
if (pageMatch)
    page = parseInt(pageMatch[1], 10) || 1;
var itemSinglar = location.pathname.match(/(\w+)\/$/)[1].replace(/s$/, "");
var listEl = document.querySelector(".list");
api.list.get(page)
    .then(function (items) { return items.map(createListItemElement).forEach(function (itemEl) { return listEl.appendChild(itemEl); }); })
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
    var itemEl = document.createElement("article");
    var itemHeader = document.createElement("header");
    var itemName = document.createElement("p");
    var itemDate = document.createElement("p");
    var itemTitle = document.createElement("a");
    itemEl.className = "list-item";
    itemName.className = "list-item__user-name";
    itemName.innerText = item.user.name;
    itemDate.className = "list-item__date";
    itemDate.innerText = moment(item.date).fromNow();
    itemTitle.innerText = item.title;
    itemTitle.href = itemSinglar + ".html?id=" + item._id;
    itemHeader.appendChild(itemName);
    itemHeader.appendChild(itemDate);
    itemEl.appendChild(itemHeader);
    itemEl.appendChild(itemTitle);
    return itemEl;
};
//# sourceMappingURL=list.js.map