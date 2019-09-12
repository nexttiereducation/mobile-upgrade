import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';

import { ToastService } from './../../services/toast.service';
import { IFirstName, ILastName } from '@nte/interfaces/settings-general.interface';
import { IUserOverview } from '@nte/interfaces/user-overview.interface';
import { SettingsService } from '@nte/services/settings.service';
import { StakeholderService } from '@nte/services/stakeholder.service';

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

  constructor(private accountSettingsService: SettingsService,
    private stakeholderService: StakeholderService,
    private toastService: ToastService) { }

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
        () => this.toastService.open(`Can't remove profile picture. Please try again.`)
      );
  }

  updateGeneralSettings(name: IFirstName | ILastName) {
    this.accountSettingsService.updateUserInfo(this.currentUser.id, name)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        response => {
          this.toastService.open(`Settings updated.`);
          this.currentUser = response;
        },
        () => this.toastService.open(`Can't update settings. Please try again.`)
      );
  }

  updateProfilePicture(file: File) {
    this.stakeholderService.updateProfilePicture(file)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        (response: any) => {
          this.currentUser.profile_photo_url = response.profile_photo;
          this.attachingFile = false;
          this.toastService.open(`Profile picture updated.`);
        },
        err => {
          console.error(err);
          this.toastService.open(`Can't update profile picture. Please try again.`);
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
