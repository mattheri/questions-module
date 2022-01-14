import { initializeApp, getApp, getApps } from "firebase/app";
import {
  collection,
  getFirestore,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import {
  CONFIG,
  CONFIG_COLLECTION,
  CONFIG_FIELD_PATH,
  CONFIG_FIELD_TYPE,
} from "./App.constants";

/**
 * App is a singleton that is used to access the Firebase App's configuration and services.
 * It also provides the locales to all other services using the Firebase services.
 */
class App {
  static instance: App;
  private _locale: string;
  private constructor() {
    this._locale = "en";
  }

  static getInstance() {
    if (!App.instance) {
      App.instance = new App();
    }
    return App.instance;
  }

  async getGoogleApiKey(): Promise<string | null> {
    const firestore = getFirestore(this.firebaseApp);
    const collectionReference = collection(firestore, CONFIG_COLLECTION);
    const q = query(
      collectionReference,
      where(CONFIG_FIELD_PATH, "==", CONFIG_FIELD_TYPE)
    );
    const docs = (await getDocs(q)).docs.map((doc) => doc.data());

    return docs.find((doc) => doc.type === CONFIG_FIELD_TYPE)?.value || null;
  }

  get firebaseApp() {
    const app = getApps.length ? getApp() : initializeApp(CONFIG);
    getAnalytics(app);

    return app;
  }

  /**
   * Get the locale of the app. This is used to set the locale of the Firebase services.
   */
  get locale() {
    return this._locale;
  }

  /**
   * Set the locale of the app. This is used to set the locale of the Firebase services.
   * @param locale The locale to set.
   * @example
   * App.locale = "en"; // Set the locale to English
   * App.locale = "fr"; // Set the locale to French
   */
  set locale(value: string) {
    this._locale = value;
  }
}

export default App.getInstance();
