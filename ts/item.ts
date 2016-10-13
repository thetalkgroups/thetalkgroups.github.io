declare const id: string
declare const api: Api

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
        image.src = api.getImageUrl(reply.image)
    }

    if (reply.isYou) {
        deleteBtn.removeAttribute("hidden");

        deleteBtn.onclick = _ => api.replys.delete(reply._id, userId)
            .then(() => location.href = location.href)
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
    const buttons = document.querySelector(".item__header__top__buttons");
    const deleteBtn = document.querySelector(".item__delete") as HTMLButtonElement;

    let page = 1;
    const pageMatch = location.search.match(/page=(\d+)/);

    if (pageMatch) page = parseInt(pageMatch[1], 10) || 1;
    
    window.userService.user.subscribe(user => {
        const userId = user ? user.id : null;

        api.items.getOne(id, userId)
            .then(item => {
                itemPhoto.src = item.user.photo;
                itemName.innerHTML = item.user.name;
                itemDate.innerHTML = moment(item.date).fromNow();
                itemTitle.innerHTML = item.title;

                if (item.isYou) {
                    buttons.removeAttribute("hidden");
                }

                itemContent.innerHTML = "";

                Object.keys(item.content)
                    .forEach(k => itemContent.innerHTML += `<div class="${k}">${item.content[k]}</div>`);
            })
            .catch(error => console.error(error));

        api.replys.get(page, userId)
            .then(replys => 
                replys.map(reply => createReplyElement(reply, userId))
                    .forEach(replyEl => replysEl.appendChild(replyEl)))
            .catch(error => console.error(error));

        deleteBtn.onclick = _ => confirm(`Are you sure you want do delete this ${itemSinglar}?`) ? api.items.delete(id, userId)
            .then(() => location.href = location.href.replace(/\w+\.html.*?$/, ""))
            .catch(error => console.error(error)) : undefined;

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
            event.preventDefault();

            const data = formToJson(reply);

            Object.keys(data).filter(k => k !== "image")
                .forEach(k => data[k] = escapeHtml(data[k]));

            data["user"] = user

            api.replys.add(data, onProgress)
                .then(() => location.href = location.href)
                .catch(error => console.error(error));

            return false;
        };
    })
});