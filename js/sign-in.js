window.addEventListener("load", function () {
    "use strict";
    var signInButtonGoogle = document.querySelector(".sign-in__button.google");
    var signInButtonFacebook = document.querySelector(".sign-in__button.facebook");
    var signInButtonTwitter = document.querySelector(".sign-in__button.twitter");
    var signIn = function (provider) {
        return window.userService.signIn(provider).then(function () { return location.href = "/"; });
    };
    signInButtonGoogle.addEventListener("click", function () { return signIn("google"); });
    signInButtonFacebook.addEventListener("click", function () { return signIn("facebook"); });
    signInButtonTwitter.addEventListener("click", function () { return signIn("twitter"); });
});
//# sourceMappingURL=sign-in.js.map