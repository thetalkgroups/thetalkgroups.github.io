import "./common"
import { userService } from "./globals"
import { HOST } from "./api-globals"
import { User } from "./types/user"

const removePermission = (userId: string, id: string) =>
    fetch(HOST + "/users/remove/" + id, {
        method: "POST",
        headers: { "Authorization": userId }
    })

let userItemTemplate: HTMLTemplateElement
const createUserItem = (userId: string, handleError: (error: any) => void, buttonText?: string, onClick?: (userId: string, id: string) => Promise<any>) => ({ user, _id}: { user: User, _id: string }) => {
    const el = document.createElement("article")
    el.appendChild(userItemTemplate.content.cloneNode(true))

    const photo = el.querySelector(".user-item__photo") as HTMLImageElement;
    const name = el.querySelector(".user-item__name");
    const email = el.querySelector(".user-item__email");
    const button = el.querySelector(".user-item__button");

    el.className = "user-item";

    photo.src = user.photo;
    name.innerHTML = user.name;
    email.innerHTML = user.email;

    if (buttonText) {
        button.innerHTML = buttonText;
        button.addEventListener("click", _ => onClick(userId, _id).then(() => location.reload()).catch(handleError));
    }
    else {
        button.setAttribute("hidden", "");
    }

    return el;
}
const createKickedUserItem = (userId: string, handleError: (error: any) => void) => ({ _id, user, releaseTime }: { _id: string, user: User, releaseTime: number}) => {
    if (Date.now() >= releaseTime) return;

    const el = createUserItem(userId, handleError, "remove kick", removePermission)({ user, _id });
    const releaseTimeEl = document.createElement("p");

    releaseTimeEl.className = "user-item__release-time";
    releaseTimeEl.innerHTML = "released in: " + moment(releaseTime).fromNow();

    el.appendChild(releaseTimeEl);

    return el;
} 


const getUsers = (userId: string) =>
    fetch(HOST + "/users/list", {
        headers: { "Authorization": userId }
    }).then<{ _id: string, permission: string, user: User, releaseTime: number }[]>(res => {
        if (!res.ok) return res.text().then(text => {throw text});

        return res.json();
    }).then(users => {
        const adminUsers: { _id: string, user: User }[] = [];
        const kickedUsers: { _id: string, releaseTime: number, user: User }[] = [];
        const bannedUsers: { _id: string, user: User }[] = [];

        users.forEach(({ _id, user, permission, releaseTime }) => {
            switch (permission) {
                case "admin":
                    adminUsers.push({ _id, user })
                    return;
                case "kicked":
                    kickedUsers.push({ _id, user, releaseTime });
                    return;
                case "banned":
                    bannedUsers.push({ _id, user });
                    return;
            }
        })

        return {
            adminUsers,
            kickedUsers,
            bannedUsers
        }
    })

window.addEventListener("load", () => {
    const listEl = document.querySelector(".admin-list");
    const adminList = document.querySelector(".admin-list__admins");
    const kickedList = document.querySelector(".admin-list__kicked");
    const bannedList = document.querySelector(".admin-list__banned");
    const errorEl = document.querySelector(".error");
    const errorMessage = document.querySelector(".error__message");
    userItemTemplate = document.getElementById("user-item") as HTMLTemplateElement;

    const showNotAuthorized = () => {
    
    }
    const handleError = (error: any) => {
        console.error(error);

        errorEl.removeAttribute("hidden");
        errorMessage.innerHTML = error.constructor.name.endsWith("Error") ? error.message : error.toString();

        listEl.setAttribute("hidden", "");
    }
    const showUsers = (userId: string) => ({ adminUsers, kickedUsers, bannedUsers }:{adminUsers: { user: User, _id: string }[], kickedUsers: { _id: string, user: User, releaseTime: number }[], bannedUsers: { _id: string, user: User }[]}) => {
        adminUsers.map(createUserItem(userId, handleError))
            .forEach(userItem => adminList.appendChild(userItem));

        kickedUsers.map(createKickedUserItem(userId, handleError))
            .filter(Boolean)
            .forEach(userItem => kickedList.appendChild(userItem));

        bannedUsers.map(createUserItem(userId, handleError, "remove ban", removePermission))
            .forEach(userItem => bannedList.appendChild(userItem));
    }

    userService.user.subscribe(user => {
        if (!user) {
            showNotAuthorized();

            return;
        }

        getUsers(user.id).then(showUsers(user.id)).catch(handleError)
    })
})