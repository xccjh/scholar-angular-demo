import {NgModule} from '@angular/core';
import {Routes, RouterModule, PreloadAllModules} from '@angular/router';
import {LayoutPassportComponent} from 'layout/passport/passport.component';
import {LoginComponent} from './passport/login/login.component';
import {LayoutMainComponent} from 'layout/main/main.component';
import {NoFoundComponent} from 'layout/404/404.component';
import {CodePageComponent} from '@app/routes/course-manage/code-page/code-page.component';
import {AuthGuard} from 'core/auth/auth.guard';

const routes: Routes = [
  {
    path: 'p',
    redirectTo: '/p/login',
    pathMatch: 'full',
  },
  {
    path: 'p',
    component: LayoutPassportComponent,
    children: [
      {
        path: 'login',
        component: LoginComponent,
        data: {title: '登录'}
      },
      {
        path: 'o/outline/:pcode/:info',
        component: CodePageComponent,
      }, {
        path: 'of/outline-fl/:pcode/:info',
        component: CodePageComponent,
      },
    ]
  },
  {
    path: 'm',
    canActivate: [AuthGuard],
    component: LayoutMainComponent,
    children: [
      {
        path: 'system',
        loadChildren: () => import('./system-manage/system-manage.module').then(m => m.SystemManageModule)
      },
      {
        path: 'rm',
        loadChildren: () => import('./resource-manage/resource-manage.module').then(m => m.ResourceManageModule)
      },
      {
        path: 'course-manage',
        loadChildren: () => import('./course-manage/course-manage.module').then(m => m.CourseManageModule)
      },
      {
        path: 'archives-manage',
        loadChildren: () => import('./archives-manage/archives-manage.module').then(m => m.ArchivesManageModule)
      },
      {
        path: 'e',
        loadChildren: () => import('components-qkc/exception/exception.module').then(m => m.ExceptionModule)
      },
      {
        path: '**',
        component: NoFoundComponent,
        data: {title: '404'}
      },
    ]
  },
  {
    path: 'o',
    loadChildren: () => import('layout/study-outline/study-outline.module').then(m => m.StudyOutlineModule)
  },
  {
    path: 'of',
    loadChildren: () => import('layout/study-outline-fl/study-outline-fl.module').then(m => m.StudyOutlineFlModule)
  },
  {
    path: 'chapter-study/:sectionId/:type/:resourceId',
    loadChildren: () => import('layout/chapter-study/chapter-study.module').then(m => m.ChapterStudyModule),
  },
  {
    path: 'chapter-study/:type/:code', // 1知识学习 2章节学习
    loadChildren: () => import('layout/chapter-study/chapter-study.module').then(m => m.ChapterStudyModule),
  },
  {
    path: 'section',
    loadChildren: () => import('layout/section-task/section-task.module').then(m => m.SectionTaskModule),
  },
  {
    path: 'exercise-bank',
    loadChildren: () => import('layout/exercise-bank/exercise-bank.module').then(m => m.ExerciseBankModule),
  },
  {
    path: 'e',
    loadChildren: () => import('components-qkc/exception/exception.module').then(m => m.ExceptionModule)
  },
  {
    path: '**', redirectTo: '/p/login', pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {preloadingStrategy: PreloadAllModules})],
  exports: [RouterModule]
})
export class RouteRoutingModule {
}
