import {
  FacebookAuthProvider,
  AuthError,
  getRedirectResult,
} from "firebase/auth";
import { AuthPubSub, App, Strategy } from "./Auth.interfaces";
import { BaseStrategy } from "./BaseStrategy";

export class FacebookStrategy extends BaseStrategy implements Strategy {
  private provider: FacebookAuthProvider;
  private _mobileBreakpoint = 768;

  constructor(app: App, pubSub: AuthPubSub, locale: string) {
    super(app, pubSub);
    this.provider = new FacebookAuthProvider();
    this.setLocale(locale);
    this._pubSub.subscribe(
      "strategy:initialize",
      this.listenToRedirect.bind(this)
    );
  }

  /**
   * TODO: Investigate why it doesn't work when implemented on the BaseStrategy class with multiple Providers.
   * This method needs to be initialized on the Strategy class. It is used to listen to the redirect result.
   * It cannot be initialized on the BaseStratey class.
   */
  private async listenToRedirect() {
    const result = await getRedirectResult(this.auth);

    if (result) {
      this.onSignIn(result.user);
    }
  }

  /**
   * *Optional* Automatically sets the locale to en. Can be used to set the locale to a different language.
   */
  public setLocale(locale: string = "en") {
    this.auth.languageCode = locale;
  }

  /**
   * Call this to sign in the user with Facebook. If the user is already signed in, this will retrieve the currently signed-in user.
   */
  public async signIn() {
    try {
      if (this.isMobile) await this.signInWithRedirect(this.provider);
      else await this.signInWithPopup(this.provider);
    } catch (e) {
      const error = e as AuthError;
      this.onAccountExistsWithDifferentCredential(error);
    }
  }

  public get mobileBreakpoint() {
    return this._mobileBreakpoint;
  }

  /**
   * *Optional* Sets the mobile breakpoint. This is used to determine if the user is on a mobile device. It is set at 768px by default.
   */
  public set mobileBreakpoint(value: number) {
    this._mobileBreakpoint = value;
  }

  private get isMobile() {
    return window.matchMedia(`(max-width: ${this._mobileBreakpoint}px)`)
      .matches;
  }
}
