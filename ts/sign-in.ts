import "./common";
import { clearItemsFromCahce, userService } from "./globals"

window.addEventListener("load", () => {
    const signInButtonGoogle = document.querySelector(".sign-in__button.google");
    const signInButtonFacebook = document.querySelector(".sign-in__button.facebook");
    const signInButtonTwitter = document.querySelector(".sign-in__button.twitter");

    const signIn = (provider: string) => {
        clearItemsFromCahce();
        userService.signIn(provider).then(() => history.back());
    }

    signInButtonGoogle.addEventListener("click", () => signIn("google"));
    signInButtonFacebook.addEventListener("click", () => signIn("facebook"));
    signInButtonTwitter.addEventListener("click", () => signIn("twitter"));
});