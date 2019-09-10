import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ToastController } from '@ionic/angular';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';

import { IFirstName, ILastName } from '@nte/interfaces/settings-general.interface';
import { IUserOverview } from '@nte/interfaces/user-overview.interface';
import { SettingsProvider } from '@nte/services/settings.service';
import { StakeholderProvider } from '@nte/services/stakeholder.service';

@Component({
  selector: `general-settings`,
  templateUrl: `settings-general.html`
})
export class GeneralSettingsComponent implements OnInit, OnDestroy {
  @Input() canEdit: boolean;
  @Input() currentUser: IUserOverview;

  public attachingFile: boolean;
  public fileHover: boolean = false;
  public firstNameControl: FormControl = new FormControl();
  public lastNameControl: FormControl = new FormControl();
  public wantsToDelete: boolean = false;
  // public uploader: FileUploader = new FileUploader({});

  private ngUnsubscribe: Subject<any> = new Subject();

  get canDelete() {
    return this.currentUser.stakeholder_type === `Parent` || !this.currentUser.district;
  }

  constructor(private accountSettingsProvider: SettingsProvider,
    private stakeholderService: StakeholderProvider,
    private toastCtrl: ToastController) { }

  ngOnInit() {
    this.firstNameControl.setValue(this.currentUser.first_name);
    this.lastNameControl.setValue(this.currentUser.last_name);
    this.setUpFormControls();
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  deleteAccount() {
    this.stakeholderService.deleteUser();
  }

  fileSelected(event: any | File[]) {
    this.attachingFile = true;
    const file = event.target ? event.target.files[0] : event[0];
    this.updateProfilePicture(file);
  }

  removeProfilePicture() {
    this.stakeholderService.removeProfilePicture(this.currentUser.id)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        () => this.currentUser.profile_photo_url = null,
        () => this.toastCtrl.create({ message: `Can't remove profile picture. Please try again.` }).present()
      );
  }

  updateGeneralSettings(name: IFirstName | ILastName) {
    this.accountSettingsProvider.updateUserInfo(this.currentUser.id, name)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        response => {
          this.toastCtrl.create({ message: `Settings updated.` }).present();
          this.currentUser = response;
        },
        () => this.toastCtrl.create({ message: `Can't update settings. Please try again.` }).present()
      );
  }

  updateProfilePicture(file: File) {
    this.stakeholderService.updateProfilePicture(file)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        (response: any) => {
          this.currentUser.profile_photo_url = response.profile_photo;
          this.attachingFile = false;
          this.toastCtrl.create({ message: `Profile picture updated.` }).present();
        },
        err => {
          console.error(err);
          this.toastCtrl.create({ message: `Can't update profile picture. Please try again.` }).present();
        }
      );
  }

  private setUpFormControls() {
    this.firstNameControl
      .valueChanges
      .pipe(
        debounceTime(2000),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe(firstName => {
        if (firstName && this.firstNameControl.touched) {
          this.updateGeneralSettings({ first_name: firstName });
        }
      });
    this.lastNameControl
      .valueChanges
      .pipe(
        debounceTime(2000),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe(lastName => {
        if (lastName && this.lastNameControl.touched) {
          this.updateGeneralSettings({ last_name: lastName });
        }
      });
  }

}
