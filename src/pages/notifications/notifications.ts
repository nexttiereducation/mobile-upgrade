import { Component } from '@angular/core';
import { IonicPage, ItemSliding, NavController } from 'ionic-angular';

import { COLLEGE_TILES } from '@nte/constants/college.constants';
import { TASK_TILES } from '@nte/constants/task.constants';
import { INotification } from '@nte/interfaces/notification.interface';
import { IEmptyState } from '@nte/models/empty-state';
import { CollegeListTileService } from '@nte/services/college.list-tile.service';
import { ConnectionService } from '@nte/services/connection.service';
import { NotificationService } from '@nte/services/notification.service';
import { StakeholderService } from '@nte/services/stakeholder.service';
import { CollegePage } from './../college/college';
import { MessagingPage } from './../messaging/messaging';
import { TaskPage } from './../task/task';
import { TasksListPage } from './../tasks-list/tasks-list';

@IonicPage({
  name: `notifications-page`
})
@Component({
  selector: `notifications`,
  templateUrl: `notifications.html`,
  services: [
    NotificationService
  ]
})
export class NotificationsPage {
  // @Input() teamMembers: Array<IConnection>;
  public emptyState: IEmptyState = {
    body: ``,
    imagePath: `college/tile_saved`,
    title: `No new notifications`
  };
  public notifications: any[];
  public scrollDown: boolean = false;

  get user() {
    return this.stakeholderService.stakeholder;
  }

  constructor(public connectionService: ConnectionService,
    public notificationService: NotificationService,
    private listTileService: CollegeListTileService,
    private navCtrl: NavController,
    private stakeholderService: StakeholderService) { }

  ionViewDidLoad() {
    this.notificationService.getNotifications();
  }

  public clearAll(category: number) {
    this.notificationService.deleteCategory(category);
  }

  public close() {
    this.notificationService.close();
    this.navCtrl.pop({
      animation: `ios-transition`,
      direction: `forward`
    });
  }

  public delete(notification: INotification, item: ItemSliding) {
    this.notificationService.delete(notification);
    item.close();
  }

  public markRead(notification: INotification, item: ItemSliding) {
    this.notificationService.markRead(notification);
    item.close();
  }

  public view(notification: INotification, item: ItemSliding) {
    this.markRead(notification, item);
    if (notification.goto !== ``) {
      switch (notification.category) {
        case 1:
          this.goToTask(notification);
          break;
        case 2:
          this.goToCollege(notification);
          break;
        default:
          break;
      }
    }
    // this.linkParserService.useLink(notification, this.user);
  }

  private goToCollege(notification: INotification) {
    const regex = /nte:\/\/(?:recommendation\/)?institution\/(\d+)(\?user\=(\d+))?/gm;
    const collegeId: number = +notification.goto.replace(regex, `$1`);
    const isRec: boolean = notification.body.indexOf(`recommended`) > -1;
    const list = COLLEGE_TILES.find(t => t.name === (isRec ? `Recommended` : `Search All`));
    this.listTileService.activeList = list;
    this.navCtrl.push(
      CollegePage,
      {
        id: collegeId,
        isRecd: isRec
      }
    );
  }

  private goToTask(notification: INotification) {
    if (notification.body.indexOf(`deleted`) === -1) {
      if (notification.goto === `nte://custom_tasks`) {
        const list = TASK_TILES.find(t => t.name === `Counselor`);
        this.navCtrl.push(
          TasksListPage,
          { tile: list }
        );
      } else if (notification.goto.indexOf(`nte://connections`) !== -1) {
        this.navCtrl.push(MessagingPage);
        // open messaging, select invitation
      } else {
        // nte://tasks/601190?user=102821&category=13
        const regex = /nte:\/\/tasks\/(\d+)(\?user\=(\d+))?(&category\=(\d+))?/gm;
        const taskId: number = +notification.goto.replace(regex, `$1`);
        // const pages: any[] = [
        //   { page: TasksPage },
        //   { page: TasksListPage }
        // ];
        const params = { id: taskId };
        if (notification.body.indexOf(`file`) !== -1) {
          params[`page`] = `attach`;
        } else if (notification.body.indexOf(`note`) !== -1) {
          params[`page`] = `notes`;
        }
        // pages.push(taskPage);
        this.navCtrl.push(TaskPage, params);
      }
    }
  }

}
