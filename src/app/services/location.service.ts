import { Injectable } from '@angular/core';
import { Diagnostic } from '@ionic-native/diagnostic';
import { Geolocation } from '@ionic-native/geolocation';
import { AlertController } from '@ionic/angular';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

import 'rxjs/operators/map';

import { PERMISSION } from '@nte/constants/location.constants';
import { ApiService } from '@nte/services/api.service';

@Injectable({ providedIn: 'root' })
export class LocationService {
  public coords: string;
  public distance: number;
  public geoAuthorized: boolean;
  public latitude: any;
  public longitude: any;
  public mapsApiBaseUrl = `https://maps.googleapis.com/maps/api/geocode/json?`;
  public method = `my`;
  public queryString: string;
  public zipOrAddress: string;

  private _isAuthorized = new Subject<boolean>();
  private _isAvailable = new Subject<boolean>();
  private _isEnabled = new Subject<boolean>();
  private _isRetrieved = new Subject<boolean>();
  private _position = new Subject<any>();
  private _query = new Subject<any>();

  get isAuthorized() {
    return this._isAuthorized.asObservable();
  }

  get isAvailable() {
    return this._isAvailable.asObservable();
  }

  get isEnabled() {
    return this._isEnabled.asObservable();
  }

  get isRetrieved(): Observable<boolean> {
    return this._isRetrieved.asObservable();
  }

  get position(): Observable<any> {
    return this._position.asObservable();
  }

  get query(): Observable<any> {
    return this._query.asObservable();
  }

  constructor(
    private alertCtrl: AlertController,
    private apiService: ApiService,
    private diagnostic: Diagnostic,
    private geolocation: Geolocation
  ) { }

  public buildQueryString() {
    if (this.distance && this.method) {
      if (this.method === `my`) {
        if (this.geoAuthorized) {
          if (this.position) {
            const posSub = this.position.subscribe(pos => {
              this.showPosition(pos);
              posSub.unsubscribe();
            });
          } else {
            this.getCurrentPosition();
          }
        } else {
          this.checkIfLocationAuthorized();
          // this._isAuthorized.next(false);
          console.error(`Geolocation is not supported by this browser.`);
        }
      } else if (this.method === `other`) {
        const otherSub = this.getCoords(this.zipOrAddress).subscribe(
          (response: any) => {
            const coords = response.results[0].geometry;
            const position = {
              coords: {
                latitude: coords.location.lat,
                longitude: coords.location.lng
              }
            };
            this._position.next(position);
            this.showPosition(position);
          },
          err => {
            console.error(err);
          },
          () => {
            otherSub.unsubscribe();
          }
        );
      }
    } else {
      this.updateQuery();
    }
  }

  public checkIfLocationAuthorized() {
    // Checks if the NextTier app is authorized to use this device's location.
    //   Note for Android: this is intended for Android 6 + / API 23 +.
    return this.diagnostic
      .isLocationAuthorized()
      .then(isAuthorized => {
        if (isAuthorized) {
          this._isAuthorized.next(true);
          this.geoAuthorized = true;
          return this.getCurrentPosition();
        } else {
          return this.getLocationAuthStatus();
        }
      })
      .catch(e => {
        console.error(e);
        if (e === `cordova_not_available`) {
          return this.getCurrentPosition(true);
        }
        return;
      });
  }

  public checkIfLocationAvailable() {
    // Checks if the NextTier app is able to access this device's location.
    return this.diagnostic
      .isLocationAvailable()
      .then(isAvailable => {
        this._isAvailable.next(isAvailable);
        if (isAvailable) {
          return this.checkIfLocationAuthorized();
        } else {
          return this.checkIfLocationEnabled();
        }
      })
      .catch(error => {
        console.error(`Location is: ${error}`);
        return;
      });
  }

  public checkIfLocationEnabled() {
    // Returns true if the device setting for location is on.
    //   Android: Location Mode
    //   iOS: Location Services
    return this.diagnostic
      .isLocationEnabled()
      .then(isEnabled => {
        this._isEnabled.next(isEnabled);
        if (isEnabled) {
          return this.checkIfLocationAuthorized();
        } else {
          return;
        }
      })
      .catch(e => {
        console.error(e);
        return;
      });
  }

  public clearAll() {
    this.coords = undefined;
    this.distance = undefined;
    this.method = undefined;
    this.zipOrAddress = undefined;
    this.updateQuery();
  }

