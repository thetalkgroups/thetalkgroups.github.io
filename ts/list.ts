import "./common";
import { List } from "./api-list";
import { userService } from "./globals";
import { Item } from "./types/item";
import { initPagination } from "./pagination";

declare const prefix: string
const normalList = new List<Item>(prefix);
const stickyList = new List<Item>(prefix + "/sticky");

const pageMatch = location.search.match(/page=(\d+)/);
let page = 1;

if (pageMatch) page = parseInt(pageMatch[1], 10) || 1;

let listItemTemplate: HTMLTemplateElement;
const createListItemElement = (item: Item) => {
    const el = document.createElement("article");
    el.appendChild(listItemTemplate.content.cloneNode(true))

    const itemName = el.querySelector(".list-item__name") as HTMLElement;
    const itemDate = el.querySelector(".list-item__date") as HTMLElement;
    const itemTitle = el.querySelector(".list-item__title") as HTMLAnchorElement;

    el.className = "list-item";

    itemName.innerText = item.user.name;
    itemDate.innerText = moment(item.date).fromNow();
    itemTitle.innerText = item.title;
    itemTitle.href = `item.html?id=${item._id}`;

    return el;
}

window.addEventListener("load", () => {
    const normalListEl = document.querySelector(".list__normal");
    const stickyListEl = document.querySelector(".list__sticky");
    const askAQuestion = document.querySelector(".list-header__add-item") as HTMLElement
    const spinner = document.querySelector(".spinner");
    const list = document.querySelector(".list");
    const pagination = document.querySelector(".pagination");
    const errorEl = document.querySelector(".error");
    const errorMessage = document.querySelector(".error__message");
    listItemTemplate = document.getElementById("list-item") as HTMLTemplateElement;

    const handleError = (error: any) => {
        console.error(error);

        errorEl.removeAttribute("hidden");
        errorMessage.innerHTML = error.constructor.name.endsWith("Error") ? error.message : error.toString();

        list.setAttribute("hidden", "");
        pagination.setAttribute("hidden", "");
        askAQuestion.setAttribute("hidden", "");
    }

    const refreshList = (page: number) => {
        const timeoutId = setTimeout(() => spinner.removeAttribute("hidden"), 100);
        
        stickyListEl.innerHTML = "";
        normalListEl.innerHTML = "";
        
        return stickyList.getItems(page)
            .then(stickyItems => {
                stickyItems.items.map(createListItemElement).forEach(itemEl => stickyListEl.appendChild(itemEl));

                return normalList.getItems(page)
                    .then(normalItems => {
                        clearTimeout(timeoutId);
                        spinner.setAttribute("hidden", "");

                        normalItems.items.map(createListItemElement).forEach(itemEl => normalListEl.appendChild(itemEl));

                        return stickyItems.numberOfPages;
                    });
            })
    } 
    
    refreshList(page)
        .then((numberOfPages) => {
            if (numberOfPages === 1 || numberOfPages === 0) {
                pagination.setAttribute("hidden", "");
            }
            else {
                initPagination(page, numberOfPages, refreshList, handleError)
            }
        })
        .catch(handleError);

    userService.user
        .subscribe(user => {
            const userId = user ? user.id : "UNSET"
            stickyList.setUserId(userId);
            normalList.setUserId(userId);
            
            if (!user) {
                askAQuestion.hidden = true;

                return;
            }

            askAQuestion.hidden = false;
        });
});