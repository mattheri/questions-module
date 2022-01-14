import {
  LatitudeLongitude,
  MapObject,
  MapPubSub,
  Marker,
  OnMapUpdateEvent,
  OnPolygonMouseEvent,
  PolygonObject,
  PolylineObject,
  SvgMarker,
} from "./Maps.interfaces";

export class MapPolygon {
  private map: MapObject;
  private _polylineStrokeColor: string;
  private _polylineOpacity: number;
  private _polylineFillColor: string;
  private _polylineFillOpacity: number;
  private _svgMarker: SvgMarker | null;
  private _markers: Marker[];
  private _outsidePath: LatitudeLongitude[];
  private _insidePath: LatitudeLongitude[];
  private _polygon: PolygonObject | null;
  private _polyline: PolylineObject | null;
  private _markerToBeUpdated: Marker | null = null;
  private pubSub: MapPubSub;

  constructor(map: MapObject, pubSub: MapPubSub) {
    this.map = map;
    this._polylineStrokeColor = "#000000";
    this._polylineOpacity = 1;
    this._polylineFillColor = "#000000";
    this._polylineFillOpacity = 0.5;
    this._svgMarker = null;
    this._markers = [];
    this._outsidePath = [];
    this._insidePath = [];
    this._polyline = null;
    this._polygon = null;
    this._markerToBeUpdated = null;
    this.pubSub = pubSub;
    this.init();
  }

  get polylineStrokeColor() {
    return this._polylineStrokeColor;
  }

  set polylineStrokeColor(value: string) {
    this._polylineStrokeColor = value;
  }

  get polylineOpacity() {
    return this._polylineOpacity;
  }

  set polylineOpacity(value: number) {
    this._polylineOpacity = value;
  }

  get polylineFillColor() {
    return this._polylineFillColor;
  }

  set polylineFillColor(value: string) {
    this._polylineFillColor = value;
  }

  get polylineFillOpacity() {
    return this._polylineFillOpacity;
  }

  set polylineFillOpacity(value: number) {
    this._polylineFillOpacity = value;
  }

  get svgMarker(): SvgMarker | null {
    return this._svgMarker;
  }

  set svgMarker(value: SvgMarker | null) {
    this._svgMarker = value;
  }

  public get polyline(): PolylineObject | null {
    return this._polyline;
  }

  public set polyline(value: PolylineObject | null) {
    this._polyline = value;
  }

  public get polygon(): PolygonObject | null {
    return this._polygon;
  }

  public set polygon(value: PolygonObject | null) {
    this._polygon = value;
  }

  private get outsidePath(): LatitudeLongitude[] {
    return this._outsidePath;
  }

  private set outsidePath(value: LatitudeLongitude[]) {
    this._outsidePath = value;
  }

  private get insidePath(): LatitudeLongitude[] {
    return this._insidePath;
  }

  private set insidePath(value: LatitudeLongitude[]) {
    this._insidePath = value;
  }

  private get markers(): Marker[] {
    return this._markers;
  }

  private set markers(value: Marker[]) {
    this._markers = value;
  }

  private get markerToBeUpdated() {
    return this._markerToBeUpdated;
  }

  private set markerToBeUpdated(value: Marker | null) {
    this._markerToBeUpdated = value;
  }

  private init() {
    this.polyline = new google.maps.Polyline({
      strokeColor: this.polylineStrokeColor,
      strokeOpacity: this.polylineOpacity,
      strokeWeight: 3,
      map: this.map,
    });
  }

  findMarkerToBeUpdated(latLng: google.maps.LatLng) {
    this.markerToBeUpdated =
      this.markers.find((marker) => marker.getPosition()?.equals(latLng)) ||
      null;
    console.log(this.markers);
  }

  private createNewMarker(latLng: google.maps.LatLng) {
    if (!this.svgMarker) {
      return this.markers.push(
        new google.maps.Marker({
          position: latLng,
          map: this.map,
        })
      );
    }

    return this.markers.push(
      new google.maps.Marker({
        position: latLng,
        map: this.map,
        icon: this.svgMarker,
      })
    );
  }

  updateMarker(latitudeLongitude: LatitudeLongitude) {
    this.markerToBeUpdated?.setPosition(latitudeLongitude);
    this.markerToBeUpdated = null;
  }

