const pageMatch = location.search.match(/page=(\d+)/);
let page = 1;

if (pageMatch) page = parseInt(pageMatch[1], 10) || 1;
const itemSinglar = location.pathname.match(/(\w+)\/$/)[1].replace(/s$/, "");
let listEl = document.querySelector(".list")

api.list.get(page)
    .then(items => items.map(createListItemElement).forEach(itemEl => listEl.appendChild(itemEl)))
    .then(_ => {
        const questionListEl = document.querySelector(".list") as HTMLElement;
        const askAQuestion = document.querySelector(".list-header__add-item") as HTMLElement
        
        window.userService.user.subscribe(user => {
            if (!user) return;

            askAQuestion.hidden = false;
        })
    })
    .catch(error => console.error(error));

const createListItemElement = (item: Item) => {
    const itemEl = document.createElement("article");
    const itemHeader = document.createElement("header");
    const itemName = document.createElement("p");
    const itemDate = document.createElement("p");
    const itemTitle = document.createElement("a");

    itemEl.className = "list-item";

    itemName.className = "list-item__user-name";
    itemName.innerText = item.user.name;

    itemDate.className = "list-item__date";
    itemDate.innerText = moment(item.date).fromNow();

    itemTitle.innerText = item.title;
    itemTitle.href = `${itemSinglar}.html?id=${item._id}`;

    itemHeader.appendChild(itemName);
    itemHeader.appendChild(itemDate);

    itemEl.appendChild(itemHeader);
    itemEl.appendChild(itemTitle);

    return itemEl;
}