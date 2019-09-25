import { Injectable } from '@angular/core';
import dayjs from 'dayjs';
import { BehaviorSubject } from 'rxjs';

import { INotificationCounts } from '@nte/interfaces/notification-counts.interface';
import { INotification } from '@nte/interfaces/notification.interface';
import { ApiService } from '@nte/services/api.service';
import { ListService } from '@nte/services/list.service';
import { StakeholderService } from '@nte/services/stakeholder.service';

@Injectable({ providedIn: 'root' })
export class NotificationService extends ListService {
  public categories: string[] = [
    `Tasks`,
    `Colleges`
  ];

  private polling: any;
  private _counts: BehaviorSubject<INotificationCounts> = new BehaviorSubject<INotificationCounts>(null);
  private _isOpen: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  get counts$() {
    return this._counts.asObservable();
  }

  get isOpen$() {
    return this._isOpen.asObservable();
  }

  get unreadCount() {
    if (this.all && this.all.length) {
      return this.all.filter(n => !n.read).length;
    }
  }

  get user() {
    return this.stakeholderService.stakeholder;
  }

  set isOpen(isOpen: boolean) {
    this._isOpen.next(isOpen);
  }

  constructor(public apiService: ApiService,
    public stakeholderService: StakeholderService) {
    super();
    this.baseUrl = `/notification/messages`;
  }

  close() {
    this.isOpen = false;
  }

  delete(notification: INotification) {
    this.apiService.delete(`${this.baseUrl}/${notification.id}/`)
      .subscribe(() => {
        this.all = [...this.all].filter(n => n.id !== notification.id);
        this.getNotificationCounts();
      });
  }

  deleteCategory(categoryId: number) {
    this.apiService.delete(`${this.baseUrl}/category/${categoryId}/`)
      .subscribe(() => {
        this.all = [...this.all].filter(n => n.category !== categoryId);
        this.getNotificationCounts();
      });
  }

  getNotifications(getMore: boolean = false): void {
    this.apiService.get(getMore ? this.nextPage : this.baseUrl)
      .subscribe(
        (response: any) => {
          response = response;
          const notifications = getMore ? this.all.concat(response.results) : response.results;
          this.all = notifications.sort((a, b) => {
            const dateA = dayjs(a.created_on);
            const dateB = dayjs(b.created_on);
            if (dateA.isBefore(dateB)) {
              return 1;
            } else if (dateA.isAfter(dateB)) {
              return -1;
            } else {
              return 0;
            }
          });
          this.count = response.count;
          this.nextPage = response.next;
          this.prevPage = response.prev;
        },
        err => console.error(err)
      );
  }

  getNotificationCounts(): void {
    this.apiService.get(`${this.baseUrl}/count/`)
      .subscribe(
        counts => this._counts.next(counts),
        err => console.error(err)
      );
  }

  init() {
    if (!this.user.isCounselor) {
      this.setupPolling();
    }
  }

  markAllRead() {
    [...this.all].forEach(n => {
      if (!n.read) {
        this.markRead(n);
      }
    });
  }

  markRead(notification: INotification): void {
    this.apiService.patch(`${this.baseUrl}/${notification.id}/`, { read: true })
      .subscribe(
        (updatedNote: INotification) => {
          const idx = [...this.all].findIndex(n => n.id === updatedNote.id);
          this.all[idx] = updatedNote;
          this.getNotificationCounts();
        },
        err => console.error(err)
      );
  }

  private setupPolling() {
    if (this.stakeholderService.loggedIn && !this.polling) {
      this.startPolling();
    } else if (!this.stakeholderService.loggedIn && this.polling) {
      this.stopPolling();
    }
    this.stakeholderService.loggedIn$
      .subscribe(
        (isLoggedIn: boolean) => {
          if (isLoggedIn) {
            if (!this.polling) {
              this.startPolling();
            }
          } else if (this.polling) {
            this.stopPolling();
          }
        }
      );
  }

  private startPolling() {
    this.polling = setInterval(() => {
      this.getNotificationCounts();
    }, 15000);
  }

  private stopPolling() {
    clearInterval(this.polling);
  }

}
