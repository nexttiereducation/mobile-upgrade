import { Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
import { IonItemSliding } from '@ionic/angular';

@Component({
  selector: 'tile',
  templateUrl: `tile.html`,
  styleUrls: [`tile.scss`],
  encapsulation: ViewEncapsulation.None
})
export class TileComponent {
  @Input() inverse: boolean = false;
  @Input() isCustom: boolean = false;
  @Input() tile: any;

  @Output() editClick: EventEmitter<any> = new EventEmitter(null);
  @Output() hideClick: EventEmitter<any> = new EventEmitter(null);
  @Output() tileClick: EventEmitter<any> = new EventEmitter(null);

  public edit(tile: any, slidingItem: IonItemSliding) {
    slidingItem.close();
    this.editClick.emit(tile);
  }
  public hide(tile: any, slidingItem: IonItemSliding) {
    slidingItem.close();
    this.hideClick.emit(tile);
  }

}
