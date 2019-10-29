import { Injectable } from '@angular/core';
import { Plugins } from '@capacitor/core';

const { Browser } = Plugins;

@Injectable({ providedIn: 'root' })
export class LinkService {
  // private nextTierBlue: string = `#3692CCFF`;
  private nextTierBlue: string = `#3692CC`;

  // private options: ThemeableBrowserOptions = {
  //   backButton: {
  //     align: `right`,
  //     event: `backPressed`,
  //     wwwImage: `assets/image/browser/back.png`,
  //     wwwImageDensity: 2,
  //     wwwImagePressed: `assets/image/browser/back.png`
  //   },
  //   backButtonCanClose: true,
  //   closeButton: {
  //     align: `left`,
  //     event: `closePressed`,
  //     wwwImage: `assets/image/browser/close.png`,
  //     wwwImageDensity: 2,
  //     wwwImagePressed: `assets/image/browser/close.png`
  //   },
  //   enableViewportScale: `yes`,
  //   forwardButton: {
  //     align: `right`,
  //     event: `forwardPressed`,
  //     wwwImage: `assets/image/browser/forward.png`,
  //     wwwImageDensity: 2,
  //     wwwImagePressed: `assets/image/browser/forward.png`
  //   },
  //   statusbar: {
  //     color: this.nextTierBlue
  //   },
  //   title: {
  //     color: `#FFFFFFFF`,
  //     showPageTitle: true
  //   },
  //   toolbar: {
  //     color: this.nextTierBlue,
  //     height: 44
  //   }
  // };

  constructor() { }

  public async open(url: string) {
    await Browser.open({
      toolbarColor: this.nextTierBlue,
      url
    });

    // this.themeableBrowser.create(
    //   url,
    //   `_blank`,
    //   this.options
    // );
  }
}
