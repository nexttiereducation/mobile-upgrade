import { Component } from '@angular/core';
import { IonicPage, ModalController, NavController } from 'ionic-angular';
import { Subject } from 'rxjs/Subject';

import { ApplicationDatesComponent } from '@nte/components/application-dates/application-dates';
import { TASK_LIST_EMPTY_STATES, TASK_TILES } from '@nte/constants/task.constants';
import { ICollegeTracker } from '@nte/models/college-tracker.interface';
import { ICollege } from '@nte/models/college.interface';
import { IStudent } from '@nte/models/student.interface';
import { CollegeService } from '@nte/services/college.service';
import { MessageService } from '@nte/services/message.service';
import { MixpanelService } from '@nte/services/mixpanel.service';
import { StakeholderService } from '@nte/services/stakeholder.service';
import { TaskService } from '@nte/services/task.service';
import { TasksListPage } from './../tasks-list/tasks-list';

@IonicPage({
  name: `tasks-page`,
  priority: `high`,
  segment: `/tasks`
})
@Component({
  selector: `tasks`,
  templateUrl: `tasks.html`
})
export class TasksPage {
  public activeStudent: IStudent;
  public isParent: boolean;
  public parentEmptyState: any;
  public taskTiles: any[];

  get allTasksTile() {
    if (this.taskTiles) {
      return this.taskTiles[0];
    }
  }

  get collegeTrackers(): (ICollege | ICollegeTracker)[] {
    if (this.isParent) {
      return this.activeStudent.institutions;
    } else {
      return this.user.institution_trackers;
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

  constructor(public collegeService: CollegeService,
    public messageService: MessageService,
    public modalCtrl: ModalController,
    public navCtrl: NavController,
    public stakeholderService: StakeholderService,
    public taskService: TaskService,
    private mixpanel: MixpanelService) { }

  ionViewDidLoad() {
    this.isParent = this.user.isParent;
    for (let i = 0, tile; tile = TASK_TILES[i]; ++i) {
      tile.iconFileName = tile.iconFileName || `type_${tile.name}`;
      tile.iconUrl = `assets/image/task/${tile.iconFileName.toLowerCase()}.svg`;
    }
    this.taskTiles = TASK_TILES;
  }

  ionViewWillEnter() {
    if (this.isParent) {
      this.setupParent();
    } else {
      this.updateCollegeTrackers();
    }
    this.mixpanel.event(`navigated_to-Student-Tasks`);
    // (grab started survey tasks as well and call a function to concat them into whichever list get chosen)
  }

  public getDisplayText(student: IStudent) {
    const studentName = student.full_name.replace(` ${student.last_name}`, ``);
    if (studentName[studentName.length - 1] === `s`) {
      return `${studentName}' Tasks`;
    } else {
      return `${studentName}'s Tasks`;
    }
  }

  public goToTaskList(listTile: any, collegeTracker?: ICollegeTracker) {
    this.navCtrl.push(
      TasksListPage,
      {
        collegeTracker,
        impersonatedStudent: this.activeStudent,
        tile: listTile
      });
  }

  public openApplicationDates(collegeTracker: ICollegeTracker) {
    this.collegeService.getCollegeDetails(collegeTracker.institution)
      .subscribe((college) => {
        const isNewAdd = false;
        const saveSchoolSubject = new Subject<any>();
        const modal = this.modalCtrl.create(ApplicationDatesComponent, { college, isNewAdd, saveSchoolSubject });
        const saveSchoolSub = saveSchoolSubject.subscribe((data) => {
          if (data.application_type) {
            this.collegeService.updateCollegeTracker(collegeTracker.institution, data)
              .subscribe((tracker) => {
                const idx = this.user.institution_trackers.findIndex((t: any) => {
                  return collegeTracker.institution === (t.college ? t.college : t.institution);
                });
                this.user.institution_trackers[idx] = tracker;
                this.goToTaskList(null, collegeTracker);
                modal.dismiss();
              });
          }
        });
        modal.present();
        modal.onDidDismiss(() => {
          saveSchoolSub.unsubscribe();
        });
      });
  }

  public updateCollegeTrackers() {
    if (this.user && this.user.id) {
      this.collegeService.getFollowedColleges()
        .subscribe((response: any) => {
          const trackers: ICollegeTracker[] = response.json();
          this.user.institution_trackers = trackers;
        });
    }
  }

  public viewCollege(collegeTracker: ICollegeTracker) {
    if (!collegeTracker.application_type && this.user.phase === `Senior`) {
      this.openApplicationDates(collegeTracker);
    } else {
      this.goToTaskList({
        colSpan: 6,
        filter: `?institution=${collegeTracker.institution}`,
        iconUrl: collegeTracker.photo_url,
        isLocked: true,
        name: collegeTracker.institution_name
      }, collegeTracker);
      // we want to pass the right information down to the list
    }
  }

  private setupParent() {
    if (this.user.students && this.user.students.length) {
      if (!this.activeStudent) {
        this.activeStudent = this.user.students[0];
      }
      return;
    }
    this.stakeholderService.getStudentsForParent()
      .subscribe((students) => {
        if (students && students.length) {
          this.activeStudent = students[0];
        } else {
          this.parentEmptyState = TASK_LIST_EMPTY_STATES.Parent;
        }
      });
  }
}
