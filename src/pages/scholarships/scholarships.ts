import { Component } from '@angular/core';
import { IonicPage, ItemSliding, NavController, NavParams, ToastController } from '@ionic/angular';
import { Subscription } from 'rxjs/Subscription';

import { SCHOLARSHIP_TILES } from '@nte/constants/scholarship.constants';
import { Filter } from '@nte/models/filter.model';
import { ICustomListTile } from '@nte/models/list-tile-custom.interface';
import { IListTile } from '@nte/models/list-tile.interface';
import { ListTileCreatePage } from './../../pages/list-tile-create/list-tile-create';
import { EnvironmentService } from '@nte/services/environment.service';
import { FilterService } from '@nte/services/filter.service';
import { MessageService } from '@nte/services/message.service';
import { MixpanelService } from '@nte/services/mixpanel.service';
import { ScholarshipListTileService } from '@nte/services/scholarship.list-tile.service';
import { ScholarshipService } from '@nte/services/scholarship.service';
import { StakeholderService } from '@nte/services/stakeholder.service';
import { FilterPage } from './../filter/filter';
import { ScholarshipsListPage } from './../scholarships-list/scholarships-list';

@IonicPage({
  name: `scholarships-page`,
  priority: `high`,
  segment: `/scholarships`
})
@Component({
  selector: `scholarships`,
  templateUrl: `scholarships.html`
})
export class ScholarshipsPage {
  public connections: any;
  public hiddenTiles: any = {};
  public recommendations: number;
  public tiles = Array<any>();

  private filterSub: Subscription;
  private params: any;
  private recSub: Subscription;
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

  constructor(navParams: NavParams,
    public messageService: MessageService,
    public navCtrl: NavController,
    private environment: EnvironmentService,
    private filterService: FilterService,
    private listTileService: ScholarshipListTileService,
    private mixpanel: MixpanelService,
    private scholarshipService: ScholarshipService,
    private stakeholderService: StakeholderService,
    private toastCtrl: ToastController) {
    this.connections = navParams.get(`connections`);
    this.tilesDefault = [...SCHOLARSHIP_TILES];
    this.params = navParams;
  }

  ionViewDidEnter() {
    this.mixpanel.event(`navigated_to-Scholarships`);
    if (this.params) {
      if (this.params.get(`newListTile`)) {
        this.setupNewTile(this.params.data.newList);
      } else if (this.params.get(`updatedListTile`)) {
        this.updateTile(this.params.data);
      }
      this.params = null;
    }
  }

  ionViewDidLoad() {
    this.tiles = [...this.tilesDefault];
    this.setupCustomLists();
    this.setupRecSub();
    this.initialize();
  }

  ionViewWillUnload() {
    this.tiles = new Array();
    if (this.filterSub) {
      this.filterSub.unsubscribe();
    }
    if (this.recSub) {
      this.recSub.unsubscribe();
    }
  }

  public deleteTile(tile: IListTile, _slidingItem: ItemSliding, tileIndex: number) {
    const deleteSub = this.scholarshipService.deleteList(tile.id).subscribe(
      () => {
        this.tiles.splice(tileIndex, 1);
        this.getListRemovedToast().present();
        deleteSub.unsubscribe();
      }
    );
  }

  public editTile(tile: IListTile, slidingItem: ItemSliding) {
    slidingItem.close();
    this.listTileService.setActiveList(tile);
    this.navCtrl.setPages([
      {
        page: ScholarshipsPage,
        params: {
          connections: this.connections
        }
      },
      {
        page: FilterPage,
        params: {
          cyol: true,
          filter: new Filter(this.filterCategories, tile.filter),
          listType: `Scholarships`,
          title: `Create Your Own List!`
        }
      },
      {
        page: ListTileCreatePage,
        params: {
          filter: new Filter(this.filterCategories, tile.filter),
          list: tile,
          page: `Scholarships`
        }
      }
    ]);
  }

  public openCreateModal() {
    const scholarshipFilters = new Filter(this.filterCategories);
    scholarshipFilters.clear();
    this.filterService.filter = scholarshipFilters;
    this.listTileService.setActiveList();
    this.navCtrl.push(
      FilterPage, {
        cyol: true,
        filter: scholarshipFilters,
        listType: `Scholarships`,
        title: `Create Your Own List!`
      }
    );
  }

  public viewList(tile: IListTile) {
    // if (this.mixpanelEvents[name]) {
    //   this.mixpanel.event(this.mixpanelEvents[name]);
    // }
    if (tile.name === `Create Your Own List!`) {
      this.openCreateModal();
    } else {
      this.listTileService.setActiveList(tile);
      this.scholarshipService.setBaseFilter(tile.filter);
      this.filterService.filter = new Filter(this.filterCategories, tile.filter);
      this.navCtrl.push(ScholarshipsListPage, {
        connections: this.connections,
        filter: this.filterService.filter,
        list: tile
      });
    }
  }

  private getListRemovedToast(showCloseButton: boolean = false) {
    return this.toastCtrl.create({
      duration: 3000,
      message: `List removed.`,
      position: `bottom`,
      showCloseButton
    });
  }

  private initialize() {
    this.scholarshipService.initializeFilters(this.user);
    this.scholarshipService.getScholarships();
    this.scholarshipService.getSavedScholarships();
    this.scholarshipService.getRecommendedScholarships(this.user.id);
  }

  private setupCustomLists() {
    const overviewSub = this.stakeholderService.getOverview().subscribe(
      (data) => {
        const customLists = data.custom_scholarship_queries;
        for (let i = 0, tile; tile = customLists[i]; i++) {
          this.setupNewTile(tile);
        }
        overviewSub.unsubscribe();
      },
      () => {
        this.showTileLoadingErrorToast();
      }
    );
  }

  private setupNewTile(tile: ICustomListTile | any) {
    if (tile && this.tileIds.indexOf(tile.id) === -1) {
      const newTile: IListTile = {
        colSpan: 4,
        filter: tile.query,
        iconUrl: tile.iconUrl || tile.image_url,
        id: tile.id,
        isCustom: true,
        isLocked: false,
        name: tile.name,
        order: this.tiles.length,
        serviceVariable: `scholarships`
      };
      this.tiles.push(newTile);
    }
  }

  private setupRecSub() {
    this.recSub = this.scholarshipService.recommendedScholarships
      .subscribe(
        (recs) => { this.recommendations = recs.length; }
      );
  }

  private showTileLoadingErrorToast() {
    if (!this.environment.isLocal) {
      // this.toastCtrl.create({
      //   duration: 3000,
      //   message: `Unable to load saved tile data`,
      //   position: `bottom`
      // }).present();
    }
  }

  private updateTile(data: any) {
    const updatedTile: any = this.activeTile;
    const newList = data.listTile;
    updatedTile.iconUrl = newList.iconUrl || newList.image_url;
    updatedTile.filter = newList.query;
    updatedTile.name = newList.name;
    this.listTileService.setActiveList(null);
  }

}
