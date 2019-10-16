import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { NavController, ToastController } from '@ionic/angular';
import { indexOf, pullAll, words, zipObject } from 'lodash';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { COLLEGE_NON_PROFIT_QUERY, COLLEGE_TILES, COLLEGES_EMPTY_STATES } from '@nte/constants/college.constants';
import { IListTile } from '@nte/interfaces/list-tile.interface';
import { Filter } from '@nte/models/filter.model';
import { CollegeListTileService } from '@nte/services/college.list-tile.service';
import { CollegesService } from '@nte/services/colleges.service';
import { EnvironmentService } from '@nte/services/environment.service';
import { FilterService } from '@nte/services/filter.service';
import { MessageService } from '@nte/services/message.service';
import { MixpanelService } from '@nte/services/mixpanel.service';
import { NavStateService } from '@nte/services/nav-state.service';
import { StakeholderService } from '@nte/services/stakeholder.service';

@Component({
  selector: `colleges`,
  templateUrl: `colleges.html`,
  styleUrls: [
    `colleges.scss`,
    `../../app/components/tiles/tiles.scss`
  ]
})
export class CollegesPage implements OnInit, OnDestroy {
  public connections: any;
  public emptyStates: any = COLLEGES_EMPTY_STATES;
  public hiddenTiles: any = {};
  public params: Params;
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
  private ngUnsubscribe: Subject<any> = new Subject();
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
    public collegesService: CollegesService,
    public messageService: MessageService,
    public router: Router,
    private environment: EnvironmentService,
    private filterService: FilterService,
    private listTileService: CollegeListTileService,
    private mixpanel: MixpanelService,
    private nativeStorage: NativeStorage,
    private navCtrl: NavController,
    private route: ActivatedRoute,
    private stakeholderService: StakeholderService,
    private toastCtrl: ToastController,
    navStateService: NavStateService) {
    const params: any = navStateService.data;
    this.connections = params.connections;
  }

  ngOnInit() {
    this.setupTiles();
    this.setupRecSub();
    this.initialize();
    this.mixpanel.event(`navigated_to-Colleges`);
    this.collegesService.initRecs(
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

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    this.tiles = new Array();
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

  public editTile(tile: IListTile) {
    this.listTileService.activeList = (tile);
    this.router.navigate(
      [`app/colleges/list/${tile.id}/edit`],
      {
        state: {
          connections: this.connections,
          cyol: true,
          filter: new Filter(this.filterCategories, tile.filter),
          list: tile,
          listType: `Colleges`,
          page: `Colleges`,
          title: `Create Your Own List!`
        }
      }
    );
  }

  public goToMessaging() {
    this.router.navigate(
      ['app/messages'],
      { state: { teamMembers: this.connections } }
    );
  }

  public hideTile(tile: any) {
    if (tile.isCustom) {
      this.deleteCustomList(tile);
    } else {
      this.hiddenTiles[tile.name] = true;
      this.updateHiddenTiles(this.hiddenTiles);
      this.openHideTileToast(tile);
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
    this.router.navigate(
      [`app/colleges/list/create`],
      {
        state: {
          cyol: true,
          filter: collegeFilters,
          listType: `Colleges`,
          title: `Create Your Own List!`
        }
      }
    );
  }

  public async openHideTileToast(tile: any) {
    const toast = await this.toastCtrl.create({
      buttons: [{
        handler: () => {
          this.hiddenTiles[tile.name] = false;
          this.updateHiddenTiles(this.hiddenTiles);
        },
        text: 'Undo'
      }],
      duration: 3000,
      message: `List removed.`,
      position: `bottom`,
    });
    toast.present();
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

  public viewList(listTile: IListTile) {
    if (this.mixpanelEvents[listTile.name]) {
      this.mixpanel.event(this.mixpanelEvents[listTile.name]);
    }
    if (listTile.name === `Create Your Own List!`) {
      this.openCreateModal();
    } else {
      this.listTileService.activeList = listTile;
      if (listTile.name !== `Near You`) {
        if (listTile.filter) {
          this.collegesService.setBaseFilter(listTile.filter);
        }
        this.filterService.filter = new Filter(
          this.filterCategories,
          listTile.filter
        );
      }
      // this.navCtrl.navigateForward(
      this.router.navigate(
        [
          `app`,
          `colleges`,
          `list`,
          listTile.iconFileName
        ],
        {
          // relativeTo: this.route,
          state: {
            connections: this.connections,
            filter: this.filterService.filter,
            list: listTile
          }
        }
      );
    }
  }

  private checkStoredTileData() {
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
  }

  private deleteCustomList(tile: any) {
    this.collegesService.deleteCustomList(tile.id)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        _response => {
          this.tiles = this.tiles.filter(t => t.id !== tile.id);
          this.openHideTileToast(tile);
        }
      );
  }

  private getFilters() {
    this.collegesService.getFilter()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        filter => {
          this.defaultFilterCategories = filter[0].subCategories;
          this.defaultFilters = new Filter(
            this.defaultFilterCategories,
            COLLEGE_NON_PROFIT_QUERY
          );
          this.filterService.filter = this.defaultFilters;
          this.filterService.filter.updateQuery();
        },
        err => console.error(err)
      );
  }

  private initialize() {
    this.getFilters();
    this.collegesService.initColleges();
    this.collegesService.initSaved(this.user.id, this.user.isParent);
    if (!this.user.isParent) {
      this.collegesService.getMatching();
    }
  }

  private setupCustomListTiles() {
    this.collegesService.getCustomLists()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(lists => lists.forEach(list => this.setupNewTile(list)));
  }

  private setupNewTile(tile: any) {
    if (tile && this.tileIds.indexOf(tile.id) === -1) {
      tile.iconUrl = tile.mobile_image_url || tile.image_url;
      this.tiles.push({
        colSpan: 4,
        filter: tile.query,
        iconUrl: tile.iconUrl,
        id: tile.id,
        isCustom: true,
        name: tile.name,
        providerVariable: `collegeList`
      });
    }
  }

  private setupPremadeListTiles() {
    this.collegesService.getPremadeLists()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        (lists: any[]) => {
          if (lists && lists.length) {
            lists.forEach((list: any) => {
              const tileObj = this.tiles.find(t => t.name === list.name);
              if (tileObj) {
                tileObj.filter += `&tag=${list.id}`;
              }
            });
          }
        }
      );
  }

  private setupRecSub() {
    this.collegesService.recommendationsCount
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        count => {
          if ((!count || count === null) && count !== 0) {
            return;
          } else {
            this.recommendations = count;
          }
        }
      );
  }

  private setupTiles() {
    this.tiles = [...COLLEGE_TILES].map(tile => {
      const fileWords = words(tile.name);
      tile.iconFileName = fileWords[0].toLowerCase();
      tile.iconUrl = `./assets/image/college/tile_${tile.iconFileName}.svg`;
      tile.columns = `col-${tile.colSpan}`;
      return tile;
    });
    if (this.user && this.user.id) {
      this.userId = this.user.id.toString();
      this.checkStoredTileData();
      this.tiles.forEach(tile => {
        const fileWords = words(tile.name);
        tile.iconFileName = fileWords[0].toLowerCase();
        tile.iconUrl = `assets/image/college/tile_${tile.iconFileName}.svg`;
        tile.columns = `col-${tile.colSpan}`;
      });
      this.setupPremadeListTiles();
      this.setupCustomListTiles();
    }
  }

  private async showTileLoadingErrorToast() {
    if (!this.environment.isLocal) {
      // const toast = await this.toastCtrl.create({
      //     duration: 3000,
      //   message: `Unable to load saved tile data.`,
      //     position: `bottom`
      // });
      // toast.present();
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
            this.nativeStorage.setItem(this.userId, storedItems).then(
              () => {
                this.hiddenTiles = storedItems.hiddenTiles;
              },
              _error => {
                this.showTileLoadingErrorToast();
              }
            );
          },
          _error => {
            this.showTileLoadingErrorToast();
          }
        )
        .catch(err => console.error(err));
    }
  }
}
