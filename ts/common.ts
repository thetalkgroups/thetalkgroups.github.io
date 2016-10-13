declare const headerImageHWRatio: number;

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

    signInButton.hidden = false;

    const isParentOf = (target: HTMLElement, selector: string): boolean => {
        if (target.nodeName === "HTML") return false;

        if (target.matches(selector)) return true;

        return isParentOf(target.parentNode as HTMLElement, selector);
    };

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
    const resizeNav = () => {
        const headerHeight = document.body.getBoundingClientRect().right * headerImageHWRatio;
        const headerHiddenHeight = headerHeight - smallHeaderHeight;
        const scrollTop = document.body.scrollTop;

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
        hideUserCard({ target: document.body, preventDefault: () => null as any } as any)

        window.userService.signOut();
    }

    window.userService.user.subscribe(updateUser);

    document.addEventListener("scroll", resizeNav);

    openNavButton.addEventListener("click", openNav);
    closeNavButton.addEventListener("click", closeNav);
    signOutButton.addEventListener("click", signOut);
    userNameOnly.addEventListener("click", showUserCard);
});