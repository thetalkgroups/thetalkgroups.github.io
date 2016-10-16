import "./common";
import { HOST, getItemFromCache, setItemToCache, itemSinglar, formToJson } from "./api-globals"
import { List } from "./api-list"
import { userService } from "./globals"
import { Item, Reply } from "./types/item"
import { initPagination } from "./pagination"

declare const id: string
declare const prefix: string

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
const addReply = (data: any, onProgress: (percent: number | Error) => void) => {
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
                xhr.onprogress = ({ lengthComputable, total, loaded }) => {
                    if (!lengthComputable) return onProgress(new Error("length is not computeable"));

                    onProgress(loaded / total);
                };

                xhr.open("POST", HOST + "/files", true);
                xhr.send(fd);
            })
        }
        else {
            onProgress(new Error("no image was uploaded"));

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
            .catch(error => console.error(error));
    }

    return el;
};

window.addEventListener("load", () => {
    const replysEl = document.querySelector(".replys");
    const itemPhoto = document.querySelector(".item__photo") as HTMLImageElement;
    const itemName = document.querySelector(".item__name");
    const itemDate = document.querySelector(".item__date");
    const itemTitle = document.querySelector(".item__title");
    const itemContent = document.querySelector(".item__content");
    const loginWarning = document.querySelector(".login-warning");
    const reply = document.querySelector(".reply-form") as HTMLFormElement;
    const uploadedImageEl = document.querySelector(".reply-form__uploaded-image") as HTMLImageElement;
    const imageInput = document.getElementById("image") as HTMLInputElement
    const buttons = document.querySelector(".item__header__top__buttons");
    const deleteBtn = document.querySelector(".item__delete") as HTMLButtonElement;
    const stickyButton = document.querySelector(".item__sticky") as HTMLButtonElement;
    const noReplys = document.querySelector(".replys__no-replys");
    const pagination = document.querySelector(".pagination");

    let page = 1;
    const pageMatch = location.search.match(/page=(\d+)/);

    if (pageMatch) page = parseInt(pageMatch[1], 10) || 1;
    
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

    userService.user.subscribe(user => {
        const userId = user ? user.id : null;

        getItem(userId)
            .then(item => {
                itemPhoto.src = item.user.photo;
                itemName.innerHTML = item.user.name;
                itemDate.innerHTML = moment(item.date).fromNow();
                itemTitle.innerHTML = item.title;

                if (item.permission === "you" || item.permission === "admin") {
                    buttons.removeAttribute("hidden");

                    deleteBtn.onclick = _ => confirm(`Are you sure you want do delete this ${itemSinglar}?`) 
                        ? deleteItem(id, userId, prefix)
                            .then(_ => location.href = location.href.replace(/\w+\.html.*?$/, ""))
                            .catch(error => console.error(error)) 
                        : undefined;

                    if (item.permission === "admin") {
                        stickyButton.removeAttribute("hidden");

                        stickyButton.innerHTML = item.sticky ? "remove sticky" : "mark as sticky";

                        stickyButton.onclick = _ => confirm("Are you sure you want to " + (item.sticky ? "mark this " + itemSinglar + " as sticky" : "remove sticky from this " + itemSinglar)) 
                            ? setSticky(userId, item.sticky)
                                .then(_ => history.go())
                                .catch(error => console.error(error))
                            : undefined
                    }
                }
                
                const content = Object.keys(item.content)
                    .reduce((content, k) => content + `<div class="${k}">${item.content[k]}</div>`);

                itemContent.innerHTML = content;
            })
            .catch(error => console.error(error));

        replyList.getItems(page, 0, userId)
            .then(({ items, numberOfPages }) => {
                if (numberOfPages === 1) {
                    pagination.setAttribute("hidden", "");
                }
                else {
                    initPagination(page, numberOfPages);
                }


                if (items.length === 0) {
                    noReplys.removeAttribute("hidden");
                }

                items.map(reply => createReplyElement(reply, userId))
                    .forEach(replyEl => replysEl.appendChild(replyEl))
            })
            .catch(error => console.error(error));

        if (!user) {
            loginWarning.removeAttribute("hidden");
            reply.setAttribute("hidden", "");
            buttons.setAttribute("hidden", "");

            return;
        }

        loginWarning.setAttribute("hidden", "");
        reply.removeAttribute("hidden");

        const onProgress = (progress: number) => {
            console.log(progress);
        }



        reply.onsubmit = event => {
            const data = formToJson(reply);

            event.preventDefault();

            data["user"] = user

            addReply(data, onProgress)
                .then(() => history.go())
                .catch(error => console.error(error));

            return false;
        };
    })
});