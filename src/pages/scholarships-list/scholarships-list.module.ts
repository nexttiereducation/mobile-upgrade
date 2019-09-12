import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { IonicModule } from '@ionic/angular';

import { ScholarshipsListPage } from './scholarships-list';
import { ComponentsModule } from '@nte/components/components.module';
import { SendComponent } from '@nte/components/send/send';

const routes: Routes = [
  {
    path: 'app/scholarships/list/:id',
    component: ScholarshipsListPage
  }
];

@NgModule({
  declarations: [
    ScholarshipsListPage
  ],
  entryComponents: [
    SendComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    ComponentsModule
  ]
})
export class ScholarshipsListPageModule { }
