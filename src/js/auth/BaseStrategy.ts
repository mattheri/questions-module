import {
  getAuth,
  Auth as IAuth,
  getRedirectResult,
  signOut,
  AuthError,
  fetchSignInMethodsForEmail,
  FacebookAuthProvider,
  GoogleAuthProvider,
  signInWithRedirect,
  signInWithPopup,
} from "firebase/auth";
import { ERROR_CODES } from "./Auth.constants";
import { App, AuthPubSub, AuthUser } from "./Auth.interfaces";

export class BaseStrategy {
  public _pubSub: AuthPubSub;
  public app: App;
  public auth: IAuth;

  constructor(app: App, pubsub: AuthPubSub) {
    this._pubSub = pubsub;
    this.app = app;
    this.auth = getAuth(this.app);
  }

  public onSignIn(user: AuthUser | null) {
    this._pubSub.publish("user:sign-in", user);
  }

  public async signOut() {
    signOut(this.auth);
  }

  public async onAccountExistsWithDifferentCredential(error: AuthError) {
    if (error.code === ERROR_CODES.accountExistsWithDifferentCredential) {
      const pendingCredential = error.customData.email;

      if (!pendingCredential) return console.error(error.message);

      const authenticationMethods = await fetchSignInMethodsForEmail(
        this.auth,
        pendingCredential
      );

      if (!authenticationMethods.length) return console.error(error.message);

      this._pubSub.publish(
        "user:exists-with-different-account",
        authenticationMethods[0]
      );
    }
  }

  public async signInWithRedirect(
    provider: FacebookAuthProvider | GoogleAuthProvider
  ) {
    await signInWithRedirect(this.auth, provider);
  }

  public async signInWithPopup(
    provider: FacebookAuthProvider | GoogleAuthProvider
  ) {
    const credentials = await signInWithPopup(this.auth, provider);

    this._pubSub.publish("user:sign-in", credentials.user);
  }

  public get user() {
    return this.auth.currentUser;
  }
}
