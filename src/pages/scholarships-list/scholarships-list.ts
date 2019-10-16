import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IonInfiniteScroll, ModalController, ToastController } from '@ionic/angular';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { SendComponent } from '@nte/components/send/send';
import { COLLEGE_NON_PROFIT_QUERY } from '@nte/constants/college.constants';
import { EMPTY_STATES } from '@nte/constants/scholarship.constants';
import { ConnectionService } from '@nte/services/connection.service';
import { FilterService } from '@nte/services/filter.service';
import { MixpanelService } from '@nte/services/mixpanel.service';
import { NavStateService } from '@nte/services/nav-state.service';
import { ScholarshipListTileService } from '@nte/services/scholarship.list-tile.service';
import { ScholarshipService } from '@nte/services/scholarship.service';
import { StakeholderService } from '@nte/services/stakeholder.service';

@Component({
  selector: `scholarships-list`,
  templateUrl: `scholarships-list.html`,
  styleUrls: [`scholarships-list.scss`]
})
export class ScholarshipsListPage implements OnInit, OnDestroy {
  @ViewChild(`Content`, { static: false }) public content;
  @ViewChild(IonInfiniteScroll, { static: false }) public infiniteScroll: IonInfiniteScroll;

  public fetchingScholarships: boolean;
  public filterDefault: any;
  public isSavingIndex: number;
  public list: any;
  public listName: string;
  public nonProfitQuery = COLLEGE_NON_PROFIT_QUERY;
  public placeholders = [null, null, null];
  public scholarships = [];
  public searchControl: AbstractControl = new FormControl(``);
  public searchTerm: string = ``;

  private filtering: boolean;
  private ngUnsubscribe: Subject<any> = new Subject();

  get emptyState() {
    return EMPTY_STATES[this.listNameVal || `Search All`];
  }

  get itemsAreTrackers() {
    return this.listNameVal === 'Applying' || this.listNameVal === 'Saved';
  }

  get listNameVal() {
    return this.list && this.list.name ? this.list.name : this.listName;
  }

  get ships() {
    if (this.list && this.list.providerVariable) {
      const scholarships = this.scholarshipService[this.list.providerVariable];
      if (this.itemsAreTrackers) {
        return scholarships.map(t => {
          t.tracker_id = t.id;
          return Object.assign(t, t.scholarship);
        });
      } else if (this.listNameVal === 'Recommended') {
        return scholarships.map(r => {
          r.rec_id = r.id;
          return Object.assign(r, r.scholarship);
        });
      } else {
        return scholarships;
      }
    } else {
      return [];
    }
  }

  get ships$() {
    if (this.list && this.list.providerVariable) {
      return this.scholarshipService[this.list.providerVariable];
    }
  }

  get user() {
    return this.stakeholderService.stakeholder;
  }

  constructor(public connectionService: ConnectionService,
    public filterService: FilterService,
    public modalCtrl: ModalController,
    public router: Router,
    public scholarshipService: ScholarshipService,
    private listTileService: ScholarshipListTileService,
    private mixpanel: MixpanelService,
    private route: ActivatedRoute,
    private stakeholderService: StakeholderService,
    private toastCtrl: ToastController,
    navStateService: NavStateService) {
    const params: any = navStateService.data;
    this.list = (params && params.list) ? params.list : (this.listTileService.activeList || null);
  }

