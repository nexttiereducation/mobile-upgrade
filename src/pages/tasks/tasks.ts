import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { ApplicationDatesComponent } from '@nte/components/application-dates/application-dates';
import { TASK_LIST_EMPTY_STATES, TASK_TILES } from '@nte/constants/task.constants';
import { ICollegeTracker } from '@nte/interfaces/college-tracker.interface';
import { IStudent } from '@nte/interfaces/student.interface';
import { CollegesService } from '@nte/services/colleges.service';
import { MessageService } from '@nte/services/message.service';
import { MixpanelService } from '@nte/services/mixpanel.service';
import { StakeholderService } from '@nte/services/stakeholder.service';
import { TaskService } from '@nte/services/task.service';

@Component({
  selector: `tasks`,
  templateUrl: `tasks.html`,
  styleUrls: [`tasks.scss`]
})
export class TasksPage implements OnInit, OnDestroy {
  public activeStudent: IStudent;
  public isParent: boolean;
  public parentEmptyState: any;
  public taskTiles: any[];

  private ngUnsubscribe: Subject<any> = new Subject();

  get allTasksTile() {
    if (this.taskTiles) {
      return this.taskTiles[0];
    }
  }

  get collegeTrackers(): any[] {
    if (this.isParent) {
      return this.activeStudent.institutions;
    } else {
      if (this.user.institution_trackers) {
        return this.user.institution_trackers.map((t: any) => {
          t.iconUrl = t.photo_url;
          t.name = t.institution_name;
          return t;
        });
      } else {
        return null;
      }
    }
  }

  get showParentHeader() {
    return this.isParent && this.activeStudent;
  }

  get taskTypeTiles() {
    if (this.taskTiles) {
      return this.taskTiles.slice(1, 5);
    }
  }

  get user() {
    return this.stakeholderService.stakeholder;
  }

  constructor(public collegeService: CollegesService,
    public messageService: MessageService,
    public modalCtrl: ModalController,
    public route: ActivatedRoute,
    public router: Router,
    public stakeholderService: StakeholderService,
    public taskService: TaskService,
    private mixpanel: MixpanelService) { }

  ngOnInit() {
    this.isParent = this.user.isParent;
    this.taskTiles = [...TASK_TILES].map(tile => {
      tile.iconFileName = tile.iconFileName || `type_${tile.name}`;
      tile.iconUrl = `assets/image/task/${tile.iconFileName.toLowerCase()}.svg`;
      return tile;
    });
    if (this.isParent) {
      this.setupParent();
    } else {
      this.updateCollegeTrackers();
    }
    this.mixpanel.event(`navigated_to-Student-Tasks`);
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  public getDisplayText(student: IStudent) {
    const studentName = student.full_name.replace(` ${student.last_name}`, ``);
    if (studentName[studentName.length - 1] === `s`) {
      return `${studentName}' Tasks`;
    } else {
      return `${studentName}'s Tasks`;
    }
  }

  public openApplicationDates(collegeTracker: ICollegeTracker) {
    this.collegeService.getDetails(collegeTracker.institution)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        (college) => {
          const isNewAdd = false;
          const saveSchoolSubject = new Subject<any>();
          const saveSchoolSub = saveSchoolSubject
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(
              (data) => {
                if (data.application_type) {
                  this.collegeService.updateTracker(collegeTracker.institution, data)
                    .pipe(takeUntil(this.ngUnsubscribe))
                    .subscribe(
                      (tracker) => {
                        const idx = this.user.institution_trackers.findIndex((t: any) => {
                          return collegeTracker.institution === (t.college ? t.college : t.institution);
                        });
                        this.user.institution_trackers[idx] = tracker;
                        this.viewList(null, collegeTracker);
                        this.openAppDatesModal({
                          college,
                          isNewAdd,
                          saveSchoolSubject,
                          saveSchoolSub
                        });
                      });
                }
              });
        });
  }

  public updateCollegeTrackers() {
    if (this.user && this.user.id) {
      this.collegeService.getFollowed()
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(
          (response: any) => {
            const trackers: ICollegeTracker[] = response.json();
            this.user.institution_trackers = trackers;
          }
        );
    }
  }

  public viewCollege(collegeTracker: ICollegeTracker) {
    if (!collegeTracker.application_type && this.user.phase === `Senior`) {
      this.openApplicationDates(collegeTracker);
    } else {
      this.viewList(
        {
          colSpan: 6,
          filter: `?institution=${collegeTracker.institution}`,
          iconUrl: collegeTracker.photo_url,
          isLocked: true,
          name: collegeTracker.institution_name
        },
        collegeTracker
      );
      // we want to pass the right information down to the list
    }
  }

  public viewList(listTile: any, collegeTracker?: ICollegeTracker) {
    const listName = listTile.iconFileName.replace(`tile_`, ``).replace(`type_`, ``);
    this.router.navigate(
      [
        `app`,
        `tasks`,
        `list`,
        collegeTracker ? collegeTracker.institution : listName
      ],
      {
        // relativeTo: this.route,
        state: {
          collegeTracker,
          impersonatedStudent: this.activeStudent,
          tile: listTile
        }
      }
    );
  }

  private async openAppDatesModal(data: any) {
    const modal = await this.modalCtrl.create({
      component: ApplicationDatesComponent,
      componentProps: {
        college: data.college,
        isNewAdd: data.isNewAdd,
        saveSchoolSubject: data.saveSchoolSubject
      }
    });
    await modal.onDidDismiss().then(() => data.saveSchoolSub.unsubscribe());
    return await modal.present();
  }

  private setupParent() {
    if (this.user.students && this.user.students.length) {
      if (!this.activeStudent) {
        this.activeStudent = this.user.students[0];
      }
      return;
    }
    this.stakeholderService.getStudentsForParent()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        (students) => {
          if (students && students.length) {
            this.activeStudent = students[0];
          } else {
            this.parentEmptyState = TASK_LIST_EMPTY_STATES.Parent;
          }
        }
      );
  }
}
