import { Component } from '@angular/core';
import { NativeStorage } from '@ionic-native/native-storage';
import { IonicPage, ItemSliding, NavController, NavParams, ToastController } from 'ionic-angular';
import { indexOf, pullAll, words, zipObject } from 'lodash';
import { Subscription } from 'rxjs/Subscription';

import { COLLEGE_NON_PROFIT_QUERY, COLLEGE_TILES, EMPTY_STATES } from '@nte/constants/college.constants';
import { Filter } from '@nte/models/filter.model';
import { IListTile } from '@nte/models/list-tile.interface';
import { ListTileCreatePage } from './../../pages/list-tile-create/list-tile-create';
import { CollegeListTileService } from '@nte/services/college.list-tile.service';
import { CollegeService } from '@nte/services/college.service';
import { EnvironmentService } from '@nte/services/environment.service';
import { FilterService } from '@nte/services/filter.service';
import { MessageService } from '@nte/services/message.service';
import { MixpanelService } from '@nte/services/mixpanel.service';
import { StakeholderService } from '@nte/services/stakeholder.service';
import { CollegesListPage } from './../colleges-list/colleges-list';
import { FilterPage } from './../filter/filter';
import { MessagingPage } from './../messaging/messaging';

@IonicPage({
  name: `colleges-page`,
  priority: `high`,
  segment: `/colleges`
})
@Component({
  selector: `colleges`,
  templateUrl: `colleges.html`
})
export class CollegesPage {
  public connections: any;
  public emptyStates: any = EMPTY_STATES;
  public hiddenTiles: any = {};
  public recommendations: number;
  public showTiles: boolean = true;
  public tiles: any[] = new Array();
  public title: string = `Colleges`;

  private defaultFilterCategories: any;
  private defaultFilters: Filter;
  private mixpanelEvents = {
    Matching: `navigated_to-Colleges-Matching`,
    Recommended: `navigated_to-Colleges-Recommendations`,
    Saved: `navigated_to-Colleges-Saved`
  };
  private recSub: Subscription;
  private userId: string;

  get activeTile() {
    return this.listTileService.activeList;
  }

  get filterCategories() {
    return this.defaultFilterCategories || [];
  }

  get tileIds() {
    return this.tiles.map(tile => tile.id);
  }

  get tileNames() {
    if (this.tiles && this.tiles.length) {
      return this.tiles.map(tile => tile.name);
    } else {
      return [];
    }
  }

  get user() {
    return this.stakeholderService.stakeholder;
  }

  constructor(
    public messageService: MessageService,
    public navCtrl: NavController,
    private collegeService: CollegeService,
    private environment: EnvironmentService,
    private filterService: FilterService,
    private listTileService: CollegeListTileService,
    private mixpanel: MixpanelService,
    private nativeStorage: NativeStorage,
    private params: NavParams,
    private stakeholderService: StakeholderService,
    private toastCtrl: ToastController
  ) {
    this.connections = params.get(`connections`);
  }

  ionViewDidEnter() {
    this.mixpanel.event(`navigated_to-Colleges`);
    this.collegeService.initializeRecommendations(
      this.user.id,
      this.user.isParent
    );
    if (this.params) {
      if (this.params.get(`newListTile`)) {
        this.setupNewTile(this.params.data.newList);
      } else if (this.params.get(`updatedListTile`)) {
        this.updateTile(this.params.data);
      }
    }
  }

  ionViewDidLoad() {
    this.tiles = [...COLLEGE_TILES];
    this.setupTiles();
    this.setupRecSub();
    this.initialize();
  }

  ionViewWillUnload() {
    this.tiles = new Array();
    if (this.recSub) {
      this.recSub.unsubscribe();
    }
  }

  public determineColumns(tile: IListTile, index: number, colNum: number) {
    const cyol = `Create Your Own List!`;
    const doubleWidth = colNum === 8 ? true : null;
    if (index === 5 && this.tiles[6].name === cyol) {
      return doubleWidth;
    } else if (tile.colSpan === colNum) {
      return true;
    } else if (name === cyol) {
      const cyolIndex = indexOf(
        this.tiles,
        tileObj => tileObj.name === cyol
      );
      if (cyolIndex + 1 === this.tiles.length) {
        if (index % 3 === 1 || index === 6) {
          return colNum === 12 ? true : null;
        } else {
          return doubleWidth;
        }
      } else {
        return doubleWidth;
      }
    }
  }

