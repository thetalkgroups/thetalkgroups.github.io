declare const id: string
declare const api: Api

const createReplyElement = (item: Reply) => {
    const template = document.importNode((document.getElementById("reply") as HTMLTemplateElement).content, true);
    const el = document.createElement("article");
    el.appendChild(template);

    const photo = el.querySelector(".reply__photo") as HTMLImageElement;
    const name = el.querySelector(".reply__name") as HTMLElement;
    const date = el.querySelector(".reply__date") as HTMLElement;
    const answer = el.querySelector(".reply__answer") as HTMLElement;
    const image = el.querySelector(".reply__image") as HTMLImageElement;

    el.className = "reply";

    photo.src = item.user.photo;
    name.innerText = item.user.name;
    date.innerText = moment(item.date).fromNow();
    answer.innerText = item.answer;

    if (item.image) {
        image.hidden = false;
        image.src = api.getImageUrl(item.image)
    }

    return el;
};

window.addEventListener("load", () => {
    const replysEl = document.querySelector(".replys") as HTMLElement;
    const itemPhoto = document.querySelector(".item__photo") as HTMLImageElement;
    const itemName = document.querySelector(".item__name") as HTMLElement;
    const itemDate = document.querySelector(".item__date") as HTMLElement;
    const itemTitle = document.querySelector(".item__title") as HTMLElement;
    const itemContent = document.querySelector(".item__content") as HTMLElement;
    const loginWarning = document.querySelector(".login-warning") as HTMLElement;
    const reply = document.querySelector(".reply-form") as HTMLFormElement;

    let page = 1;
    const pageMatch = location.search.match(/page=(\d+)/);

    if (pageMatch) page = parseInt(pageMatch[1], 10) || 1;
    
    api.list.getOne(id)
        .then(item => {
            itemPhoto.src = item.user.photo;
            itemName.innerText = item.user.name;
            itemDate.innerText = moment(item.date).fromNow();
            itemTitle.innerText = item.title;
            itemContent.innerText = item.content;
        })
        .catch(error => console.error(error));

    api.replys.get(page)
        .then(replys => 
            replys.map(createReplyElement).forEach(replyEl => replysEl.appendChild(replyEl)))
        .catch(error => console.error(error));

    window.userService.user.subscribe(user => {
        if (!user) {
            loginWarning.hidden = false;
            reply.hidden = true;

            return;
        }

        delete user.id;

        loginWarning.hidden = true;
        reply.hidden = false;

        const onProgress = (progress: number) => {
            console.log(progress);
        }

        reply.onsubmit = event => {
            event.preventDefault();

            const data = formToJson(reply);

            data["user"] = user

            api.add(data, onProgress)
                .then(() => location.href = location.href)
                .catch(error => console.error(error));

            return false;
        };
    })
});