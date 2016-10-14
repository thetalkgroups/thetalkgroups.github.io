const pageMatch = location.search.match(/page=(\d+)/);
let page = 1;

if (pageMatch) page = parseInt(pageMatch[1], 10) || 1;
const listNormal = document.querySelector(".list__normal");
const listSticky = document.querySelector(".list__sticky");

api.items.getItemList(page)
    .then(items => {
        items.sticky.map(createListItemElement).forEach(itemEl => listSticky.appendChild(itemEl));
        items.normal.map(createListItemElement).forEach(itemEl => listNormal.appendChild(itemEl));
    })
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
    const template = document.importNode((document.getElementById("list-item") as HTMLTemplateElement).content, true);
    const el = document.createElement("article");
    el.appendChild(template)

    const itemName = el.querySelector(".list-item__name") as HTMLElement;
    const itemDate = el.querySelector(".list-item__date") as HTMLElement;
    const itemTitle = el.querySelector(".list-item__title") as HTMLAnchorElement;

    el.className = "list-item";

    itemName.innerText = item.user.name;
    itemDate.innerText = moment(item.date).fromNow();
    itemTitle.innerText = item.title;
    itemTitle.href = `${itemSinglar}.html?id=${item._id}`;

    return el;
}