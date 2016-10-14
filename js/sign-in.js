window.addEventListener("load", function () {
    var signInButtonGoogle = document.querySelector(".sign-in__button.google");
    var signInButtonFacebook = document.querySelector(".sign-in__button.facebook");
    var signInButtonTwitter = document.querySelector(".sign-in__button.twitter");
    var signIn = function (provider) {
        clearItemsFromCahce();
        window.userService.signIn(provider).then(function () { return history.back(); });
    };
    signInButtonGoogle.addEventListener("click", function () { return signIn("google"); });
});
//# sourceMappingURL=sign-in.js.map