  /* PRIVATE METHODS */

  public confirmGoToSettings() {
    const alert = this.alertCtrl.create({
      buttons: [
        {
          handler: () => {
            /* handler */
          },
          role: `cancel`,
          text: `No, thanks`
        },
        {
          handler: () => {
            // Displays the device location settings so user can enable location services/change location mode.
            this.diagnostic.switchToLocationSettings();
          },
          text: `Sure!`
        }
      ],
      message:
        `Would you like to switch to the Location Settings page and do this manually?`,
      title: `Failed to automatically set Location Mode to 'High Accuracy'`
    });
    alert.present();
  }

  public getCoords(address) {
    return this.apiService
      .getNoHeaders(`${this.mapsApiBaseUrl}address=${address}`, true);
  }

  public getCurrentPosition(cordovaUnavailable?: boolean) {
    const opts = {
      enableHighAccuracy: false,
      maximumAge: 0,
      timeout: 10 * 1000
    };
    if (cordovaUnavailable) {
      navigator.geolocation.getCurrentPosition(
        position => {
          this._isRetrieved.next(true);
          this._position.next(position);
          this.latitude = position.coords.latitude;
          this.longitude = position.coords.longitude;
          this.showPosition(position);
          return position;
        },
        err => {
          console.error(`Error getting location`, err);
          return;
        },
        opts
      );
    } else {
      return this.geolocation
        .getCurrentPosition(opts)
        .then(position => {
          this._isRetrieved.next(true);
          this._position.next(position);
          this.latitude = position.coords.latitude;
          this.longitude = position.coords.longitude;
          this.showPosition(position);
          return position;
        })
        .catch(error => {
          // error.code can be:
          //   0: unknown error
          //   1: permission denied
          //   2: position unavailable (error response from location service)
          //   3: timed out
          console.error(`Error getting location`, error);
          return;
        });
    }
  }

  public getLocationAuthStatus() {
    // Returns the location auth status for the NextTier app on this device.
    return this.diagnostic
      .getLocationAuthorizationStatus()
      .then(status => {
        switch (this.getPermissionForStatus(status)) {
          case PERMISSION.denied:
            return this._isAuthorized.next(false);
          case PERMISSION.granted:
            return this._isAuthorized.next(true);
          case PERMISSION.request:
          default:
            return this.requestLocationAuth();
        }
      })
      .catch(e => {
        console.error(e);
        return;
      });
  }

  public getPermissionForStatus(status) {
    const permStatus = this.diagnostic.permissionStatus;
    switch (status) {
      case permStatus.GRANTED:
      case permStatus.GRANTED_WHEN_IN_USE:
        return PERMISSION.granted;
      case permStatus.NOT_REQUESTED:
        return PERMISSION.request;
      case permStatus.DENIED:
      case permStatus.DENIED_ALWAYS:
      case permStatus.RESTRICTED:
        return PERMISSION.denied;
    }
  }

  public getZipcode(coords) {
    return this.apiService
      .getNoHeaders(`${this.mapsApiBaseUrl}latlng=${coords}&address_details=1`, true);
  }

  public requestLocationAuth() {
    // Asks for, then returns the location auth status chosen for the NextTier app on this device.
    //   Note for Android: this is intended for Android 6 / API 23 and above.
    return this.diagnostic
      .requestLocationAuthorization()
      .then(status => {
        const perm = this.getPermissionForStatus(status);
        if (perm === PERMISSION.granted) {
          this._isAuthorized.next(true);
          this.geoAuthorized = true;
          return this.getCurrentPosition();
        } else if (perm === PERMISSION.denied) {
          this._isAuthorized.next(false);
          this.geoAuthorized = false;
          return;
        } else {
          return this.requestLocationAuth();
        }
      })
      .catch(e => {
        console.error(e);
        return;
      });
  }

  public showPosition(position: any) {
    const coords = position.coords;
    this.coords = `${coords.latitude.toFixed(2)}, ${coords.longitude.toFixed(2)}`;
    this.updateQuery();
  }

  public updateQuery() {
    this._query.next({
      distanceQuery: {
        displayName: `Distance`,
        name: `distance`,
        values: this.distance ? [{ id: this.distance }] : []
      },
      locationQuery: {
        displayName: `Location`,
        name: `location`,
        values: this.coords ? [{ id: this.coords }] : []
      }
    });
  }
}
