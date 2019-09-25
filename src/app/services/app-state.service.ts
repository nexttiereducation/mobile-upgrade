import { Injectable } from '@angular/core';
import { AppState, Plugins } from '@capacitor/core';

const { App } = Plugins;

@Injectable({ providedIn: 'root' })
export class AppStateService {
  init() {
    App.addListener(
      `appStateChange`,
      (state: AppState) => {
        // state.isActive contains the active state
        console.log(`App state changed. Is active? ${state.isActive}`);
      }
    );

    // Listen for serious plugin errors
    // App.addListener(
    //   `pluginError`,
    //   (info: any) => {
    //     console.error(`There was a serious error with a plugin`, info);
    //   }
    // );

    this.getOpenUrl();

    App.addListener(
      `appUrlOpen`,
      (data: any) => {
        console.log(`App opened with URL: ${data.url}`);
      }
    );

    App.addListener(
      `appRestoredResult`,
      (data: any) => {
        console.log(`Restored state: ${data}`);
      }
    );

  }

  async getOpenUrl() {
    let ret: any = await App.canOpenUrl({ url: 'com.getcapacitor.myapp' });
    console.log(`Can open url: ${ret.value}`);

    ret = await App.openUrl({ url: 'com.getcapacitor.myapp://page?id=ionicframework' });
    console.log(`Open url response: ${ret}`);

    ret = await App.getLaunchUrl();

    if (ret && ret.url) {
      console.log(`App opened with URL: ${ret.url}`);
    }
    console.log(`Launch url: ${ret}`);
  }

}
