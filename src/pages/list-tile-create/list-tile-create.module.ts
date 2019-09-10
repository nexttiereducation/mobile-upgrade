import { NgModule } from '@angular/core';
import { IonicPageModule } from '@ionic/angular';

import { ComponentsModule } from '@nte/components/components.module';
import { ListTileCreatePage } from './list-tile-create';

@NgModule({
  declarations: [
    ListTileCreatePage
  ],
  exports: [
    ListTileCreatePage
  ],
  imports: [
    ComponentsModule,
    IonicPageModule.forChild(ListTileCreatePage)
  ]
})
export class ListTileCreatePageModule {}
