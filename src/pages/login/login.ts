import { animate, Component, state, style, transition, trigger, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EmailComposer } from '@ionic-native/email-composer';
import { Storage } from '@ionic/storage';
import { AlertController, Content, IonicPage, NavController, Platform } from 'ionic-angular';
import { Subject } from 'rxjs';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { emailRegex, registerMessage } from '@nte/constants/stakeholder.constants';
import { EnvironmentService } from '@nte/services/environment.service';
import { MixpanelService } from '@nte/services/mixpanel.service';
import { StakeholderService } from '@nte/services/stakeholder.service';
import { ForgotPasswordPage } from './../forgot-password/forgot-password';

@IonicPage({
  name: `login-page`,
  priority: `high`
})
@Component({
  animations: [
    trigger(`keyboardState`, [
      state(`closed, void`,
        style({})
      ),
      state(`open`,
        style({
          top: `5%`,
          transform: `scale(.65)`,
          'object-fit': `cover`,
          'object-position': `100% 0`,
          height: `10rem`
        })
      ),
      state(`closed`,
        style({})
      ),
      transition(`* => *`, [
        animate(`225ms ease-in-out`),
        // cubic-bezier(0.4,0.0,0.2,1)
        style({})
      ])
    ])
  ],
  selector: `login`,
  templateUrl: `login.html`
})
export class LoginPage {
  @ViewChild(Content) public content: Content;

  public email: string;
  public invalid: any = {};
  public isInitialEntry: any = {};
  public loginForm: FormGroup = this.formBuilder.group({
    email: [
      ``,
      Validators.compose([
        Validators.required,
        Validators.pattern(emailRegex)
      ])
    ],
    password: [
      ``,
      Validators.compose([
        Validators.required,
        Validators.minLength(8)
      ])
    ]
  });
  public password: string;

  private _keyboardShowing = new BehaviorSubject<boolean>(false);
  private ngUnsubscribe: Subject<any> = new Subject();

  get keyboardShowing() {
    return this._keyboardShowing.asObservable();
  }

  get loggingIn() {
    return this.stakeholderService.loggingIn;
  }

  set loggingIn(loggingIn: boolean) {
    this.stakeholderService.loggingIn = loggingIn;
  }

  constructor(
    public environmentService: EnvironmentService,
    public platform: Platform,
    private alertCtrl: AlertController,
    private emailComposer: EmailComposer,
    private formBuilder: FormBuilder,
    private mixpanel: MixpanelService,
    private navCtrl: NavController,
    private stakeholderService: StakeholderService,
    private storage: Storage
  ) { }

  ionViewDidEnter() {
    this.loggingIn = false;
    this.mixpanel.event(`navigated_to-Login`);
  }

  ionViewDidLoad() {
    this.stakeholderService.loggedIn = false;
    this.mixpanel.event(`$app_open`);
    // this.setupLoginSub();
    this.setupKeyboardListeners();
    this.storage.get(`ls.stakeholder`)
      .then(stakeholder => {
        if (stakeholder) {
          this.storage.get(`ls.token`)
            .then(token => {
              if (token && token.length) {
                const currentUser = JSON.parse(stakeholder);
                this.stakeholderService.setStakeholder({
                  id: currentUser.id,
                  token
                }, true);
              }
            });
        }
      });
  }

  ionViewWillUnload() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  public checkValidate(ctrlName: string) {
    if (this.isInitialEntry[ctrlName] === false) {
      this.validate(ctrlName);
    }
  }

  public goToForgotPassword() {
    this.navCtrl.push(ForgotPasswordPage);
  }

  public login() {
    this.stakeholderService.login({
      email: this.email,
      password: this.password
    });
  }

  public loginWithClever() {
    // const redirectUri = `https://nexttier.com/edu/clever`;
    // const clientId = this.getClientId(this.environmentService.name);
    // const cleverUrl =
    //   `https://clever.com/oauth/authorize?response_type=token` +
    //   `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    //   `&client_id=${clientId}`;
    // /*tslint:disable:no-unused-variable */
    // const browser = this.linkService.create(cleverUrl);
    // https://clever.com/oauth/authorize?client_id=<client id>
    //      &redirect_uri=<redirect uri>&response=code&state=<state input>
    // TODO: Fix Clever login
    // browser.addEventListener(`loadstart`, event => {
    //   this.handleCleverLogin(event.url, redirectUri, browser);
    // });
  }

  public setIsInitialEntry(ctrlName: string) {
    this._keyboardShowing.next(true);
    const fieldIsClean = !this.loginForm.controls[ctrlName].dirty;
    this.isInitialEntry[ctrlName] = fieldIsClean;
  }

  public showRegisterAlert() {
    const regAlert = this.alertCtrl.create({
      buttons: [
        {
          handler: () => {
            if (this.platform.is(`android`) && this.emailComposer) {
              this.emailComposer.isAvailable().then(() => {
                this.emailComposer.open({
                  isHtml: true,
                  to: `signup@nexttier.com`
                });
              });
            } else {
              window.location.href = `mailto:signup@nexttier.com`;
            }
          },
          text: `Contact us`
        },
        `Dismiss`
      ],
      message: registerMessage.message,
      subTitle: registerMessage.subTitle,
      title: registerMessage.title
    });
    regAlert.present();
  }

  public validate(ctrlName: string) {
    if (this.isInitialEntry[ctrlName]) {
      this.loginForm.controls[ctrlName].markAsDirty();
    }
    this.invalid[ctrlName] = this.loginForm.controls[ctrlName].invalid;
  }

  /* PRIVATE METHODS */

  // private extractCodeFromUrl(url: string) {
  //   const queryString = url.split(`?`)[1];
  //   if (queryString) {
  //     const queryArray = queryString.split(`&`);
  //     const keyValuePair = queryArray[0].split(`=`);
  //     if (!(keyValuePair[0].search(`code`) === -1)) {
  //       return keyValuePair[1];
  //     }
  //     return null;
  //   }
  // }

  // private getClientId(environment: string) {
  //   switch (environment) {
  //     case `stg`:
  //     case `dev`:
  //       return `a61a4ca5ab881037cece`;
  //     case `prod`:
  //       return `88acf1cc240c3d334b2f`;
  //   }
  // }

  // private handleCleverLogin(url: string, redirectUri: string, browser: any) {
  //   const code = this.extractCodeFromUrl(url);
  //   if (!code) {
  //     return;
  //   }
  //   this.stakeholderService.getCleverAuthToken({
  //     code,
  //     redirect_uri: redirectUri
  //   });
  //   browser.close();
  // }

  private setupKeyboardListeners() {
    window.addEventListener(`keyboardDidShow`, () => {
      this._keyboardShowing.next(true);
    });
    window.addEventListener(`keyboardWillShow`, () => {
      this._keyboardShowing.next(true);
    });
    window.addEventListener(`keyboardDidHide`, () => {
      this._keyboardShowing.next(false);
    });
    window.addEventListener(`keyboardWillHide`, () => {
      this._keyboardShowing.next(false);
    });
  }
}
