export class LocationRequest {
  private _location: GeolocationCoordinates | null;

  constructor() {
    this._location = null;
    this.init();
  }

  get location() {
    return this._location;
  }

  set location(location: GeolocationCoordinates | null) {
    this._location = location;
  }

  private get geoLocation() {
    return window.navigator.geolocation;
  }

  private async init() {
    this.location = await this.getLocation();
  }

  private async getLocation() {
    const locationRequest: Promise<GeolocationCoordinates | null> = new Promise(
      (resolve, reject) => {
        const onLocationRequestErrorCallback = (
          error: GeolocationPositionError
        ) => {
          reject(error);
        };
        const onLocationRequestSuccessCallback = (
          position: GeolocationPosition
        ) => {
          resolve(position.coords);
        };
        this.geoLocation.getCurrentPosition(
          onLocationRequestSuccessCallback,
          onLocationRequestErrorCallback
        );
      }
    );

    return locationRequest;
  }
}
