import { Injectable } from '@angular/core';
import { Diagnostic } from '@ionic-native/diagnostic/ngx';
import { LocationAccuracy } from '@ionic-native/location-accuracy/ngx';
import { AlertController, Platform } from '@ionic/angular';

@Injectable({ providedIn: 'root' })
export class LocationAccuracyService {

  constructor(private alertCtrl: AlertController,
    private diagnostic: Diagnostic,
    private locationAccuracy: LocationAccuracy,
    private platform: Platform) {
    this.requestLocationAccuracy();
  }

  handleSuccess(msg) {
    console.log(msg);
    alert(msg);
    // checkState();
  }

  onError(error) {
    console.error(`The following error occurred: ${error}`);
  }

  handleLocationAuthorizationStatus(status) {
    switch (status) {
      case this.diagnostic.permissionStatus.GRANTED:
        if (this.platform.is(`ios`)) {
          this.onError(`Location services is already switched ON`);
        } else {
          this._makeRequest();
        }
        break;
      case this.diagnostic.permissionStatus.NOT_REQUESTED:
        this.requestLocationAuthorization();
        break;
      case this.diagnostic.permissionStatus.DENIED_ONCE:
        if (this.platform.is(`android`)) {
          this.onError(`User denied permission to use location`);
        } else {
          this._makeRequest();
        }
        break;
      case this.diagnostic.permissionStatus.DENIED_ALWAYS:
        // Android only
        this.onError(`User denied permission to use location`);
        break;
      case this.diagnostic.permissionStatus.GRANTED_WHEN_IN_USE:
        // iOS only
        this.onError(`Location services is already switched ON`);
        break;
    }
  }

  requestLocationAuthorization() {
    this.diagnostic.requestLocationAuthorization().then(
      this.handleLocationAuthorizationStatus,
      this.onError
    );
  }

  requestLocationAccuracy() {
    this.diagnostic.getLocationAuthorizationStatus().then(
      this.handleLocationAuthorizationStatus,
      this.onError
    );
  }

  async goToLocationSettingsConfirm() {
    const confirm = await this.alertCtrl.create({
      header: `Go to Settings?`,
      message: `Failed to automatically set Location Mode to 'High Accuracy'.
        Would you like to switch to the Location Settings page and do this manually?`,
      buttons: [
        {
          text: `Disagree`,
          handler: () => {
            console.log(`Disagree clicked`);
          }
        },
        {
          text: `Agree`,
          handler: () => {
            console.log(`Agree clicked`);
            this.diagnostic.switchToLocationSettings();
          }
        }
      ]
    });
    confirm.present();
  }

  _makeRequest() {
    this.locationAccuracy.canRequest().then(
      canRequest => {
        if (canRequest) {
          this.locationAccuracy.request(this.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY).then(
            () => { this.handleSuccess(`Location accuracy request successful`); },
            (error) => {
              this.onError(`Error requesting location accuracy: ${JSON.stringify(error)}`);
              if (error) {
                // Android only
                this.onError(`error code=${error.code}; error message=${error.message}`);
                if (this.platform.is(`android`) && error.code !== this.locationAccuracy.ERROR_USER_DISAGREED) {
                  this.goToLocationSettingsConfirm();
                }
              }
            }
          );
        } else {
          // On iOS, this will occur if Location Services is currently on OR a request is currently in progress.
          // On Android, this will occur if the app doesn't have authorization to use location.
          this.onError(`Cannot request location accuracy`);
        }
      });
  }

}