  public editTile(tile: IListTile, slidingItem: ItemSliding) {
    slidingItem.close();
    this.listTileService.activeList = (tile);
    this.navCtrl.setPages([
      {
        page: CollegesPage,
        params: {
          connections: this.connections
        }
      },
      {
        page: FilterPage,
        params: {
          cyol: true,
          filter: new Filter(this.filterCategories, tile.filter),
          listType: `Colleges`,
          title: `Create Your Own List!`
        }
      },
      {
        page: ListTileCreatePage,
        params: {
          filter: new Filter(this.filterCategories, tile.filter),
          list: tile,
          page: `Colleges`
        }
      }
    ]);
  }

  public goToMessaging() {
    this.navCtrl.push(MessagingPage, { teamMembers: this.connections });
  }

  public hideTile(tile: any, slidingItem: ItemSliding, _index?: number) {
    if (tile.isCustom) {
      this.deleteCustomList(tile);
    } else {
      this.hiddenTiles[tile.name] = true;
      this.updateHiddenTiles(this.hiddenTiles);
      const hideToast = this.getListRemovedToast(true);
      hideToast.onDidDismiss((_data, role) => {
        if (role === `close`) {
          slidingItem.close();
          this.hiddenTiles[tile.name] = false;
          this.updateHiddenTiles(this.hiddenTiles);
        }
      });
      hideToast.present();
    }
  }

  public openCreateModal() {
    const collegeFilters = new Filter(
      this.filterCategories,
      COLLEGE_NON_PROFIT_QUERY
    );
    collegeFilters.clear();
    this.filterService.filter = collegeFilters;
    this.listTileService.activeList = null;
    this.navCtrl.push(FilterPage, {
      cyol: true,
      filter: collegeFilters,
      listType: `Colleges`,
      title: `Create Your Own List!`
    });
  }

  public shouldHide(tile: IListTile) {
    if (tile && tile.stakeholder_type) {
      return tile.stakeholder_type !== this.user.stakeholder_type;
    } else {
      return false;
    }
  }

  public updateTile(updatedTile: any) {
    if (updatedTile) {
      let tile: any = this.activeTile;
      if (!tile) {
        tile = this.tiles.filter(t => t.id === updatedTile.id)[0];
      }
      tile.filter = updatedTile.query;
      tile.id = updatedTile.id;
      tile.iconUrl = updatedTile.mobile_image_url || updatedTile.image_url;
    }
    this.listTileService.activeList = null;
  }

  public viewList(tile: IListTile) {
    if (this.mixpanelEvents[tile.name]) {
      this.mixpanel.event(this.mixpanelEvents[tile.name]);
    }
    if (tile.name === `Create Your Own List!`) {
      this.openCreateModal();
    } else {
      if (tile.name !== `Near You`) {
        if (tile.filter) {
          this.collegeService.setBaseFilter(tile.filter);
        }
        this.filterService.filter = new Filter(
          this.filterCategories,
          tile.filter
        );
      }
      this.navCtrl.push(CollegesListPage, {
        connections: this.connections,
        filter: this.filterService.filter,
        list: tile
      });
    }
  }

  private deleteCustomList(tile: any) {
    const deleteSub = this.collegeService
      .deleteCustomList(tile.id)
      .subscribe(_response => {
        this.tiles = this.tiles.filter(t => t.id !== tile.id);
        this.getListRemovedToast().present();
        deleteSub.unsubscribe();
      });
  }

  private getFilters() {
    const collegeSub = this.collegeService.getCollegeFilter()
      .subscribe(
        response => {
          const filter = response.json();
          this.defaultFilterCategories = filter[0].subCategories;
          this.defaultFilters = new Filter(
            this.defaultFilterCategories,
            COLLEGE_NON_PROFIT_QUERY
          );
          this.filterService.filter = this.defaultFilters;
          this.filterService.filter.updateQuery();
          collegeSub.unsubscribe();
        },
        err => console.error(err)
      );
  }

