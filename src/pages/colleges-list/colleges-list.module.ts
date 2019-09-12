import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { IonicModule } from '@ionic/angular';

import { CollegesListPage } from './colleges-list';
import { ComponentsModule } from '@nte/components/components.module';
import { SendComponent } from '@nte/components/send/send';
import { FilterPage } from '@nte/pages/filter/filter';
import { PipesModule } from '@nte/pipes/pipes.module';

const routes: Routes = [
  {
    path: 'app/colleges/list/:id',
    children: [
      {
        path: '',
        component: CollegesListPage
      },
      {
        path: 'filter',
        component: FilterPage
      }
    ]
  }
];

@NgModule({
  declarations: [
    CollegesListPage
  ],
  entryComponents: [
    SendComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    PipesModule,
    ComponentsModule
  ]
})
export class CollegesListPageModule { }
