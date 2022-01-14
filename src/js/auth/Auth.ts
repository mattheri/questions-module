import { PubSub } from "../pubsub/PubSub";
import App from "../app/App";
import { AUTH_EVENTS, AUTH_METHODS } from "./Auth.constants";
import {
  AuthPubSub,
  AuthUser,
  App as IApp,
  AuthMethods,
  Strategies,
} from "./Auth.interfaces";
import { GoogleStrategy } from "./GoogleStrategy";
import { FacebookStrategy } from "./FacebookStrategy";

/**
 * Auth is a singleton that provides authentication services with Google and Facebook.
 * It is used to sign in and out of the app.
 *
 * To sign in, call the signIn method on the provider you want to use.
 *
 * To sign out, call the signOut method.
 *
 * @example
 * Auth.Google.signIn(); // Sign in with Google
 * Auth.Facebook.signIn(); // Sign in with Facebook
 *
 * @example
 * Auth.signOut(); // Sign the user out of the app
 */
class Auth {
  static instance: Auth;
  private app: IApp;
  private _strategy: Strategies;
  private _google_strategy: GoogleStrategy | null;
  private _facebook_strategy: FacebookStrategy | null;
  private locale: string;
  private pubSub: AuthPubSub;

  private constructor(app: typeof App, pubSub: typeof PubSub) {
    this.app = app.firebaseApp;
    this._strategy = null;
    this._google_strategy = null;
    this._facebook_strategy = null;
    this.locale = app.locale;
    this.pubSub = new pubSub(AUTH_EVENTS);
    this.init();
  }

  static getInstance() {
    if (!Auth.instance) {
      Auth.instance = new Auth(App, PubSub);
    }
    return Auth.instance;
  }

  public get Google() {
    return this.google_strategy;
  }

  public get Facebook() {
    return this.facebook_strategy;
  }

  /**
   * Sign out the user.
   */
  public async signOut() {
    this.pubSub.publish("user:sign-out");
    await this.strategy?.signOut();
  }

  /**
   * Callback to fire when the user is signed in.
   */
  public onSignIn(callback: (user: AuthUser) => void) {
    this.pubSub.subscribe("user:sign-in", callback);
  }

  /**
   * Callback to fire when the user is signed out.
   */
  public onSignOut(callback: () => void) {
    this.pubSub.subscribe("user:sign-out", callback);
  }

  private get strategy(): Strategies {
    return this._strategy;
  }

  private set strategy(value: Strategies) {
    this._strategy = value;
  }

  private get google_strategy(): GoogleStrategy {
    this.strategy = this._google_strategy;

    return this.strategy!;
  }

  private set google_strategy(value: GoogleStrategy | null) {
    this._google_strategy = value;
  }

  private get facebook_strategy(): FacebookStrategy {
    this.strategy = this._facebook_strategy;

    return this.strategy!;
  }

  private set facebook_strategy(value: FacebookStrategy | null) {
    this._facebook_strategy = value;
  }

  private initializeStrategies() {
    this.google_strategy = new GoogleStrategy(
      this.app,
      this.pubSub,
      this.locale
    );
    this.facebook_strategy = new FacebookStrategy(
      this.app,
      this.pubSub,
      this.locale
    );
  }

  private initializeRedirectListener() {
    this.pubSub.publish("strategy:initialize");
  }

  private init() {
    this.initializeStrategies();
    this.initializeRedirectListener();
    this.pubSub.subscribe(
      "user:exists-with-different-account",
      this.signInOnDifferentAccount
    );
  }

  private signInOnDifferentAccount(method: AuthMethods) {
    switch (method) {
      case AUTH_METHODS.google:
        this.google_strategy.signIn();
        break;
      case AUTH_METHODS.facebook:
        this.facebook_strategy.signIn();
        break;
      default:
        console.log("No strategy found for method: " + method);
    }
  }
}

export default Auth.getInstance();
