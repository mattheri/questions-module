import { FirebaseApp } from "firebase/app";
import App from "../app/App";
import { PubSub } from "../pubsub/PubSub";
import { AUTH_EVENTS, AUTH_METHODS } from "./Auth.constants";
import { FacebookStrategy } from "./FacebookStrategy";
import { GoogleStrategy } from "./GoogleStrategy";

export type AuthPubSub = PubSub<typeof AUTH_EVENTS>;

export interface AuthUser {
  displayName: string | null;
  email: string | null;
  accessToken?: string;
}

export type App = FirebaseApp;

export interface Strategy {
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

export type AuthMethods = keyof typeof AUTH_METHODS;

export type Strategies = GoogleStrategy | FacebookStrategy | null;
