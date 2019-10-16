import { Injectable } from '@angular/core';
import { merge } from 'lodash';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { map } from 'rxjs/internal/operators/map';
import { tap } from 'rxjs/internal/operators/tap';

import { NodeApiService } from './api-node.service';
import { ApiService } from './api.service';
import { HighSchoolService } from './high-school.service';
import { MixpanelService } from './mixpanel.service';
import { PushNotificationService } from './push-notification.service';
import { ToastService } from './toast.service';
import { INewUser } from '@nte/interfaces/new-user.interface';
import { IStudent } from '@nte/interfaces/student.interface';
import { IUserOverview } from '@nte/interfaces/user-overview.interface';
import { IResult } from '@nte/models/interest-profiler.models';
import { Stakeholder } from '@nte/models/stakeholder.model';
import { ApiTokenService } from '@nte/services/api-token.service';
import { StorageService } from '@nte/services/storage.service';

@Injectable({ providedIn: 'root' })
export class StakeholderService {
  public newUser: INewUser = {
    email: null,
    first_name: null,
    last_name: null,
    password: null,
    stakeholder_type: null
  };

  private _loggingIn: BehaviorSubject<boolean> = new BehaviorSubject(false);
  private _loggedIn: BehaviorSubject<boolean> = new BehaviorSubject(false);
  private _loginSuccess: Subject<any> = new Subject<any>();
  private _logoutSuccess: Subject<any> = new Subject<any>();
  private _overview: BehaviorSubject<IUserOverview> = new BehaviorSubject<IUserOverview>(null);
  private _stakeholder: BehaviorSubject<Stakeholder> = new BehaviorSubject<Stakeholder>(null);

  get loggedIn(): boolean {
    return this._loggedIn.getValue();
  }
  set loggedIn(isLoggedIn: boolean) {
    this._loggedIn.next(isLoggedIn);
  }
  get loggedIn$(): Observable<boolean> {
    return this._loggedIn.asObservable();
  }

  get loggingIn(): boolean {
    return this._loggingIn.getValue();
  }
  set loggingIn(isLoggingIn: boolean) {
    this._loggingIn.next(isLoggingIn);
  }
  get loggingIn$(): Observable<boolean> {
    return this._loggingIn.asObservable();
  }

  get loginSuccess(): Observable<boolean> {
    return this._loginSuccess.asObservable();
  }
  get logoutSuccess(): Observable<boolean> {
    return this._logoutSuccess.asObservable();
  }

  get overview(): IUserOverview {
    return this._overview.getValue();
  }
  set overview(overview: IUserOverview) {
    this._overview.next(overview);
  }
  get overview$(): Observable<IUserOverview> {
    return this._overview.asObservable();
  }

  get stakeholder(): Stakeholder {
    return this._stakeholder.getValue();
  }
  set stakeholder(stakeholder: Stakeholder) {
    this._stakeholder.next(stakeholder);
  }
  get stakeholder$(): Observable<Stakeholder> {
    return this._stakeholder.asObservable();
  }

  constructor(public api: ApiService,
    public apiToken: ApiTokenService,
    public nodeApi: NodeApiService,
    public storage: StorageService,
    private highSchoolService: HighSchoolService,
    private mixpanel: MixpanelService,
    private pnService: PushNotificationService,
    private toastService: ToastService) {
    this.stakeholder = new Stakeholder({});
  }

  public checkStorage() {
    return this.storage.getObject(`ls.stakeholder`)
      .then(
        stakeholder => {
          if (stakeholder) {
            this.storage.getItem(`ls.token`)
              .then(token => {
                if (token && token.value && token.value.length) {
                  const currentUser = stakeholder;
                  this.setStakeholder(
                    {
                      id: currentUser.id,
                      token: token.value
                    }, true
                  );
                }
              });
            return true;
          } else {
            return false;
          }
        },
        err => false
      );
  }

  changePassword(currentPassword: string, newPassword: string, confirmedPassword) {
    return this.api
      .post(`/stakeholder/password/change/`, {
        new_password: newPassword,
        new_password_confirm: confirmedPassword,
        old_password: currentPassword
      });
  }

  public deleteUser() {
    this.api
      .delete(`/stakeholder/`)
      .subscribe(() => this.logout());
  }

  public getCleverAuthToken(cleverData: any) {
    const cleverAuthData = cleverData || {};
    return this.api
      .postWithoutAuthorization(`/clever/login/`, cleverAuthData)
      .subscribe(
        response => this.setStakeholder(response, true, `clever`),
        err => console.error(err)
      );
  }

  public getGraduationYearOptions() {
    return this.api
      .optionsNoAuth(`/stakeholder/register/`)
      .pipe(map(result => {
        return result.actions.POST.graduation_year;
      }));
  }

  public getNewUserForRegistration() {
    this.newUser.graduation_year = this.newUser.graduation.year;
    this.newUser.phase = this.newUser.graduation.phase;
    delete this.newUser.graduation;
    return this.newUser;
  }

  public getOverview() {
    return this.nodeApi
      .get(`/users/${this.stakeholder.id}/overview`)
      .pipe(map((response) => {
        this.overview = response;
        return this.overview;
      }));
  }