  private removeMarkers() {
    for (let i = 0; i < this.markers.length; i++) {
      this.markers[i]?.setMap(null);
    }

    this.markers = [];
  }

  private removePolygon() {
    if (this.polygon) {
      this.polygon.setMap(null);
      this.polygon = null;
    }
  }

  private removePolyline() {
    if (this.polyline) {
      this.polyline.setMap(null);
      this.polyline = null;
    }
  }

  private tiltMapToZero() {
    this.map.setTilt(0);
  }

  private createAutoCompletePolygonOnMap(): PolygonObject | null {
    if (this.outsidePath.length < 3) return null;

    const firstPoint = this.outsidePath[0]!;
    const lastPoint = this.outsidePath[this.outsidePath.length - 1]!;
    const threshold = 0.0001;

    if (
      firstPoint.equals(lastPoint) ||
      (Math.abs(firstPoint.lat() - lastPoint.lat()) < threshold &&
        Math.abs(firstPoint.lng() - lastPoint.lng()) < threshold)
    ) {
      this.tiltMapToZero();
      return new google.maps.Polygon({
        paths: [this.outsidePath, this.insidePath.reverse()],
        strokeColor: this.polylineStrokeColor,
        strokeOpacity: this.polylineOpacity,
        strokeWeight: 3,
        fillColor: this.polylineFillColor,
        fillOpacity: this.polylineFillOpacity,
        editable: true,
        map: this.map,
      });
    }

    return null;
  }

  private area(polygon: google.maps.Polygon) {
    return google.maps.geometry.spherical.computeArea(polygon.getPath());
  }

  private getInsidePolygonPath() {
    return this.polygon!.getPaths()
      .getArray()[1]
      ?.getArray()
      .map((p) => new google.maps.LatLng(p.lat(), p.lng()))
      .reverse();
  }

  private createNewPolygonToGetArea() {
    return new google.maps.Polygon({
      paths: this.getInsidePolygonPath(),
      strokeColor: this.polylineStrokeColor,
      strokeOpacity: 0,
      strokeWeight: 3,
      visible: false,
      map: this.map,
    });
  }

  private getAndPublishPolygonArea() {
    let area = this.area(this.polygon!);
    if (this.insidePath.length > 3) {
      area = area - this.area(this.createNewPolygonToGetArea());
    }
    this.pubSub.publish("user-interaction:map-geometry-change", area);
  }

  private createInnerPolygon(
    event: OnPolygonMouseEvent,
    listener: google.maps.MapsEventListener
  ) {
    console.log(event);
    this.findMarkerToBeUpdated(event.latLng);
    if (!event.vertex || !event.edge) {
      this.insidePath.push(event.latLng);

      this.createNewMarker(event.latLng);

      if (this.insidePath.length > 3) {
        this.polygon!.setPaths([this.outsidePath, this.insidePath.reverse()]);
        this.getAndPublishPolygonArea();
        google.maps.event.removeListener(listener);
        this.removeMarkers();
      }
    }
  }

  private onPolygonResize() {
    const onMouseDown = google.maps.event.addListener(
      this.polygon!,
      "mousedown",
      (event: OnPolygonMouseEvent) => {
        this.updateMarker(event.latLng);
        this.createInnerPolygon(event, onMouseDown);
      }
    );

    google.maps.event.addListener(
      this.polygon!,
      "mouseup",
      (event: OnPolygonMouseEvent) => {
        console.log(this.markers);
        this.updateMarker(event.latLng);
        this.getAndPublishPolygonArea();
      }
    );
  }

  public updatePolyline({ latitudeLongitude, polyline }: OnMapUpdateEvent) {
    if (!polyline || !latitudeLongitude) return;
    if (!this.polygon) {
      const path = polyline.getPath();
      const length = path.push(latitudeLongitude);

      if (length === 1) this.createNewMarker(latitudeLongitude);
      this.outsidePath.push(latitudeLongitude);
      this.polygon = this.createAutoCompletePolygonOnMap();
    }

    if (this.polygon) {
      polyline.setMap(null);
      this.getAndPublishPolygonArea();
      this.onPolygonResize();
    }
  }

  public reset() {
    this.outsidePath = [];
    this.insidePath = [];
    this.removePolygon();
    this.removePolyline();
    this.removeMarkers();
    this.init();
  }
}
