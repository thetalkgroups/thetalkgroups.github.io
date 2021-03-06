import "./user-service"
import { clearItemsFromCahce, userService, isParentOf } from "./globals"
import { User } from "./types/user";

declare const headerImageHWRatio: number;
declare const headerImageSrc: string;

if (!("matches" in HTMLElement.prototype)) {
    HTMLElement.prototype.matches = HTMLElement.prototype["msMatchesSelector"]
}

if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/service-worker.js", { scope: "/" })
        .then((reg) => {
            console.log("service worker registered");

            reg.onupdatefound = () => {
                console.log("new service worker found");
            }
        });
}
else {
    console.warn("service worker is not supported :-(");
}

window.addEventListener("load", () => {
    const navigation = document.querySelector(".navigation");
    const header = document.querySelector(".header") as HTMLElement;
    const breadcrumb = document.querySelector(".breadcrumb") as HTMLElement;
    const wrapper = document.querySelector(".wrapper") as HTMLElement;
    const openNavButton = document.querySelector(".header__top-bar__open-nav-button");
    const closeNavButton = document.querySelector(".navigation__close-nav-button");
    const userNameOnly = document.querySelector(".header__top-bar__user-name") as HTMLElement;
    const signInButton = document.querySelector(".header__top-bar__sign-in-button") as HTMLElement;
    const userCard = document.querySelector(".header__user") as HTMLElement;
    const userName = document.querySelector(".header__user__name") as HTMLElement;
    const userEmail = document.querySelector(".header__user__email") as HTMLElement;
    const userPhoto = document.querySelector(".header__user__photo") as HTMLImageElement;
    const signOutButton = document.querySelector(".header__user__sign-out-button");
    const headerImg = document.querySelector(".header__img");

    const img = document.createElement("img");
    img.onload = () => {
        header.insertBefore(img, headerImg);
        headerImg.setAttribute("hidden", "");   
    }
    img.className = "header__img big";
    img.src = headerImageSrc;  

    signInButton.hidden = false;

    const openNav = () => {
        navigation.classList.add("open");

        setTimeout(() => document.addEventListener("click", shadowClose));
    };

    const shadowClose = ({ target }: Event) => {
        if (isParentOf(target as HTMLElement, ".navigation")) return;

        closeNav();
    }

    const closeNav = () => {
        navigation.classList.remove("open");

        document.removeEventListener("click", shadowClose);
    };

    const smallHeaderHeight = 72;
    const topElement = breadcrumb || wrapper;
    const topElementMargin = 16;
    const resizeHeader = () => {
        const headerHeight = document.body.getBoundingClientRect().right * headerImageHWRatio;
        const headerHiddenHeight = headerHeight - smallHeaderHeight;
        const scrollTop = window.scrollY;

        if (scrollTop > headerHiddenHeight) {
            header.style.top = -headerHiddenHeight + "px";
            topElement.style.marginTop = headerHeight + topElementMargin + "px";
            header.classList.add("small");
        }
        else {
            topElement.removeAttribute("style");
            header.classList.remove("small");
        }
    }

    const updateUser = (user: User) => {
        if (!user) {
            signInButton.hidden = false;
            userNameOnly.hidden = true;
            userCard.classList.add("not-signed-in");
        }
        else {
            signInButton.hidden = true;
            userNameOnly.hidden = false;
            userCard.classList.remove("not-signed-in");

            userNameOnly.innerText = user.name;

            userName.innerText = user.name;
            userEmail.innerText = user.email;
            userPhoto.src = user.photo;
        }
    }

    let hidden = true;
    const showUserCard = () => {
        userCard.hidden = false;

        if (hidden) {
            setTimeout(() => document.addEventListener("click", hideUserCard));
            hidden = false;
        }
    }

    const hideUserCard = (event: Event) => {
        event.preventDefault();

        if (isParentOf(event.target as HTMLElement, ".header__user")) return;

        hidden = true;

        userCard.hidden = true;

        document.removeEventListener("click", hideUserCard);
    }

    const signOut = () => {
        clearItemsFromCahce();

        hideUserCard({ target: document.body, preventDefault: () => null as any } as any)

        userService.signOut();
    }

    userService.user.subscribe(updateUser);

    window.addEventListener("scroll", resizeHeader);

    openNavButton.addEventListener("click", openNav);
    closeNavButton.addEventListener("click", closeNav);
    signOutButton.addEventListener("click", signOut);
    userNameOnly.addEventListener("click", showUserCard);

    // google analytics    
    (function(i:any,s:any,o:any,g:any,r:any,a:any,m:any){
    i['GoogleAnalyticsObject']=r;i[r]=i[r]|| function(){(i[r].q=
    i[r].q||[]).push(arguments)},i[r].l=1*(new Date()as any);a=
    s.createElement(o),m=s.getElementsByTagName(o)[0];a.async=1;
    a.src=g;m.parentNode.insertBefore(a,m)} as any)(window,document,
    'script','https://www.google-analytics.com/analytics.js','ga');
    ga('create','UA-85930130-1','auto');ga('send','pageview');
});

declare const ga: any