  private getListRemovedToast(showCloseButton: boolean = false) {
    return this.toastCtrl.create({
      duration: 3000,
      message: `List removed.`,
      position: `bottom`,
      showCloseButton,
      closeButtonText: `Undo`
    });
  }

  private initialize() {
    this.getFilters();
    this.collegeService.initializeColleges();
    this.collegeService.initializeSaved(this.user.id, this.user.isParent);
    if (!this.user.isParent) {
      this.collegeService.getMatchingColleges();
    }
  }

  private setupCustomListTiles() {
    const customListSub = this.collegeService
      .getCustomLists()
      .subscribe(lists => {
        lists.forEach(list => this.setupNewTile(list));
        customListSub.unsubscribe();
      });
  }

  private setupNewTile(tile: any) {
    if (tile && this.tileIds.indexOf(tile.id) === -1) {
      tile.iconUrl = tile.mobile_image_url || tile.image_url;
      const newTile = {
        colSpan: 4,
        filter: tile.query,
        iconUrl: tile.iconUrl,
        id: tile.id,
        isCustom: true,
        name: tile.name,
        serviceVariable: `collegeList`
      };
      this.tiles.push(newTile);
    }
  }

  private setupPremadeListTiles() {
    const listSub = this.collegeService.getPremadeLists()
      .subscribe((lists: any[]) => {
        if (lists && lists.length > 0) {
          lists.forEach((list: any) => {
            const idx = this.tiles.findIndex(t => t.name === list.name);
            if (idx) {
              this.tiles[idx].filter += `&tag=${list.id}`;
            }
          });
        }
        listSub.unsubscribe();
      });
  }

  private setupRecSub() {
    this.recSub = this.collegeService.recommendationsCount
      .subscribe(count => {
        if ((!count || count === null) && count !== 0) {
          return;
        } else {
          this.recommendations = count;
        }
      });
  }

  private setupTiles() {
    this.userId = this.user.id.toString();
    this.nativeStorage
      .getItem(this.userId)
      .then(
        storedItems => {
          const tilesToHide = {};
          if (storedItems.hiddenTiles && storedItems.hiddenTiles.length > 0) {
            storedItems.hiddenTiles.forEach((val, key) => {
              if (val) {
                tilesToHide[key] = val;
              }
            });
          }
          const tileNamesToHide = Object.keys(tilesToHide);
          if (tileNamesToHide.length > 0) {
            this.hiddenTiles = tilesToHide;
            pullAll(this.tileNames, tileNamesToHide);
          } else {
            this.hiddenTiles = {};
            this.tileNames.forEach(t => this.hiddenTiles[t] = false);
            this.updateHiddenTiles(this.hiddenTiles);
          }
        },
        err => {
          if (err.code === 2) {
            this.hiddenTiles = zipObject(
              this.tileNames,
              this.tileNames.map(() => false)
            );
            this.updateHiddenTiles(this.hiddenTiles, true);
          } else {
            this.showTileLoadingErrorToast();
          }
        }
      )
      .catch(err => console.error(err));
    this.tiles.forEach(tile => {
      const fileWords = words(tile.name);
      tile.iconFileName = fileWords[0].toLowerCase();
      tile.iconUrl = `assets/image/college/tile_${tile.iconFileName}.svg`;
      tile.columns = `col-${tile.colSpan}`;
    });
    this.setupPremadeListTiles();
    this.setupCustomListTiles();
  }

  private showTileLoadingErrorToast() {
    if (!this.environment.isLocal) {
      // this.toastCtrl
      //   .create({
      //     duration: 3000,
      //     message: `Unable to load saved tile data`,
      //     position: `bottom`
      //   })
      //   .present();
    }
  }

  private updateHiddenTiles(hiddenTiles: any, notFound?: boolean) {
    if (notFound) {
      this.nativeStorage.setItem(this.userId, { hiddenTiles });
    } else {
      this.nativeStorage
        .getItem(this.userId)
        .then(
          storedItems => {
            storedItems.hiddenTiles = hiddenTiles;
            this.nativeStorage.setItem(this.userId, storedItems)
              .then(
                () => this.hiddenTiles = storedItems.hiddenTiles,
                _error => this.showTileLoadingErrorToast()
              );
          },
          _error => this.showTileLoadingErrorToast()
        )
        .catch(err => console.error(err));
    }
  }
}
