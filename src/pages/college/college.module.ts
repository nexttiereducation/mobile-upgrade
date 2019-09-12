import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule, Routes } from '@angular/router';
import { IonicModule } from '@ionic/angular';

import { CollegePage } from './college';
import { ComponentsModule } from '@nte/components/components.module';

const routes: Routes = [
  {
    path: 'app/colleges/:id',
    component: CollegePage,
    children: [
      // {
      //   path: '',
      //   redirectTo: 'general'
      // },
      {
        path: 'general',
        children: [
          {
            path: '',
            loadChildren: '@nte/pages/college-general/college-general.module#CollegeGeneralPageModule'
          }
        ]
        // component: CollegeGeneralPage
      },
      {
        path: 'campus',
        children: [
          {
            path: '',
            loadChildren: '@nte/pages/college-campus/college-campus.module#CollegeCampusPageModule'
          }
        ]
        // component: CollegeCampusPage
      },
      {
        path: 'academic',
        children: [
          {
            path: '',
            loadChildren: '@nte/pages/college-academic/college-academic.module#CollegeAcademicPageModule'
          }
        ]
        // component: CollegeAcademicPage
      },
      {
        path: 'financial',
        children: [
          {
            path: '',
            loadChildren: '@nte/pages/college-financial/college-financial.module#CollegeFinancialPageModule'
          }
        ]
        // component: CollegeFinancialPage
      },
      {
        path: 'application',
        children: [
          {
            path: '',
            loadChildren: '@nte/pages/college-application/college-application.module#CollegeApplicationPageModule'
          }
        ]
        // component: CollegeApplicationPage
      }
    ]
  }
];

@NgModule({
  declarations: [
    CollegePage
  ],
  imports: [
    BrowserAnimationsModule,
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    ComponentsModule
  ]
})
export class CollegePageModule { }
