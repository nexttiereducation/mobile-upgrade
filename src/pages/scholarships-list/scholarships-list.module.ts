import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { IonicModule } from '@ionic/angular';

import { ComponentsModule } from '@nte/components/components.module';
import { SendComponent } from '@nte/components/send/send';
import { FilterCategoryPage } from '@nte/pages/filter-category/filter-category';
import { FilterPage } from '@nte/pages/filter/filter';
import { ScholarshipPage } from '@nte/pages/scholarship/scholarship';
import { ScholarshipsListPage } from '@nte/pages/scholarships-list/scholarships-list';

const routes: Routes = [
  {
    path: 'app/scholarships/list/:id',
    children: [
      {
        path: '',
        component: ScholarshipsListPage
      },
      {
        path: 'filter',
        component: FilterPage,
        children: [
          {
            path: ':category',
            component: FilterCategoryPage
          }
        ]
      },
      {
        path: 'scholarship/:id',
        component: ScholarshipPage
      }
      // , {
      //   path: `edit`,
      //   component: ListTileCreatePage
      // },
    ]
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
