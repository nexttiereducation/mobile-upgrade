import { AfterViewInit, Component } from '@angular/core';
import { CallNumber } from '@ionic-native/call-number/ngx';
import { Device } from '@ionic-native/device/ngx';
import { EmailComposer } from '@ionic-native/email-composer/ngx';
import { Mixpanel } from '@ionic-native/mixpanel/ngx';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Platform } from '@ionic/angular';
import { Subject } from 'rxjs';

import { mixpanelConfig } from './app.config';
import { ConnectionService } from '@nte/services/connection.service';
import { DeepLinksService } from '@nte/services/deep-links.service';
import { EnvironmentService } from '@nte/services/environment.service';
import { LinkService } from '@nte/services/link.service';
import { MessageService } from '@nte/services/message.service';
import { NotificationService } from '@nte/services/notification.service';
import { StakeholderService } from '@nte/services/stakeholder.service';

@Component({
  selector: `app-root`,
  templateUrl: `app.component.html`
})
export class NteAppComponent implements AfterViewInit {
  public rootPage;
  public showTabs: boolean;

  private appEl;
  private bodyEl;
  private ngUnsubscribe: Subject<any> = new Subject();

  get appElHeight() {
    if (this.appEl) {
      return this.appEl.clientHeight;
    }
  }

  get bodyElHeight() {
    if (this.bodyEl) {
      return this.bodyEl.clientHeight;
    }
  }

  get deviceModel() {
    if (this.device && this.device.model) {
      return this.device.model.replace(`,`, `-`);
    } else {
      return ``;
    }
  }

  get user() {
    return this.stakeholderService.stakeholder || null;
  }

  constructor(
    public device: Device,
    private callNumber: CallNumber,
    private connectionService: ConnectionService,
    private deepLinks: DeepLinksService,
    private emailComposer: EmailComposer,
    private environmentService: EnvironmentService,
    private linkService: LinkService,
    private messageService: MessageService,
    private mixpanel: Mixpanel,
    private notificationService: NotificationService,
    private platform: Platform,
    private splashScreen: SplashScreen,
    private stakeholderService: StakeholderService,
    private statusBar: StatusBar) {
    this.platform
      .ready()
      .then(() => {
        console.log(`Platform ready`);
        if (this.splashScreen) {
          this.splashScreen.hide();
        }
        this.setupAppListeners();
        this.setupComponents();
        this.setupKeyboardListeners();
        this.setupLinkSub();
        this.setupPush();
        this.setupUserSub();
      })
      .catch(err => console.error(err));
  }

  ngAfterViewInit() {
    // setTimeout(() => {
    //   this.app.getActiveNavs()[0].setRoot(LoginPage);
    // }, 2000);
    this.deepLinks.init();
    const externalLinks = document.getElementsByClassName(`external-link`);
    if (externalLinks && externalLinks.length > 0) {
      Array.from(externalLinks).forEach(externalLink => {
        externalLink.addEventListener(
          `click`,
          e => { this.openExternalLink(e); }
        );
      });
    }
  }

  private composeEmail(addr: string) {
    if (this.emailComposer) {
      this.emailComposer.isAvailable().then(() => {
        this.emailComposer.open({
          isHtml: true,
          to: addr
        });
      });
    }
  }

  private destroySubs() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  private initForUser() {
    // this.nav.setRoot(TabsPage);
    this.connectionService.initialize();
    this.messageService.init();
    this.notificationService.init();
  }

  private openExternalLink(ev) {
    const e = ev || window.event;
    const element = e.currentTarget || e.target || e.srcElement;
    if (element.tagName === `A`) {
      if (element.classList.contains(`external-link-url`)) {
        ev.preventDefault();
        this.linkService.open(element.href);
      } else if (this.platform.is(`android`)) {
        if (element.classList.contains(`external-link-phone`)) {
          ev.preventDefault();
          const phone = element.href.replace(`tel:`, ``);
          if (this.callNumber) {
            this.callNumber
              .callNumber(phone, true)
              .then()
              .catch(() => console.error(`Error launching dialer`));
          }
        } else if (element.classList.contains(`external-link-email`)) {
          ev.preventDefault();
          const emailAddr = element.href.replace(`mailto:`, ``);
          this.composeEmail(emailAddr);
        }
      }
    }
  }

  private setup() {
    this.setupComponents();
    this.setupLinkSub();
    this.setupUserSub();
  }

  private setupAppListeners() {
    if (this.mixpanel) {
      if (this.environmentService.isProduction) {
        this.mixpanel.init(mixpanelConfig.prod);
      } else {
        this.mixpanel.init(mixpanelConfig.stg);
      }
      document.addEventListener(`resume`, () => {
        this.mixpanel.timeEvent(`$app_open`);
        this.setup();
      });
      document.addEventListener(`pause`, () => {
        this.mixpanel.timeEvent(`app_closed`);
        this.destroySubs();
      });
      document.addEventListener(`deviceready`, () => {
        this.setup();
      });
    }
  }

  private setupComponents() {
    if (this.platform && this.statusBar) {
      if (this.platform.is(`android`)) {
        this.statusBar.overlaysWebView(true);
        this.statusBar.backgroundColorByHexString(`#3693cc`);
      } else {
        this.statusBar.styleDefault();
      }
    }
  }

  private setupKeyboardListeners() {
    if (this.platform && this.platform.is(`android`)) {
      (this.appEl = document.getElementsByTagName(`ION-APP`)[0] as HTMLElement),
        (this.bodyEl = document.getElementsByTagName(`body`)[0] as HTMLElement),
        window.addEventListener(`keyboardWillShow`, e => {
          e.preventDefault();
          this.appEl.style.height = this.bodyElHeight - (e as any).keyboardHeight + `px`;
        });
      window.addEventListener(`keyboardWillHide`, e => {
        e.preventDefault();
        this.appEl.style.height = `100%`;
      });
    }
  }

  private setupLinkSub() {
    // this.app.viewDidLoad
    //   .takeUntil(this.ngUnsubscribe)
    //   .subscribe(() => {
    //     const externalLinks = document.getElementsByClassName(`external-link`);
    //     for (let i = 0; i < externalLinks.length; i++) {
    //       const externalLink = externalLinks[i];
    //       externalLink.addEventListener(
    //         `click`,
    //         e => { this.openExternalLink(e); }
    //       );
    //     }
    //   });
  }

  setupPush() {
    // const options: PushOptions = {
    //   android: {
    //     // Add the sender ID for Android.
    //     senderID: `74097461173`
    //   },
    //   ios: {
    //     alert: `true`,
    //     badge: `true`,
    //     sound: `false`
    //   }
    // };

    // const pushObject: PushObject = this.push.init(options);

    // pushObject.on(`notification`)
    //   .subscribe((notification: any) => {
    //     console.log(`[PUSH] Received a notification`, notification);
    //   });
    // pushObject.on(`registration`)
    //   .subscribe((registration: any) => {
    //     console.log(`[PUSH] Device registered`, registration);
    //   });
    // pushObject.on(`error`)
    //   .subscribe(error => {
    //     console.error(`[PUSH] Error with Push plugin `, error);
    //   });
  }

  private setupUserSub() {
    if (this.stakeholderService.loggedIn) {
      this.initForUser();
    } else {
      this.stakeholderService.loginSuccess
        // .pipe(takeUntil(this.ngUnsubscribe)
        .subscribe((isLoggedIn: boolean) => {
          if (isLoggedIn) {
            this.initForUser();
          }
        });
    }
  }
}
