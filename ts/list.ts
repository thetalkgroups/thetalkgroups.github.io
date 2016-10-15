import "./common";
import { List } from "./api-list";
import { itemSinglar } from "./api-globals";
import { userService } from "./globals";
import { Item } from "./types/item";

declare const prefix: string

const stickyList = new List<Item>(prefix + "/sticky");
const normalList = new List<Item>(prefix);

const pageMatch = location.search.match(/page=(\d+)/);
let page = 1;

if (pageMatch) page = parseInt(pageMatch[1], 10) || 1;

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

window.addEventListener("load", () => {
    const normalListEl = document.querySelector(".list__normal");
    const stickyListEl = document.querySelector(".list__sticky");
    const askAQuestion = document.querySelector(".list-header__add-item") as HTMLElement

    userService.user
        .subscribe(user => {
            if (!user) {
                askAQuestion.hidden = true;

                return;
            }

            askAQuestion.hidden = false;
        });

    stickyList.getItems(page)
        .then(stickyItems => {
            stickyItems.map(createListItemElement).forEach(itemEl => stickyListEl.appendChild(itemEl))

            return normalList.getItems(page, stickyItems.length).then(normalItems =>
                normalItems.map(createListItemElement).forEach(itemEl => normalListEl.appendChild(itemEl)))
        })  
        .catch(error => console.error(error));
});