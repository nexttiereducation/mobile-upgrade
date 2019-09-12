import { Injectable } from '@angular/core';

import { environment as ENV } from './../../environments/environment';


// import { EnvVariables } from './../../environment-variables/environment-variables.token';

@Injectable({ providedIn: 'root' })
export class EnvironmentService {
  private _appId: string;
  private _platform: string;

  get env() {
    return ENV;
  }

  get fullName() {
    return ENV.fullName;
  }

  get isLocal() {
    return ENV.name === `dev`;
  }

  get isProduction() {
    return ENV.name === `prod`;
  }

  get isStaging() {
    return ENV.name === `stg`;
  }

  get name() {
    return ENV.name;
  }

  get platform() {
    return this._platform;
  }

  constructor() {
    this.determinePlatform();
  }

  public determinePlatform() {
    this._appId = `1bf9f377`;
    this._platform = this.isIonicWebView() ? `ionicView` : `web`;
  }

  private isIonicWebView() {
    return window.location.href.indexOf(`com.ionic.viewapp`) > -1 || window.location.href.indexOf(this._appId) > -1;
  }

}
