import { EventEmitter } from "./event-emitter";
import { userService } from "./globals";
import { User } from "./types/user";

declare const firebase: any;

// auth should always be loaded after app, because it is significantly bigger
const firebaseAuthScript = document.getElementById("firebase-auth");

let providers: { [provider: string]: any }

export class UserService {
    user = new EventEmitter<User>()

    constructor() {
        firebaseAuthScript.onload = () => {
            const config = {
                apiKey: "AIzaSyAjSDRU_Sl8DbTftnDghDsZJsxlAEvQpxE",
                authDomain: "fir-auth-test-fe62c.firebaseapp.com",
                databaseURL: "https://fir-auth-test-fe62c.firebaseio.com"
            };
            providers = {
                "google": new firebase.auth.GoogleAuthProvider(),
                "twitter": new firebase.auth.TwitterAuthProvider(),
                "facebook": new firebase.auth.FacebookAuthProvider()
            };

            firebase.initializeApp(config);

            firebase.auth().onAuthStateChanged(({ displayName, photoURL, email, uid }: { displayName: string, photoURL: string, email: string, uid: string }) =>
                this.user.next({ id: uid, name: displayName, photo: photoURL, email }))
        }
    }

    signIn(provider: string): Promise<void> {
        return firebase.auth().signInWithPopup(providers[provider])
    }

    signOut(): Promise<void> {
        this.user.next(null)

        return firebase.auth().signOut();
    }
}