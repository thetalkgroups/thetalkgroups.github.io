import "./common";
import { HOST, getItemFromCache, setItemToCache, itemSinglar, formToJson } from "./api-globals"
import { List } from "./api-list"
import { userService } from "./globals"
import { Item, Reply } from "./types/item"
import { initPagination } from "./pagination"

declare const prefix: string

window.addEventListener("load", () => {
    const replysEl = document.querySelector(".replys");
    const itemHeader = document.querySelector(".item__header");
    const itemPhoto = document.querySelector(".item__photo") as HTMLImageElement;
    const itemName = document.querySelector(".item__name");
    const itemDate = document.querySelector(".item__date");
    const itemTitle = document.querySelector(".item__title");
    const itemContent = document.querySelector(".item__content");
    const itemSpinner = document.querySelector(".item__spinner");
    const loginWarning = document.querySelector(".login-warning");
    const reply = document.querySelector(".reply-form") as HTMLFormElement;
    const uploadedImageEl = document.querySelector(".reply-form__uploaded-image") as HTMLImageElement;
    const imageInput = document.getElementById("image") as HTMLInputElement
    const buttons = document.querySelector(".item__header__top__buttons");
    const deleteBtn = document.querySelector(".item__delete") as HTMLButtonElement;
    const stickyButton = document.querySelector(".item__sticky") as HTMLButtonElement;
    const noReplys = document.querySelector(".replys__no-replys");
    const pagination = document.querySelector(".pagination");
    const replysSpinner = document.querySelector(".replys__spinner");
    const errorEl = document.querySelector(".error");
    const handleError = (error: any) => {
        console.error(error);

        errorEl.removeAttribute("hidden");

        clearTimeout(replySpinnerTimeoutId);

        itemHeader.setAttribute("hidden", "");
        replysSpinner.setAttribute("hidden", "");
        reply.setAttribute("hidden", "");
        replysEl.setAttribute("hidden", "");
        pagination.setAttribute("hidden", "");
        loginWarning.setAttribute("hidden", "");
    }
    const idMatch = location.search.match(/id=(\w+)/);
    let id: string;

    if (!idMatch) {
        return handleError(new Error("id missing"));
    }
    else {
        id = idMatch[1];
    }

    const replyPrefix = prefix + `/${id}/replys`;
    const replyList = new List<Reply>(replyPrefix);

    const deleteItem = (id: string, userId: string, pre: string) => 
        fetch(`${HOST}${pre}/${id}`, { 
            method: "DELETE", 
            headers: { "Authorization": userId } 
        });

    const getItem = (userId: string) =>
        Promise.resolve(getItemFromCache(prefix, id) as Item)
            .then(item => {
                if (item && item.content) return item;

                return fetch(HOST+prefix+"/"+id, { 
                    headers: { "Authorization": userId } 
                })
                    .then(res => res.json())
                    .then((item: Item) => {
                        setItemToCache(prefix, item);

                        return item;
                    });
            });

    const setSticky = (userId: string, sticky: boolean = false) => {
        localStorage.removeItem(`${prefix}/${id}`)

        return fetch(`${HOST}${prefix}/${id}/sticky`, {
            method: "POST",
            body: JSON.stringify({ value: sticky }),
            headers: {
                "Content-Type": "application/json", 
                "Authorization": userId 
            }
        })
    }
    const addReply = (data: any) => {
        const image = (data as any)["image"] as File;
        let next = Promise.resolve();

        if (image.size) {
            const fd = new FormData();
            const xhr = new XMLHttpRequest();

            fd.append("image", image);

            next = new Promise<void>((resolve, reject) => {
                xhr.onload = () => {
                    (data as any)["image"] = xhr.responseText;

                    resolve();
                };
                xhr.onerror = reject;

                xhr.open("POST", HOST + "/files", true);
                xhr.send(fd);
            })
        }
        else {
            delete (data as any)["image"]
        }

        return next.then(() => 
            fetch(HOST + replyPrefix, {
                method: "PUT",
                body: JSON.stringify(data),
                headers: { "Content-Type": "application/json" }
            }))
    }
    const createReplyElement = (reply: Reply, userId: string) => {
        const template = document.importNode((document.getElementById("reply") as HTMLTemplateElement).content, true);
        const el = document.createElement("article");
        el.appendChild(template);

        const photo = el.querySelector(".reply__photo") as HTMLImageElement;
        const name = el.querySelector(".reply__name");
        const date = el.querySelector(".reply__date");
        const answer = el.querySelector(".reply__answer");
        const image = el.querySelector(".reply__image") as HTMLImageElement;
        const deleteBtn = el.querySelector(".reply__delete") as HTMLButtonElement;

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

            deleteBtn.onclick = _ => deleteItem(reply._id, userId, replyPrefix)
                .then(_ => history.go())
                .catch(handleError);
        }

        return el;
    };

    

    let page = 1;
    const pageMatch = location.search.match(/page=(\d+)/);

    if (pageMatch) page = parseInt(pageMatch[1], 10) || 1;
    let replySpinnerTimeoutId = -1;

    imageInput.addEventListener("change", () => {
        const fr = new FileReader();
        const uploadedImage = imageInput.files[0];

        fr.onload = event => {
            uploadedImageEl.src = (event.target as any).result;
            uploadedImageEl.removeAttribute("hidden");
            uploadedImageEl.nextElementSibling.setAttribute("hidden", "");
        }

        fr.readAsDataURL(uploadedImage);
    })

    const itemSpinnerTimeoutId = setTimeout(() => itemSpinner.removeAttribute("hidden"), 100);

    userService.user.subscribe(user => {
        const userId = user ? user.id : null;

        const listReplys = (page:number) => {
            replySpinnerTimeoutId = setTimeout(() => replysSpinner.removeAttribute("hidden"), 100);
            replysEl.innerHTML = "";

            return replyList.getItems(page, 0, userId)
                .then((value) => {
                    clearTimeout(replySpinnerTimeoutId);
                    replysSpinner.setAttribute("hidden", "");

                    const { items, numberOfPages } = value;

                    items.map(reply => createReplyElement(reply, userId))
                        .forEach(replyEl => replysEl.appendChild(replyEl));

                    return value;
                });
        }

        getItem(userId)
            .then(item => {
                clearTimeout(itemSpinnerTimeoutId);
                itemSpinner.setAttribute("hidden", "");

                itemPhoto.src = item.user.photo;
                itemName.innerHTML = item.user.name;
                itemDate.innerHTML = moment(item.date).fromNow();
                itemTitle.innerHTML = item.title;

                if (item.permission === "you" || item.permission === "admin") {
                    buttons.removeAttribute("hidden");

                    deleteBtn.onclick = _ => confirm(`Are you sure you want do delete this ${itemSinglar}?`) 
                        ? deleteItem(id, userId, prefix)
                            .then(_ => location.href = location.href.replace(/\w+\.html.*?$/, ""))
                            .catch(handleError)
                        : undefined;

                    if (item.permission === "admin") {
                        stickyButton.removeAttribute("hidden");

                        stickyButton.innerHTML = item.sticky ? "remove sticky" : "mark as sticky";

                        stickyButton.onclick = _ => confirm("Are you sure you want to " + (item.sticky ? "mark this " + itemSinglar + " as sticky" : "remove sticky from this " + itemSinglar)) 
                            ? setSticky(userId, item.sticky)
                                .then(_ => history.go())
                                .catch(handleError)
                            : undefined
                    }
                }
                
                const content = Object.keys(item.content)
                    .reduce((content, k) => content + `<div class="${k}">${item.content[k]}</div>`);

                itemContent.innerHTML = content;
            })
            .catch(handleError);

        listReplys(page)
            .then(({ items, numberOfPages }) => {
                if (numberOfPages === 1 || numberOfPages === 0) {
                    pagination.setAttribute("hidden", "");
                }
                else {
                    initPagination(page, numberOfPages, listReplys);
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

        reply.onsubmit = event => {
            const data = formToJson(reply);

            event.preventDefault();

            data["user"] = user

            addReply(data)
                .then(() => history.go())
                .catch(handleError);

            return false;
        };
    })
});