  ngOnInit() {
    this.updateList();
    this.filtering = false;
    // if ((this.list && this.list.isCustom) || this.filtering) {
    // }
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  public clearSearch(_event: any) {
    this.searchTerm = ``;
    this.updateList();
  }

  public closeKeyboard(event: any) {
    if (event) { event.stopPropagation(); }
    // this.keyboard.close();
  }

  public loadMore(_event: Event) {
    if (this.list.name === `Search All`) {
      setTimeout(
        () => {
          const filter = this.filterService.filter;
          const hasQuery = (filter && filter.queries) ? true : false;
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

  public openFilters() {
    this.filtering = true;
    this.router.navigate(
      [`filter`],
      {
        relativeTo: this.route,
        state: {
          cyol: false,
          filter: this.filterService.filter,
          listType: `Scholarships`
        }
      }
    );
  }

  public async openSendModal(scholarship: any) {
    const modal = await this.modalCtrl.create({
      backdropDismiss: true,
      component: SendComponent,
      componentProps: {
        imageUrl: `assets/image/avatar/scholarship-green.svg`,
        item: scholarship.scholarship || scholarship,
        type: `Scholarship`
      },
      cssClass: `smallModal`,
      showBackdrop: false
    });
    return await modal.present();
  }

  public remove(scholarship: any) {
    if (scholarship.scholarship && scholarship.scholarship.id) {
      scholarship = scholarship.scholarship;
    }
    scholarship.saved = false;
    scholarship.applying = false;
    this.scholarshipService.removeScholarship(scholarship)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(() => this.openRemoveToast(scholarship));
  }

  public removeRec(recId: number, hideToast?: boolean) {
    this.scholarshipService.studentRemoveRecommended(recId, this.user.id)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((_response) => {
        if (!hideToast) {
          this.openRemoveRecToast();
        }
      });
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
    //   applyModal.onDidDismiss().then((data, role) => {
    //     if (data.applying && this.recommendationId) {
    //       this.removeRecommendation();
    //     }
    //   });
    // } else {
    //  this.scholarship.saved = !isApplying;
    this.mixpanel.event(
      `scholarship saved`,
      { 'scholarship name': scholarship.name }
    );
    this.scholarshipService.saveScholarship(scholarId, isExisting, false)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        (response) => {
          scholarship.saved = response.scholarship.saved;
          this.openSaveToast(scholarship);
          this.resetSavingIndex();
          if (recId) {
            this.removeRec(recId, true);
          }
        }
      );
  }

  public scrollToTop() {
    this.content.scrollToTop();
  }

  public search(event: any) {
    if (event) {
      this.searchTerm = event.detail.value;
      this.mixpanel.event(
        `search_entered`,
        {
          'search term entered': this.searchTerm,
          page: `Scholarships`
        }
      );
      this.updateList();
    }
  }

  public setSavingIndex(savingIndex: number) {
    this.isSavingIndex = savingIndex;
  }

  public viewScholarship(scholarship: any) {
    let params: any = {};
    if (scholarship.scholarship && scholarship.scholarship.id) {
      params = {
        id: scholarship.scholarship.id,
        scholarship: scholarship.scholarship
      };
      if (this.list.name === `Recommended`) {
        params.recommendation = scholarship;
      } else {
        params.tracker = scholarship;
      }
    } else {
      params = {
        id: scholarship.id,
        scholarship
      };
    }
    this.router.navigate(
      [
        `scholarship`,
        scholarship.id
      ],
      {
        relativeTo: this.route,
        state: params
      }
    );
  }

  // PRIVATE METHODS

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

  private async openRemoveToast(scholarship) {
    const toast = await this.toastCtrl.create({
      buttons: [{
        handler: () => this.save(scholarship),
        text: 'Undo'
      }],
      duration: 3000,
      message: `Scholarship removed.`,
      position: `bottom`
    });
    toast.present();
  }

  private async openRemoveRecToast() {
    const toast = await this.toastCtrl.create({
      duration: 3000,
      message: `Recommendation removed.`,
      position: `bottom`
    });
    toast.present();
  }

  private async openSaveToast(scholarship: any) {
    const toast = await this.toastCtrl.create({
      buttons: [{
        handler: () => {
          if (this.listName !== `Recommended`) {
            this.remove(scholarship);
          }
        },
        text: 'Undo'
      }],
      duration: 3000,
      message: `Scholarship saved.`,
      position: `bottom`
    });
    toast.present();
  }

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
