import "./common";
import { HOST, getItemFromCache, setItemToCache, getItemSingular, formToJson, getId, getPage } from "./api-globals";
import { List } from "./api-list";
import { userService } from "./globals";
import { Item, Reply } from "./types/item";
import { User } from "./types/user";
import { initPagination } from "./pagination";

declare const prefix: string;
declare const collection: "questions" | "tips-and-tricks" | "trip-reports";
let userId: string = null;
let wasUnset = false;
const itemSingular = getItemSingular(collection);

window.addEventListener("load", () => {
    const replysEl = document.querySelector(".replys");
    const itemHeader = document.querySelector(".item__header");
    const itemPhoto = document.querySelector(".item__photo") as HTMLImageElement;
    const itemName = document.querySelector(".item__name");
    const itemDate = document.querySelector(".item__date");
    const itemTitle = document.querySelector(".item__title");
    const itemContent = document.querySelector(".item__content");
    const itemSpinner = document.querySelector(".item__spinner");
    const itemAdminActions = document.querySelector(".item__header .admin-actions");
    const itemBanButton = document.querySelector(".item__header .admin-actions__ban") as HTMLButtonElement;
    const itemKickButton = document.querySelector(".item__header .admin-actions__kick") as HTMLButtonElement;
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
    const errorMessage = document.querySelector(".error__message");
    const kickUserPrompt = document.querySelector(".kick-user-prompt");
    const kickUserAmount = document.querySelector(".kick-user-prompt__amount") as HTMLInputElement;
    const kickUserMeasurement = document.querySelector(".kick-user-prompt__measurement") as HTMLSelectElement;
    const kickUserButton = document.querySelector(".kick-user-prompt__button") as HTMLButtonElement;
    const kickUserCancle = document.querySelector(".kick-user-prompt__cancle") as HTMLButtonElement;
    const breadcrumbSection = document.querySelector(".breadcrumb p");

    breadcrumbSection.innerHTML = getItemSingular(collection);

    const handleError = (error: any) => {
        console.error(error);

        errorEl.removeAttribute("hidden");

        errorMessage.innerHTML = error.constructor.name.endsWith("Error") ? error.message : error.toString();

        clearTimeout(replySpinnerTimeoutId);

        itemHeader.setAttribute("hidden", "");
        replysSpinner.setAttribute("hidden", "");
        reply.setAttribute("hidden", "");
        replysEl.setAttribute("hidden", "");
        pagination.setAttribute("hidden", "");
        loginWarning.setAttribute("hidden", "");
    }
    const id = getId(handleError);

    if (!id) return;

    const replyPrefix = prefix + `/${id}/replys`;
    const replyList = new List<Reply>(replyPrefix);

    const deleteItem = (id: string, pre: string) => 
        fetch(`${HOST}${pre}/${id}`, { 
            method: "DELETE", 
            headers: { "Authorization": userId } 
        }).then(res => {
            if (!res.ok) return res.text().then(text => {throw text});
        })

    let itemSpinnerTimeoutId: number
    const getItem = () => {
        itemSpinnerTimeoutId = setTimeout(() => itemSpinner.removeAttribute("hidden"), 100);

        return Promise.resolve(getItemFromCache(prefix, id) as Item)
            .then(item => {
                if (item && item.content) return item;

                return fetch(HOST+prefix+"/"+id, { 
                    headers: { "Authorization": userId } 
                })
                    .then(res => {
                        if (!res.ok) res.text().then(text => {throw text});
                        else {
                            return res.json().then((item: Item) => {
                                setItemToCache(prefix, item);

                                return item;
                            })
                        }
                    })
            });
    }
        

    const setSticky = (sticky: boolean = false) => {
        localStorage.removeItem(`/item${prefix}/${id}`);

        return fetch(`${HOST}${prefix}/${id}/sticky`, {
            method: "POST",
            body: JSON.stringify({ value: sticky }),
            headers: {
                "Content-Type": "application/json", 
                "Authorization": userId 
            }
        })
            .then(res => {
                if (!res.ok) return res.text().then(text => {throw text});
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
                headers: { "Content-Type": "application/json", "Authorization": userId }
            }))
                .then(res => {
                    if (!res.ok) return res.text().then(text => {throw text});
                })
    }
    const createReplyElement = (reply: Reply) => {
        const template = document.importNode((document.getElementById("reply") as HTMLTemplateElement).content, true);
        const el = document.createElement("article");
        el.appendChild(template);

        const photo = el.querySelector(".reply__photo") as HTMLImageElement;
        const name = el.querySelector(".reply__name");
        const date = el.querySelector(".reply__date");
        const answer = el.querySelector(".reply__answer");
        const image = el.querySelector(".reply__image") as HTMLImageElement;
        const deleteBtn = el.querySelector(".reply__delete") as HTMLButtonElement;
        const adminActions = el.querySelector(".admin-actions");
        const banButton = el.querySelector(".admin-actions__ban") as HTMLButtonElement;
        const kickButton = el.querySelector(".admin-actions__kick") as HTMLButtonElement;

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

            deleteBtn.onclick = _ => deleteItem(reply._id, replyPrefix)
                .then(() => history.go())
                .catch(handleError);

            if (reply.permission === "admin") {
                const hideAdminActions = () => {
                    adminActions.setAttribute("hidden", "");
                    document.removeEventListener("click", hideAdminActions);
                }
                photo.onclick = _ => {
                    adminActions.removeAttribute("hidden");

                    setTimeout(() => document.addEventListener("click", hideAdminActions));
                }
                banButton.onclick = _ => banUser(reply.user.name, replyPrefix, reply._id);
                kickButton.onclick = _ => kickUser(replyPrefix, reply._id);
            }
        }

        return el;
    };
    const banUser = (username: string, prefix: string, itemId: string) => {
        confirm(`Are you sure you want to ban '${username}'?`)
            ? fetch(HOST + "/users/ban/", {
                method: "PUT",
                body: JSON.stringify({ prefix, itemId }),
                headers: { "Content-Type": "application/json", "Authorization": userId }
            })
                .then(res => {
                    if (!res.ok) return res.text().then(text => {throw text});
                })
                .catch(handleError)
            : null;
    }
    
    const kickUser = (pre: string, itemId: string) => {
        kickUserPrompt.removeAttribute("hidden");

        kickUserCancle.onclick = _ => {
            kickUserPrompt.setAttribute("hidden", "");
            kickUserAmount.value = "0";
            kickUserMeasurement.selectedIndex = 0;       
        }

        kickUserButton.onclick = _ => {
            const measurement = parseInt(kickUserMeasurement.selectedOptions[0].value, 10);
            const amount = parseInt(kickUserAmount.value, 10);
            const kickTime = amount * measurement;
            fetch(HOST + "/users/kick/" + kickTime, {
                method: "PUT",
                body: JSON.stringify({ prefix: pre, itemId }),
                headers: { "Content-Type": "application/json", "Authorization": userId }
            })
                .then(res => {
                    if (!res.ok) return res.text().then(text => {throw text});

                    kickUserPrompt.setAttribute("hidden", "")
                })
                .catch(handleError);
        }    
    }

    const page = getPage();
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

    
    const showItem = (item: Item) => {
        clearTimeout(itemSpinnerTimeoutId);
        itemSpinner.setAttribute("hidden", "");

        itemPhoto.src = item.user.photo;
        itemName.innerHTML = item.user.name;
        itemDate.innerHTML = moment(item.date).fromNow();
        itemTitle.innerHTML = item.title;

        if (item.permission === "you" || item.permission === "admin") {
            buttons.removeAttribute("hidden");

            deleteBtn.onclick = _ => confirm(`Are you sure you want do delete this ${itemSingular}?`) 
                ? deleteItem(id, prefix)
                    .then(_ => location.href = location.href.replace(/\w+\.html.*?$/, ""))
                    .catch(handleError)
                : undefined;

            if (item.permission === "admin") {
                const hideItemAdminActions = () => {
                    itemAdminActions.setAttribute("hidden", "");

                    document.removeEventListener("click", hideItemAdminActions);
                }
                itemPhoto.onclick = _ => {
                    itemAdminActions.removeAttribute("hidden")

                    setTimeout(() => document.addEventListener("click", hideItemAdminActions));
                };

                itemBanButton.onclick = _ => banUser(item.user.name, prefix, item._id);

                itemKickButton.onclick = _ => kickUser(prefix, item._id);

                stickyButton.removeAttribute("hidden");

                stickyButton.innerHTML = item.sticky ? "remove sticky" : "mark as sticky";

                stickyButton.onclick = _ => confirm("Are you sure you want to " + (item.sticky 
                    ? "mark this " + itemSingular + " as sticky" 
                    : "remove sticky from this " + itemSingular)) 
                    ? setSticky(item.sticky)
                        .then(_ => history.go())
                        .catch(handleError)
                    : undefined
            }
        }

        const content = Object.keys(item.content)
            .reduce((content, k) => content + `<div class="${k}">${item.content[k]}</div>`, "");

        itemContent.innerHTML = content;
    }
    const listReplys = (page:number) => {
        replySpinnerTimeoutId = setTimeout(() => replysSpinner.removeAttribute("hidden"), 100);
        replysEl.innerHTML = "";

        return replyList.getItems(page)
            .then((value) => {
                clearTimeout(replySpinnerTimeoutId);
                replysSpinner.setAttribute("hidden", "");

                const { items, numberOfPages } = value;

                items.map(reply => createReplyElement(reply))
                    .forEach(replyEl => replysEl.appendChild(replyEl));

                return value;
            });
    }

    getItem().then(item => {
        if (item.permission === "none") {
            wasUnset = true;
        }

        return item;
    }).then(showItem).catch(handleError);

    userService.user.subscribe(user => {
        userId = user ? user.id : null;
        replyList.setUserId(userId);

        if (userId && wasUnset) {
            localStorage.removeItem(`/item${prefix}/${id}`);
        }
        getItem().then(showItem).catch(handleError);

        listReplys(page)
            .then(({ items, numberOfPages }) => {
                if (numberOfPages === 1 || numberOfPages === 0) {
                    pagination.setAttribute("hidden", "");
                }
                else {
                    initPagination(page, numberOfPages, listReplys, handleError);
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