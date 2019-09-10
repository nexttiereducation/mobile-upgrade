import { Component } from '@angular/core';
import { NativeStorage } from '@ionic-native/native-storage';
import { StatusBar } from '@ionic-native/status-bar';
import { FCMNG, NotificationData } from 'fcm-ng';
import { App, IonicPage, NavController, Platform, ToastController } from 'ionic-angular';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';

import { MixpanelService } from '@nte/services/mixpanel.service';
import { PushNotificationService } from '@nte/services/push-notification.service';
import { RecommendationsService } from '@nte/services/recommendations.service';
import { StakeholderService } from '@nte/services/stakeholder.service';
import { CollegePage } from './../college/college';
import { CollegesPage } from './../colleges/colleges';
import { LoginPage } from './../login/login';
import { MessagesPage } from './../messages/messages';
import { MessagingPage } from './../messaging/messaging';
import { ProfilePage } from './../profile/profile';
import { ScholarshipPage } from './../scholarship/scholarship';
import { ScholarshipsPage } from './../scholarships/scholarships';
import { TaskPage } from './../task/task';
import { TasksPage } from './../tasks/tasks';

@IonicPage({
  name: `tabs-page`
})
@Component({
  templateUrl: `tabs.html`
})
export class TabsPage {
  public colleges = CollegesPage;
  public hasCollegeRecs: boolean = false;
  public hasScholarshipRecs: boolean = false;
  public profile = ProfilePage;
  public scholarships = ScholarshipsPage;
  public tasks = TasksPage;

  private ngUnsubscribe: Subject<any> = new Subject();

  get user() {
    return this.stakeholderService.stakeholder;
  }

  constructor(
    public recsService: RecommendationsService,
    public stakeholderService: StakeholderService,
    private app: App,
    private fcm: FCMNG,
    private mixpanel: MixpanelService,
    private nativeStorage: NativeStorage,
    private navCtrl: NavController,
    private platform: Platform,
    private pnService: PushNotificationService,
    private statusBar: StatusBar,
    private toastCtrl: ToastController) {
    if (this.platform.is(`android`)) {
      this.statusBar.overlaysWebView(true);
      this.statusBar.backgroundColorByHexString(`#3693cc`);
    } else {
      this.statusBar.styleDefault();
    }
  }

  ionViewDidLoad() {
    this.checkAuthentication();
    this.checkCoachAnimation();
    this.setupPushSubs();
    this.setupRecSub();
  }

  ionViewWillUnload() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  private checkAuthentication() {
    if (!this.user || !this.user.loggedIn) {
      this.stakeholderService.logoutSuccess
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(() => {
          this.mixpanel.event(`logout`);
          this.app.getRootNavs()[0].setRoot(LoginPage);
        });
      this.stakeholderService.logout();
    }
  }

  private checkCoachAnimation() {
    if (this.user && this.user.id) {
      this.nativeStorage.getItem(this.user.id.toString()).then(
        storedItems => {
          if (
            !storedItems.hasViewedPage ||
            !storedItems.hasViewedPage.tasksList
          ) {
            this.user.showTaskAnimation = true;
          }
        },
        error => {
          if (error.code === 2) {
            this.user.showTaskAnimation = true;
          }
        }
      );
    }
  }

  private getPages(msg: any): any {
    const data = {
      page: null,
      params: null
    };
    if (msg.id) {
      data.params = { id: msg.id };
    }
    switch (msg.type) {
      case `achievement`:
      case `letter`:
      case `post`:
        break;
      case `college`:
        if (msg.id) {
          data.page = CollegePage;
          break;
        } else {
          data.page = CollegesPage;
          break;
        }
      case `connection`:
        data.page = MessagingPage;
        break;
      case `message`:
        data.page = MessagesPage;
        break;
      case `scholarship`:
        if (msg.id) {
          data.page = ScholarshipPage;
          break;
        } else {
          data.page = ScholarshipsPage;
          break;
        }
      case `task`:
        if (msg.id) {
          data.page = TaskPage;
          if (msg.page) {
            data.params.page = msg.page;
          }
        } else {
          data.page = TasksPage;
          break;
        }
    }
    return data;
  }

  private goto(msg: any) {
    if (msg) {
      console.log(msg);
      const route: any = {
        page: `${msg.type}${msg.id ? `` : `s`}-page`,
        params: msg.id ? { id: +msg.id } : {}
      };
      this.navCtrl.push(route.page, route.params);
      // this._navEvents.next(route);
    }
  }

  private handleNotification(msg: any) {
    if (msg.wasTapped) {
      console.log(`Notification tapped`);
      this.goto(msg);
    } else {
      const toast = this.toastCtrl
        .create({
          duration: 9000,
          message: msg.aps.alert.body,
          position: `top`,
          showCloseButton: true,
          closeButtonText: `View`
        });
      console.log(`Toast created`);
      toast.onDidDismiss((_data, role) => {
        console.log(`Toast dismissed`);
        // _data: any, role: string
        if (role === `close`) {
          const data: any = this.getPages(msg);
          if (data.params) {
            this.navCtrl.push(
              data.page,
              data.params
            );
          } else {
            this.navCtrl.push(data.page);
          }
        }
      });
      toast.present();
    }
  }

  private setupPushSubs() {
    this.fcm.getToken().then(token => {
      console.log(`[FCM] Token retrieved: ${token}`);
      this.pnService.fcmToken = token;
    });
    this.fcm.onTokenRefresh()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(token => {
        console.log(`[FCM] Token refreshed: ${token}`);
        if (token !== this.pnService.fcmToken) {
          this.pnService.fcmToken = token;
        }
      });
    this.fcm.onNotification()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((msg: NotificationData) => {
        console.log(`[FCM] Notification received: ${JSON.stringify(msg)}`);
        this.handleNotification(msg);
      });
  }

  private setupRecSub() {
    if (this.user && !this.user.isParent) {
      setInterval(() => {
        this.recsService.get(this.user.id);
      }, 100000);
    }
  }
}
