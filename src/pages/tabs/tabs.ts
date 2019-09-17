import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Plugins, PushNotification, PushNotificationActionPerformed, PushNotificationToken } from '@capacitor/core';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Platform } from '@ionic/angular';
import { partition } from 'lodash';
import { BehaviorSubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { CollegesPage } from '@nte/pages/colleges/colleges';
import { LoginPage } from '@nte/pages/login/login';
import { ProfilePage } from '@nte/pages/profile/profile';
import { ScholarshipsPage } from '@nte/pages/scholarships/scholarships';
import { TasksPage } from '@nte/pages/tasks/tasks';
import { ApiService } from '@nte/services/api.service';
import { MixpanelService } from '@nte/services/mixpanel.service';
import { StakeholderService } from '@nte/services/stakeholder.service';

const { PushNotifications } = Plugins;
@Component({
  templateUrl: `tabs.html`,
  styleUrls: [`tabs.scss`]
})
export class TabsPage implements OnInit, OnDestroy {
  public colleges = CollegesPage;
  public hasCollegeRecs: boolean = false;
  public hasScholarshipRecs: boolean = false;
  public profile = ProfilePage;
  public scholarships = ScholarshipsPage;
  public tasks = TasksPage;

  private _collegeRecs = new BehaviorSubject<any[]>(null);
  private _scholarshipRecs = new BehaviorSubject<any[]>(null);
  private ngUnsubscribe: Subject<any> = new Subject();

  get collegeRecs() {
    return this._collegeRecs.asObservable();
  }

  get scholarshipRecs() {
    return this._scholarshipRecs.asObservable();
  }

  get user() {
    return this.stakeholderService.stakeholder;
  }

  constructor(
    public stakeholderService: StakeholderService,
    private api: ApiService,
    private mixpanel: MixpanelService,
    private nativeStorage: NativeStorage,
    private platform: Platform,
    private router: Router,
    private statusBar: StatusBar) {
    if (this.platform.is(`android`)) {
      this.statusBar.overlaysWebView(true);
      this.statusBar.backgroundColorByHexString(`#3693cc`);
    } else {
      this.statusBar.styleDefault();
    }
  }

  ngOnInit() {
    this.initPushNotifications();
    this.checkAuthentication();
    this.checkCoachAnimation();
    this.setupRecSub();
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  private checkAuthentication() {
    if (!this.user || !this.user.loggedIn) {
      this.stakeholderService.logoutSuccess
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(() => {
          this.mixpanel.event(`logout`);
          this.router.navigate([LoginPage]);
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

  private checkRecommendations() {
    setInterval(() => {
      this.getRecommendations()
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(
          data => {
            const recommendations = data.json();
            if (recommendations.length > 0) {
              const recs = partition(recommendations, `institution`);
              this._collegeRecs.next(recs[0]);
              this._scholarshipRecs.next(recs[1]);
            }
          }
        );
    }, 100000);
  }

  private getRecommendations() {
    return this.api.get(`/student/${this.user.id}/recommendation`);
  }

  private initPushNotifications() {
    console.log('Initializing Push Notifications');

    // Register with Apple / Google to receive push via APNS/FCM
    PushNotifications.register();

    // On succcess, we should be able to receive notifications
    PushNotifications.addListener('registration',
      (token: PushNotificationToken) => {
        alert('Push registration success, token: ' + token.value);
      }
    );

    // Some issue with our setup and push will not work
    PushNotifications.addListener('registrationError',
      (error: any) => {
        alert('Error on registration: ' + JSON.stringify(error));
      }
    );

    // Show us the notification payload if the app is open on our device
    PushNotifications.addListener('pushNotificationReceived',
      (notification: PushNotification) => {
        alert('Push received: ' + JSON.stringify(notification));
      }
    );

    // Method called when tapping on a notification
    PushNotifications.addListener('pushNotificationActionPerformed',
      (notification: PushNotificationActionPerformed) => {
        alert('Push action performed: ' + JSON.stringify(notification));
      }
    );
  }

  private setupRecSub() {
    if (this.user.loggedIn && !this.user.isParent) {
      this.checkRecommendations();
    }
  }
}
