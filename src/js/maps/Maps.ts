import App from "../app/App";
import {
  App as IApp,
  MapGeometryChangeCallback,
  MapPubSub,
  MapEvent,
  MapObject,
  Callback,
} from "./Maps.interfaces";
import { Loader, LoaderOptions } from "google-maps";
import { PubSub } from "../pubsub/PubSub";
import { MAP_EVENTS } from "./Maps.constants";
import { LocationRequest } from "./LocationRequest";
import { MapPolygon } from "./MapPolygon";

class Maps {
  static instance: Maps;
  private app: IApp;
  private _loaded: boolean;
  private _map: MapObject | null;
  private _mapPubSub: MapPubSub;
  private locationRequest: LocationRequest;
  private mapPolygon: typeof MapPolygon;
  private _polygon: MapPolygon | null;

  private constructor(
    app: IApp,
    pubSub: typeof PubSub,
    locationRequest: typeof LocationRequest,
    mapPolygon: typeof MapPolygon
  ) {
    this.app = app;
    this._loaded = false;
    this._map = null;
    this._mapPubSub = new pubSub(MAP_EVENTS);
    this.locationRequest = new locationRequest();
    this.mapPolygon = mapPolygon;
    this._polygon = null;
    this.init();
  }

  static getInstance() {
    if (!Maps.instance) {
      Maps.instance = new Maps(App, PubSub, LocationRequest, MapPolygon);
    }
    return Maps.instance;
  }

  private get key() {
    return this.app.getGoogleApiKey;
  }

  private async init() {
    const key = await this.key();

    if (!key) return;

    const options: LoaderOptions = {
      language: this.app.locale,
      libraries: ["geometry"],
    };

    const loader = new Loader(key, options);

    if (!this.loaded) this.loaded = !!(await loader.load());

    await this.getMap();

    if (!this.map) return;

    this.polygon = new this.mapPolygon(this.map, this._mapPubSub);

    google.maps.event.addListener(this.map, "click", (event: MapEvent) =>
      this.polygon!.updatePolyline.call(this.polygon, {
        latitudeLongitude: event.latLng,
        polyline: this.polygon!.polyline,
      })
    );
  }

  private get loaded() {
    return this._loaded;
  }

  private set loaded(loaded: boolean) {
    this._loaded = loaded;
  }

  public get map() {
    return this._map;
  }

  private set map(mapObject: MapObject | null) {
    this._map = mapObject;
  }

  /**
   * The polygon class is used to draw a polygon on the map on user interaction.
   * It depends on many factors therefore it can be null. Check if the polygon exists before using it.
   */
  public get polygon() {
    return this._polygon;
  }

  private set polygon(polygon: MapPolygon | null) {
    this._polygon = polygon;
  }

  private async getMap() {
    const location = this.locationRequest.location;

    if (!location) return;

    this.map = new google.maps.Map(
      document.getElementById("map") as HTMLElement,
      {
        center: { lat: location.latitude, lng: location.longitude },
        zoom: 18,
        clickableIcons: true,
        mapTypeId: google.maps.MapTypeId.HYBRID,
      }
    );
  }

  /**
   * Pass a callback to be called when the map polygon geometry is updated. The argument is the area of the polygon in square meters.
   * @param callback @aurguments { number }
   */
  public onMapGeometryChange(callback: MapGeometryChangeCallback) {
    this._mapPubSub.subscribe("user-interaction:map-geometry-change", callback);
  }

  /**
   * Removes the polygon and markers from the map.
   */
  public reset() {
    this.polygon?.reset();

    this._mapPubSub.publish("map:reset");
  }

  public onReset(callback: Callback) {
    this._mapPubSub.subscribe("map:reset", callback);
  }
}

export default Maps.getInstance();
