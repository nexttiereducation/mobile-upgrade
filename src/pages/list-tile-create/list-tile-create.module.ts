import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { IonicModule } from '@ionic/angular';

import { ListTileCreatePage } from './list-tile-create';
import { ComponentsModule } from '@nte/components/components.module';

const routes: Routes = [
  {
    path: 'app/colleges/list/create',
    component: ListTileCreatePage
  },
  {
    path: 'app/colleges/list/:id/edit',
    component: ListTileCreatePage
  },
  {
    path: 'app/scholarships/list/create',
    component: ListTileCreatePage
  },
  {
    path: 'app/scholarships/list/:id/edit',
    component: ListTileCreatePage
  }
];

@NgModule({
  declarations: [
    ListTileCreatePage
  ],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    ComponentsModule
  ]
})
export class ListTileCreatePageModule { }
