import { AfterViewInit, Component } from '@angular/core';
import { CallNumber } from '@ionic-native/call-number';
import { Device } from '@ionic-native/device';
import { EmailComposer } from '@ionic-native/email-composer';
import { Mixpanel } from '@ionic-native/mixpanel';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { App, Platform } from '@ionic/angular';
import { Subject } from 'rxjs';

import { mixpanelConfig } from './app.config';
import { LoginPage } from '@nte/pages/login/login';
import { MessagingPage } from '@nte/pages/messaging/messaging';
import { NotificationsPage } from '@nte/pages/notifications/notifications';
import { TabsPage } from '@nte/pages/tabs/tabs';
import { ConnectionProvider } from '@nte/providers/connection.provider';
import { DeepLinksService } from '@nte/providers/deep-links.provider';
import { EnvironmentProvider } from '@nte/providers/environment.provider';
import { LinkProvider } from '@nte/providers/link.provider';
import { MessageProvider } from '@nte/providers/message.provider';
import { NotificationProvider } from '@nte/providers/notification.provider';
import { StakeholderProvider } from '@nte/providers/stakeholder.provider';

@Component({
  templateUrl: `app.component.html`
})
export class NteAppComponent implements AfterViewInit {
  public messagingPage: any = MessagingPage;
  public notificationsPage: any = NotificationsPage;
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
    return this.stakeholderProvider.stakeholder || null;
  }

  constructor(
    public device: Device,
    private app: App,
    private callNumber: CallNumber,
    private connectionProvider: ConnectionProvider,
    private deepLinks: DeepLinksService,
    private emailComposer: EmailComposer,
    private environmentProvider: EnvironmentProvider,
    private linkProvider: LinkProvider,
    private messageProvider: MessageProvider,
    private mixpanel: Mixpanel,
    private notificationProvider: NotificationProvider,
    private platform: Platform,
    private splashScreen: SplashScreen,
    private stakeholderProvider: StakeholderProvider,
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
    setTimeout(() => {
      this.app.getActiveNavs()[0].setRoot(LoginPage);
    }, 2000);
    this.deepLinks.init();
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
    this.nav.setRoot(TabsPage);
    this.connectionProvider.initialize();
    this.messageProvider.init();
    this.notificationProvider.init();
  }

  private openExternalLink(ev) {
    const e = ev || window.event;
    const element = e.currentTarget || e.target || e.srcElement;
    if (element.tagName === `A`) {
      if (element.classList.contains(`external-link-url`)) {
        ev.preventDefault();
        this.linkProvider.open(element.href);
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
      if (this.environmentProvider.isProduction) {
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
    this.app.viewDidLoad
      .takeUntil(this.ngUnsubscribe)
      .subscribe(() => {
        const externalLinks = document.getElementsByClassName(`external-link`);
        for (let i = 0; i < externalLinks.length; i++) {
          const externalLink = externalLinks[i];
          externalLink.addEventListener(
            `click`,
            e => { this.openExternalLink(e); }
          );
        }
      });
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
    if (this.stakeholderProvider.loggedIn) {
      this.initForUser();
    } else {
      this.stakeholderProvider.loginSuccess
        // .pipe(takeUntil(this.ngUnsubscribe)
        .subscribe((isLoggedIn: boolean) => {
          if (isLoggedIn) {
            this.initForUser();
          }
        });
    }
  }
}
