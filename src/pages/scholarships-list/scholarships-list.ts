import { Component, ViewChild } from '@angular/core';
import { AbstractControl, FormControl } from '@angular/forms';
import {
  Content,
  InfiniteScroll,
  IonicPage,
  ModalController,
  NavController,
  NavParams,
  ToastController
} from '@ionic/angular';

import { SendComponent } from '@nte/components/send/send';
import { COLLEGE_NON_PROFIT_QUERY } from '@nte/constants/college.constants';
import { EMPTY_STATES } from '@nte/constants/scholarship.constants';
import { IEmptyState } from '@nte/models/empty-state';
import { ConnectionService } from '@nte/services/connection.service';
import { FilterService } from '@nte/services/filter.service';
import { KeyboardService } from '@nte/services/keyboard.service';
import { MixpanelService } from '@nte/services/mixpanel.service';
import { ScholarshipListTileService } from '@nte/services/scholarship.list-tile.service';
import { ScholarshipService } from '@nte/services/scholarship.service';
import { StakeholderService } from '@nte/services/stakeholder.service';
import { FilterPage } from './../filter/filter';
import { ScholarshipPage } from './../scholarship/scholarship';

@IonicPage({
  name: `scholarships-list-page`,
  segment: `/scholarships/list`
})
@Component({
  selector: `scholarships-list`,
  templateUrl: `scholarships-list.html`
})
export class ScholarshipsListPage {

  get user() {
    return this.stakeholderService.stakeholder;
  }

  @ViewChild(Content) public content: Content;

  public emptyState: IEmptyState;
  public fetchingScholarships: boolean;
  public filterDefault: any;
  @ViewChild(InfiniteScroll) public infiniteScroll: InfiniteScroll;
  public isSavingIndex: number;
  public list: any;
  public listName: string;
  public nonProfitQuery = COLLEGE_NON_PROFIT_QUERY;
  public placeholders = [null, null, null];
  public scholarships = [];
  public searchControl: AbstractControl = new FormControl(``);
  public searchTerm: string = ``;

  private filtering: boolean;

  constructor(public connectionService: ConnectionService,
    public filterService: FilterService,
    public keyboard: KeyboardService,
    public modalCtrl: ModalController,
    public navCtrl: NavController,
    public params: NavParams,
    public scholarshipService: ScholarshipService,
    private listTileService: ScholarshipListTileService,
    private mixpanel: MixpanelService,
    private stakeholderService: StakeholderService,
    private toastCtrl: ToastController) {
    if (this.params.get(`list`)) {
      this.list = this.params.get(`list`);
    } else {
      this.list = this.listTileService.activeList;
    }
  }

  public clearSearch(_event: any) {
    this.searchTerm = ``;
    this.updateList();
  }

  public closeKeyboard(event: any) {
    if (event) { event.stopPropagation(); }
    this.keyboard.close();
  }

  public ionViewWillEnter() {
    if (this.list.isCustom || this.filtering) {
      this.updateList();
      this.filtering = false;
    }
    this.emptyState = EMPTY_STATES[this.list.name] || EMPTY_STATES[`Search All`];
  }

  public loadMore(_event: Event) {
    if (this.list.name === `Search All`) {
      setTimeout(
        () => {
          const hasQuery = (this.filterService.filter && this.filterService.filter.queries) ? true : false;
          this.scholarshipService.getScholarships(
            this.scholarshipService.nextPage,
            true,
            hasQuery
          );
        },
        500
      );
    }
  }

  public openFilters(event: any) {
    if (event) { event.stopPropagation(); }
    this.filtering = true;
    this.navCtrl.push(
      FilterPage,
      {
        cyol: false,
        filter: this.filterService.filter,
        listType: `Scholarships`
      }
    );
  }

  public openSendModal(scholarship: any) {
    const sendItem = scholarship.scholarship ? scholarship.scholarship : scholarship;
    const sendModal = this.modalCtrl.create(
      SendComponent,
      {
        imageUrl: `assets/image/avatar/scholarship-green.svg`,
        item: sendItem,
        type: `Scholarship`
      },
      {
        cssClass: `smallModal`,
        enableBackdropDismiss: true,
        showBackdrop: false
      }
    );
    sendModal.present();
  }

