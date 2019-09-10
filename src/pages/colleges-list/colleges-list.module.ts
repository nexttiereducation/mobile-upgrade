import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { ComponentsModule } from '@nte/components/components.module';
import { SendComponent } from '@nte/components/send/send';
import { PipesModule } from '@nte/pipes/pipes.module';
import { CollegesListPage } from './colleges-list';

@NgModule({
  declarations: [CollegesListPage],
  entryComponents: [SendComponent],
  exports: [CollegesListPage],
  imports: [
    PipesModule,
    ComponentsModule,
    IonicPageModule.forChild(CollegesListPage)
  ]
})
export class CollegesListPageModule { }
