import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { File } from '@ionic-native/file/ngx';
import { Events, ToastController } from '@ionic/angular';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { IEmptyState } from '@nte/interfaces/empty-state.interface';
import { LinkService } from '@nte/services/link.service';
import { MixpanelService } from '@nte/services/mixpanel.service';
import { NavStateService } from '@nte/services/nav-state.service';
import { TaskService } from '@nte/services/task.service';

@Component({
  selector: `task-attachments`,
  templateUrl: `task-attachments.html`,
  styleUrls: [`task-attachments.scss`]
})
export class TaskAttachmentsPage implements OnDestroy {
  public attachmentsEmptyState: IEmptyState = {
    body: `Attach a document, photo, or spreadsheet relevant to this task.`,
    imagePath: `task/detail_attachments`,
    title: `This task doesn’t have an attachment.`
  };
  public isLoading: boolean;
  public taskTracker: any;

  private ngUnsubscribe: Subject<any> = new Subject();
  private transfer: any; // FileTransferObject;

  get attachmentName() {
    return this.taskTracker.attachment ? this.taskTracker.attachment_file_name :
      this.taskTracker.templates[0].file_name;
  }

  get attachmentUrl() {
    return this.taskTracker.attachment ? this.taskTracker.attachment :
      this.taskTracker.templates[0].file;
  }

  get hasAttachment() {
    return (this.taskTracker.templates && this.taskTracker.templates.length > 0) || this.taskTracker.attachment;
  }

  constructor(public router: Router,
    private events: Events,
    private file: File,
    private linkService: LinkService,
    private mixpanel: MixpanelService,
    private taskService: TaskService,
    private toastCtrl: ToastController,
    navStateService: NavStateService) {
    const params: any = navStateService.data;
    this.taskTracker = params.taskTracker;
    // this.transfer = this.fileTransfer.create();
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  public download() {
    this.isLoading = true;
    this.transfer.download(this.attachmentUrl, this.file.dataDirectory + this.attachmentName)
      .then(
        (response) => {
          this.mixpanel.event(`file_downloaded`, {
            'task title': this.taskTracker.task.name
          });
          const downloadUrl = response.toURL();
          this.linkService.open(downloadUrl);
          this.isLoading = false;
        },
        async () => {
          this.isLoading = false;
          const toast = await this.toastCtrl.create({
            duration: 5000,
            message: `Can't download file.`
          });
          toast.present();
        }
      );
  }

  public upload(event) {
    this.isLoading = true;
    const file = event.target.files[0];
    this.taskService.uploadFile(this.taskTracker.id, file)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        (task) => {
          this.mixpanel.event(`file_uploaded`, {
            'task title': this.taskTracker.task.name
          });
          this.taskTracker = task;
          this.events.publish(`taskChange`, { taskTracker: this.taskTracker });
          this.isLoading = false;
        },
        async () => {
          this.isLoading = false;
          const toast = await this.toastCtrl.create({
            duration: 5000,
            message: `Can't upload file. Please ensure it is < 5 MB.`
          });
          toast.present();
        }
      );
  }
}
