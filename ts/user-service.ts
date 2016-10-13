declare const firebase: any;

var config = {
    apiKey: "AIzaSyAjSDRU_Sl8DbTftnDghDsZJsxlAEvQpxE",
    authDomain: "fir-auth-test-fe62c.firebaseapp.com",
    databaseURL: "https://fir-auth-test-fe62c.firebaseio.com"
}
const providers: { [provider: string]: any } = {
    "google": new firebase.auth.GoogleAuthProvider(),
    "twitter": new firebase.auth.TwitterAuthProvider(),
    "facebook": new firebase.auth.FacebookAuthProvider()
}

firebase.initializeApp(config)

class UserService {
    user = new EventEmitter<User>()

    constructor() {
        if (!Object.keys(localStorage).find(k => k.startsWith("firebase"))) {
            this.user.next(null);
        }

        firebase.auth().onAuthStateChanged(({ displayName, photoURL, email, uid }: { displayName: string, photoURL: string, email: string, uid: string }) =>
            this.user.next({ id: uid, name: displayName, photo: photoURL, email }))
    }

    signIn(provider: string): Promise<void> {
        return firebase.auth().signInWithPopup(providers[provider])
    }

    signOut(): Promise<void> {
        this.user.next(null)

        return firebase.auth().signOut();
    }
}

window.userService = new UserService()