  public getStakeholderInformation(isLoggingIn?: boolean, loginService?: string) {
    this.api
      .get(`/stakeholder`)
      .subscribe(data => {
        this.stakeholder = new Stakeholder(data);
        this.loggedIn = true;
        this.stakeholder.loggedIn = true;
        this.storage.getItem(`ls.token`).then((stored) => {
          this.stakeholder.authToken = stored.value;
        });
        this.stakeholder.id = data.id;
        this.populateEntitlements();
        this.mixpanel.start(this.stakeholder);
        if (this.stakeholder.highschool) {
          this.setHighSchool();
        }
        if (isLoggingIn) {
          if (loginService === `clever`) {
            this.mixpanel.event(`logged_in_with_clever`);
          } else {
            this.mixpanel.event(`logged_in_with_basic_login`);
          }
        }
        return this.stakeholder;
      });
  }

  public getStudentsForParent(queryString = ``): Observable<IStudent[]> {
    return this.api
      .get(`/students/${queryString}`)
      .pipe(
        map((response) => response.results),
        tap<IStudent[]>((students) => {
          this.stakeholder.students = students;
          return students;
        })
      );
  }

  public login(loginData: any) {
    this.loggingIn = true;
    this.api
      .postWithoutAuthorization(`/stakeholder/login/`, loginData)
      .subscribe(
        response => {
          this.setStakeholder(response, true);
          this.apiToken.token = response.token;
        },
        err => {
          this.loggingIn = false;
          this.showLoginErrorToast(err);
        }
      );
  }

  public loginViaStorage() {
    this.storage.getItem(`ls.token`)
      .then(stored => {
        if (stored && stored.value && stored.value.length) {
          this.setSessionStorage(stored.value, true);
        }
      });
  }

  public logout() {
    this.storage.removeItem(`ls.stakeholder`);
    this.storage.removeItem(`ls.token`);
    this.storage.removeItem(`ls.user.roleId`);
    this.storage.clear();
    this.stakeholder = new Stakeholder({});
    this.newUser = {
      email: null,
      first_name: null,
      last_name: null,
      password: null,
      stakeholder_type: null
    };
    this.mixpanel.event(`logout`);
    this.mixpanel.clearUser();
    this.loggedIn = false;
    this._logoutSuccess.next(true);
  }

  public populateEntitlements() {
    const entitlements = new Array();
    return this.api
      .getPaged(`/stakeholder/entitlement/all/`)
      .subscribe(data => {
        entitlements.push.apply(entitlements, data);
        this.stakeholder.entitlements = entitlements;
        this.refreshStakeholder();
        this._loginSuccess.next(true);
      });
  }

  public refreshStakeholder() {
    this.stakeholder = new Stakeholder(this.stakeholder);
    this.storage.setObject(`ls.stakeholder`, this.stakeholder);
  }

  public register(): Observable<any> {
    if (this.newUser.graduation) {
      this.newUser = this.getNewUserForRegistration();
    }
    return this.api
      .postWithoutAuthorization(`/stakeholder/register`, this.newUser)
      .pipe(map((response) => {
        this.mixpanel.event(`user_registered`);
        return response;
      }));
  }

  public removeProfilePicture(userId: number) {
    return this.nodeApi
      .delete(`/users/${userId}/profile-pic`);
  }

  public sendForgotPasswordEmail(email: string): Observable<any> {
    return this.api
      .postWithoutAuthorization(`/stakeholder/forgot`, { email });
  }

  public setHighSchool() {
    return this.highSchoolService.getDetails(this.stakeholder.highschool)
      .subscribe(() => {
        this.mixpanel.setHighSchool(
          this.stakeholder.district ? this.stakeholder.district.name : ``,
          this.stakeholder.highschool
        );
      });
  }

  public setInterestProfilerResult(result: IResult[]) {
    this.stakeholder.interest_profiler_result = result;
    this.storage.setObject(`ls.stakeholder`, this.stakeholder);
  }

  public setSessionStorage(token: string, isLoggingIn?: boolean, loginService?: string) {
    this.storage.setItem(`ls.token`, token);
    this.api.setupHeaders(token).then(() => {
      this.nodeApi.setupHeaders(token);
      this.getStakeholderInformation(isLoggingIn, loginService);
      this.pnService.setToken();
    });
  }

  public setStakeholder(loginData: any, isLoggingIn?: boolean, loginService?: string) {
    this.stakeholder.authToken = loginData.token || loginData.authToken;
    this.stakeholder.id = loginData.id;
    this.setSessionStorage(this.stakeholder.authToken, isLoggingIn, loginService);
  }

  public updateInterestProfile(data: any) {
    this.api
      .patch(`/stakeholder`, { interest_profiler_result: data })
      .subscribe(
        (response: any) => {
          this.setInterestProfilerResult(
            response.interest_profiler_result
          );
        },
        err => console.error(err)
      );
  }


  public updateProfilePicture(file: File) {
    const formData = new FormData();
    formData.append(`profile_photo`, file);
    formData.append(`type`, file.type);
    return this.api
      .patchFile(`/stakeholder/`, file)
      .pipe(map((response: any) => this.stakeholder = response));
  }

  public updateStakeholder() {
    this.api
      .get(`/stakeholder`)
      .pipe(map(data => {
        const updatedStakeholder = new Stakeholder(data);
        merge(this.stakeholder, updatedStakeholder);
      }));
  }

  private isJson(jsonString: string) {
    try {
      return JSON.parse(jsonString);
    } catch (e) {
      return false;
    }
  }

  private async showLoginErrorToast(err: any) {
    let errorMessage = `Unable to log you in. Please try again!`;
    if (err && err._body) {
      if (this.isJson(err._body)) {
        errorMessage = JSON.parse(err._body).detail;
      }
    }
    this.toastService.open(errorMessage);
  }
}
