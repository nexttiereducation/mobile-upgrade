import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { ComponentsModule } from '@nte/components/components.module';
import { SendComponent } from '@nte/components/send/send';
import { ScholarshipsListPage } from './scholarships-list';

@NgModule({
  declarations: [
    ScholarshipsListPage
  ],
  entryComponents: [
    SendComponent
  ],
  imports: [
    ComponentsModule,
    IonicPageModule.forChild(ScholarshipsListPage)
  ]
})
export class ScholarshipsListPageModule {}