  public remove(scholarship: any) {
    if (scholarship.scholarship && scholarship.scholarship.id) {
      scholarship = scholarship.scholarship;
    }
    scholarship.saved = false;
    scholarship.applying = false;
    this.scholarshipService.removeScholarship(scholarship).subscribe(
      (_response) => {
        const toast = this.toastCtrl.create({
          closeButtonText: `UNDO`,
          duration: 3000,
          message: `Scholarship removed.`,
          position: `bottom`,
          showCloseButton: true
        });
        toast.present();
        toast.onDidDismiss((_data, role) => {
          if (role === `close`) { // this.listName !== 'Recommended' &&
            this.save(scholarship);
          }
        });
      }
    );
  }

  public removeRec(recId: number, hideToast?: boolean) {
    this.scholarshipService.studentRemoveRecommended(recId, this.user.id).subscribe(
      (_response) => {
        if (!hideToast) {
          const toast = this.toastCtrl.create({
            duration: 3000,
            message: `Recommendation removed.`,
            position: `bottom`,
            showCloseButton: false
          });
          toast.present();
        }
      }
    );
  }

  public resetSavingIndex() {
    this.isSavingIndex = undefined;
  }

  public save(scholarship: any) {
    const isExisting = scholarship.saved;
    const scholarId = scholarship.scholarship ? scholarship.scholarship.id : scholarship.id;
    const recId = scholarship.scholarship ? scholarship.id : null;
    // scholarship.applying = isApplying;
    // if (isApplying) {
    //   const applyModal = this.modalCtrl.create(
    //     ApplicationDatesComponent // TODO
    //   );
    //   applyModal.present();
    //   applyModal.onDidDismiss((data, role) => {
    //     if (data.applying && this.recommendationId) {
    //       this.removeRecommendation();
    //     }
    //   });
    // } else {
    //  this.scholarship.saved = !isApplying;
    this.mixpanel.event(`scholarship saved`, { 'scholarship name': scholarship.name });
    this.scholarshipService.saveScholarship(scholarId, isExisting, false)
      .subscribe((response) => {
        scholarship.saved = response.scholarship.saved;
        const toast = this.toastCtrl.create({
          closeButtonText: `UNDO`,
          duration: 3000,
          message: `Saved!`,
          position: `bottom`,
          showCloseButton: true
        });
        toast.present();
        toast.onDidDismiss((_data, role) => {
          if (this.listName !== `Recommended` && role === `close`) {
            this.remove(scholarship);
          }
        });
        this.resetSavingIndex();
        if (recId) {
          this.removeRec(recId, true);
        }
      });
  }

  public scrollToTop() {
    this.content.scrollToTop();
  }

  public search(event: any) {
    if (event) { event.stopPropagation(); }
    this.mixpanel.event(`search_entered`, {
      'search term entered': this.searchTerm,
      'page': `Scholarships`
    });
    this.updateList();
  }

  public setSavingIndex(savingIndex: number) {
    this.isSavingIndex = savingIndex;
  }

  public viewScholarship(scholarship: any) {
    let schParams: any = {};
    if (scholarship.scholarship && scholarship.scholarship.id) {
      schParams = {
        id: scholarship.scholarship.id,
        scholarship: scholarship.scholarship
      };
      if (this.list.name === `Recommended`) {
        schParams.recommendation = scholarship;
      } else {
        schParams.tracker = scholarship;
      }
    } else {
      schParams = {
        id: scholarship.id,
        scholarship
      };
    }
    this.navCtrl.push(
      ScholarshipPage,
      schParams
    );
  }

  // PRIVATE METHODS

  // private getConnections() {
  //   if (this.user.isParent && !this.user.students) {
  //     const studentSub = this.stakeholderService.getStudentsForParent()
  //       .subscribe(
  //         (data) => {
  //           this.user.students = data;
  //           studentSub.unsubscribe();
  //         }
  //       );
  //   }
  // }

  // private getScholarshipFilter() {
  //   const scholarshipSub = this.scholarshipService.getFilters()
  //     .subscribe(
  //       (filter) => {
  //         let query = this.scholarshipService.baseFilter;
  //         if (query && query.charAt(0) === '?') {
  //           query = query.substring(1);
  //         }
  //         this.initialFilters = new filter.filter(query);
  //         this.filterService.filter = this.initialFilters;
  //         this.filterService.filter.updateQuery();
  //         scholarshipSub.unsubscribe();
  //       },
  //       err => console.error(err)
  //     );
  // }

  private updateList() {
    let query: string = ``;
    if (this.filterService.filter) {
      query = this.filterService.filter.updateQuery();
    }
    if (this.searchTerm && this.searchTerm !== ``) {
      query += `&search=${this.searchTerm}`;
    }
    query = this.filterService.trimQuery(query);
    this.scholarshipService.getScholarships(query);
  }

}
