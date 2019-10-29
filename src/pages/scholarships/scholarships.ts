import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonItemSliding, ToastController } from '@ionic/angular';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { SCHOLARSHIP_TILES } from '@nte/constants/scholarship.constants';
import { ICustomListTile } from '@nte/interfaces/list-tile-custom.interface';
import { IListTile } from '@nte/interfaces/list-tile.interface';
import { Filter } from '@nte/models/filter.model';
import { EnvironmentService } from '@nte/services/environment.service';
import { FilterService } from '@nte/services/filter.service';
import { MessageService } from '@nte/services/message.service';
import { MixpanelService } from '@nte/services/mixpanel.service';
import { NavStateService } from '@nte/services/nav-state.service';
import { ScholarshipListTileService } from '@nte/services/scholarship.list-tile.service';
import { ScholarshipService } from '@nte/services/scholarship.service';
import { StakeholderService } from '@nte/services/stakeholder.service';

@Component({
  selector: `scholarships`,
  templateUrl: `scholarships.html`,
  styleUrls: [
    `../../app/components/tiles/tiles.scss`
  ]
})
export class ScholarshipsPage implements OnInit, OnDestroy {
  public connections: any;
  public hiddenTiles: any = {};
  public recommendations: number;
  public tiles = Array<any>();

  private ngUnsubscribe: Subject<any> = new Subject();
  private params: any;
  private tilesDefault: IListTile[];

  get activeTile() {
    return this.listTileService.activeList;
  }

  get filterCategories() {
    return this.scholarshipService.filter ? [...this.scholarshipService.filter.categories] : null;
  }

  get tileIds() {
    return this.tiles.map((tile) => tile.id);
  }

  get user() {
    return this.stakeholderService.stakeholder;
  }

  constructor(
    public messageService: MessageService,
    public router: Router,
    private environment: EnvironmentService,
    private filterService: FilterService,
    private listTileService: ScholarshipListTileService,
    private mixpanel: MixpanelService,
    private route: ActivatedRoute,
    private scholarshipService: ScholarshipService,
    private stakeholderService: StakeholderService,
    private toastCtrl: ToastController,
    navStateService: NavStateService) {
    this.params = navStateService.data;
    this.connections = this.params.connections;
    this.tilesDefault = [...SCHOLARSHIP_TILES];
  }

  ngOnInit() {
    this.tiles = [...this.tilesDefault];
    this.setupCustomLists();
    this.setupRecSub();
    this.initialize();
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    this.tiles = new Array();
  }

  ionViewDidEnter() {
    this.mixpanel.event(`navigated_to-Scholarships`);
    if (this.params) {
      if (this.params.newListTile) {
        this.setupNewTile(this.params.data.newList);
      } else if (this.params.updatedListTile) {
        this.updateTile(this.params.data);
      }
      this.params = null;
    }
  }

  public deleteTile(tile: IListTile, _slidingItem: IonItemSliding, tileIndex: number) {
    this.scholarshipService.deleteList(tile.id)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        () => {
          this.tiles.splice(tileIndex, 1);
          this.openRemovedToast();
        }
      );
  }

  public editTile(tile: IListTile, slidingItem: IonItemSliding) {
    slidingItem.close();
    this.listTileService.activeList = tile;
    const listName = tile.name.toLowerCase().replace(' all', '');
    this.router.navigate(
      [
        `list`,
        listName,
        `edit`
      ],
      {
        relativeTo: this.route,
        state: {
          connections: this.connections,
          cyol: true,
          filter: new Filter(this.filterCategories, tile.filter),
          list: tile,
          listType: `Scholarships`,
          page: `Scholarships`,
          title: `Create Your Own List!`
        }
      }
    );
  }

  public openCreateModal() {
    const scholarshipFilters = new Filter(this.filterCategories);
    scholarshipFilters.clear();
    this.filterService.filter = scholarshipFilters;
    this.listTileService.activeList = null;
    this.router.navigate(
      [
        'list',
        'create'
      ],
      {
        relativeTo: this.route,
        state: {
          cyol: true,
          filter: scholarshipFilters,
          listType: `Scholarships`,
          page: `Scholarships`,
          title: `Create Your Own List!`
        }
      }
    );
  }

  public viewList(listTile: IListTile) {
    // if (this.mixpanelEvents[name]) {
    //   this.mixpanel.event(this.mixpanelEvents[name]);
    // }
    if (listTile.name === `Create Your Own List!`) {
      this.openCreateModal();
    } else {
      this.listTileService.activeList = listTile;
      this.scholarshipService.setBaseFilter(listTile.filter);
      this.filterService.filter = new Filter(
        this.filterCategories,
        listTile.filter
      );
      const listName = listTile.name.toLowerCase().replace(' all', '');
      this.router.navigate(
        [
          `list`,
          listName
        ],
        {
          relativeTo: this.route,
          state: {
            connections: this.connections,
            filter: this.filterService.filter,
            list: listTile
          }
        }
      );
    }
  }

  private initialize() {
    this.scholarshipService.initializeFilters(this.user);
    this.scholarshipService.getScholarships();
    this.scholarshipService.getSavedScholarships();
    this.scholarshipService.getRecommendedScholarships(this.user.id);
  }

  private async openRemovedToast(showCloseButton: boolean = false) {
    const toast = await this.toastCtrl.create({
      duration: 3000,
      message: `List removed.`,
      position: `bottom`,
      showCloseButton
    });
    toast.present();
  }

  private async openTileLoadingErrorToast() {
    if (!this.environment.isLocal) {
      // const toast = await this.toastCtrl.create({
      //   duration: 3000,
      //   message: `Can't load saved tile data.`,
      //   position: `bottom`
      // });
      // toast.present();
    }
  }

  private setupCustomLists() {
    this.stakeholderService.getOverview()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        (data: any) => data.custom_scholarship_queries.forEach(t => this.setupNewTile(t)),
        () => this.openTileLoadingErrorToast()
      );
  }

  private setupNewTile(tile: ICustomListTile | any) {
    if (tile && this.tileIds.indexOf(tile.id) === -1) {
      this.tiles.push({
        colSpan: 4,
        filter: tile.query,
        iconUrl: tile.iconUrl || tile.image_url,
        id: tile.id,
        isCustom: true,
        isLocked: false,
        name: tile.name,
        order: this.tiles.length,
        serviceVariable: `scholarships`
      });
    }
  }

  private setupRecSub() {
    this.scholarshipService.recommended$
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(recs => this.recommendations = recs.length);
  }

  private updateTile(data: any) {
    const updatedTile: any = this.activeTile;
    const newList = data.listTile;
    updatedTile.iconUrl = newList.iconUrl || newList.image_url;
    updatedTile.filter = newList.query;
    updatedTile.name = newList.name;
    this.listTileService.activeList = null;
  }

}
