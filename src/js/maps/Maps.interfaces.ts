import App from "../app/App";
import { PubSub } from "../pubsub/PubSub";
import { MAP_EVENTS } from "./Maps.constants";

export type App = typeof App;

export type LatitudeLongitude = google.maps.LatLng;

export type PolylineObject = google.maps.Polyline;

export type PolygonObject = google.maps.Polygon;

export type MapPoint = google.maps.Point;

export type Path = google.maps.MVCArray<LatitudeLongitude>;

export type Marker = google.maps.Marker;

export interface OnMapUpdateEvent {
  latitudeLongitude: LatitudeLongitude;
  polyline: PolylineObject | null;
}

export interface OnPolygonMouseEvent {
  vertex?: number;
  edge?: number;
  latLng: LatitudeLongitude;
}

export interface MapEvent {
  latLng: LatitudeLongitude;
}

export type MapPubSub = PubSub<typeof MAP_EVENTS>;

export type MapGeometryChangeCallback = (area?: number) => void;

export type Callback = (...args: any[]) => void;

export type MapObject = google.maps.Map;

export interface SvgMarker {
  path: string;
  fillColor: string;
  fillOpacity: number;
  scale: number;
  strokeWeight: number;
  rotation: number;
  anchor: MapPoint;
}
