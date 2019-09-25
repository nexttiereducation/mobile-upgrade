import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { CollegePage } from './college';
import { CollegeDetailsModule } from '@nte/components/college-details/college-details.module';
import { ComponentsModule } from '@nte/components/components.module';

// children: [
//   {
//     path: '',
//     pathMatch: 'full',
//     redirectTo: 'general'
//   },
//   {
//     component: CollegeGeneralPage,
//     outlet: 'collegeSection',
//     path: 'general',
//     // children: [
//     //   {
//     //     path: '',
//     //     loadChildren: '../college-general/college-general.module#CollegeGeneralPageModule',
//     //     outlet: 'collegeSection'
//     //   }
//     // ]
//   },
//   {
//     component: CollegeAcademicPage,
//     outlet: 'collegeSection',
//     path: 'academic',
//     // children: [
//     //   {
//     //     path: '',
//     //     loadChildren: '../college-academic/college-academic.module#CollegeAcademicPageModule',
//     //     outlet: 'collegeSection'
//     //   }
//     // ]
//   },
//   {
//     component: CollegeFinancialPage,
//     outlet: 'collegeSection',
//     path: 'financial',
//     // children: [
//     //   {
//     //     path: '',
//     //     loadChildren: '../college-financial/college-financial.module#CollegeFinancialPageModule',
//     //     outlet: 'collegeSection'
//     //   }
//     // ]
//   },
//   {
//     component: CollegeCampusPage,
//     outlet: 'collegeSection',
//     path: 'campus',
//     // children: [
//     //   {
//     //     path: '',
//     //     loadChildren: '../college-campus/college-campus.module#CollegeCampusPageModule',
//     //     outlet: 'collegeSection'
//     //   }
//     // ]
//   },
//   {
//     component: CollegeApplicationPage,
//     outlet: 'collegeSection',
//     path: 'application',
//     // children: [
//     //   {
//     //     path: '',
//     //     loadChildren: '../college-application/college-application.module#CollegeApplicationPageModule',
//     //     outlet: 'collegeSection'
//     //   }
//     // ]
//   }
// ]
// children: [
//   {
//     path: 'general',
//     // loadChildren: '@nte/pages/college-general/college-general.module#CollegeGeneralPageModule'
//     component: CollegeGeneralPage
//   },
//   {
//     path: 'campus',
//     // loadChildren: '@nte/pages/college-campus/college-campus.module#CollegeCampusPageModule'
//     component: CollegeCampusPage
//   },
//   {
//     path: 'academic',
//     // loadChildren: '@nte/pages/college-academic/college-academic.module#CollegeAcademicPageModule'
//     component: CollegeAcademicPage
//   },
//   {
//     path: 'financial',
//     // loadChildren: '@nte/pages/college-financial/college-financial.module#CollegeFinancialPageModule'
//     component: CollegeFinancialPage
//   },
//   {
//     path: 'application',
//     // loadChildren: '@nte/pages/college-application/college-application.module#CollegeApplicationPageModule'
//     component: CollegeApplicationPage
//   },
//   {
//     path: '',
//     redirectTo: '/app/colleges/:id/general',
//     pathMatch: 'full'
//   }
// ]
// loadChildren: '@nte/pages/college/college.module#CollegePageModule'

@NgModule({
  declarations: [
    CollegePage
  ],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    // RouterModule.forChild(routes),
    ComponentsModule,
    CollegeDetailsModule
  ]
})
export class CollegePageModule { }
