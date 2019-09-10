import { Injectable } from '@angular/core';
import { ThemeableBrowser, ThemeableBrowserObject, ThemeableBrowserOptions } from '@ionic-native/themeable-browser';

@Injectable({ providedIn: 'root' })
export class LinkService {
  private nextTierBlue: string = `#3692CCFF`;

  private options: ThemeableBrowserOptions = {
    backButton: {
      align: `right`,
      event: `backPressed`,
      wwwImage: `assets/image/browser/back.png`,
      wwwImageDensity: 2,
      wwwImagePressed: `assets/image/browser/back.png`
    },
    backButtonCanClose: true,
    closeButton: {
      align: `left`,
      event: `closePressed`,
      wwwImage: `assets/image/browser/close.png`,
      wwwImageDensity: 2,
      wwwImagePressed: `assets/image/browser/close.png`
    },
    enableViewportScale: `yes`,
    forwardButton: {
      align: `right`,
      event: `forwardPressed`,
      wwwImage: `assets/image/browser/forward.png`,
      wwwImageDensity: 2,
      wwwImagePressed: `assets/image/browser/forward.png`
    },
    statusbar: {
      color: this.nextTierBlue
    },
    title: {
      color: `#FFFFFFFF`,
      showPageTitle: true
    },
    toolbar: {
      color: this.nextTierBlue,
      height: 44
    }
  };

  constructor(public themeableBrowser: ThemeableBrowser) { }

  public create(url: string) {
    const browser: ThemeableBrowserObject = this.themeableBrowser.create(
      url,
      `_blank`,
      this.options
    );
    return browser;
  }

  public open(url: string) {
    this.themeableBrowser.create(
      url,
      `_blank`,
      this.options
    );
  }
}
