var config = {
    apiKey: "AIzaSyAjSDRU_Sl8DbTftnDghDsZJsxlAEvQpxE",
    authDomain: "fir-auth-test-fe62c.firebaseapp.com",
    databaseURL: "https://fir-auth-test-fe62c.firebaseio.com"
}
const providers = {
    "google": new firebase.auth.GoogleAuthProvider(),
    "twitter": new firebase.auth.TwitterAuthProvider(),
    "facebook": new firebase.auth.FacebookAuthProvider()
}

firebase.initializeApp(config)

class UserService {
    constructor() {
        this.user = new EventEmitter();

        firebase.auth().onAuthStateChanged(({ displayName, photoURL, email, uid }) =>
            this.user.next({ id: uid, name: displayName, photo: photoURL, email }))
    }

    signIn(provider) {
        return firebase.auth().signInWithPopup(providers[provider])
    }

    signOut() {
        this.user.next(null)

        return firebase.auth().signOut();
    }
}

userService = new UserService()