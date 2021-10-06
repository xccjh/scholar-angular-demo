import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
// 课程管理
import {ProfessionListComponent} from './profession-list/profession-list.component';
import {CourseListComponent} from './course-list/course-list.component';
import {CoursePreviewComponent} from './course-preview/course-preview.component';
import {IInitiatedComponent} from './i-initiated/i-initiated.component';
import {ApproveAllComponent} from './approve-all/approve-all.component';
import {ScpCourseBuildComponent} from './scp-course-build/scp-course-build.component';
// 课包管理
import {SeriesManagementComponent} from './series-management/series-management.component';
import {ScpPrepareCourseComponent} from './scp-prepare-course/scp-prepare-course.component';
import {StandardCoursePkgListNotreeComponent} from './standard-course-pkg-list-notree/standard-course-pkg-list-notree.component';
import {InitiatepkgComponent} from './i-initiated-pkg/initiatepkg.component';
import {IapprovedComponent} from './iapproved/iapproved.component';

import {CourseListResolverService} from './course-service.resolver';
import {NoFoundComponent} from '../../../../layout/404/404.component';
import {StatisticsComponent} from './statistics/statistics.component';
import {OperationLogComponent} from './operation-log/operation-log.component';
import {GraphStatisticsComponent} from './graph-statistics/graph-statistics.component';
import {WrongQuestionsComponent} from './wrong-questions/wrong-questions.component';
import {FeedbackStatisticsComponent} from './feedback-statistics/feedback-statistics.component';
import {PackageOverviewComponent} from './package-overview/package-overview.component';









const routes: Routes = [
  {
    path: 'approve-all',
    component: ApproveAllComponent,
    resolve: {courseListData: CourseListResolverService},
    data: {title: '全部审批'}
  },
  {
    path: 'series-management',
    component: SeriesManagementComponent,
    data: {title: '系列管理'}
  },
  {
    path: 'operation-log',
    component: OperationLogComponent,
    data: {title: '操作日志'}
  },
  {
    path: 'wrong-questions',
    component: WrongQuestionsComponent,
    data: {title: '错题统计'}
  },
  {
    path: 'feedback-statistics',
    component: FeedbackStatisticsComponent,
    data: {title: '反馈统计'}
  },
  {
    path: 'package-overview',
    component: PackageOverviewComponent,
    data: {title: '课包概况'}
  },
  {
    path: 'graph-statistics',
    component: GraphStatisticsComponent,
    data: {title: '图谱统计'}
  },
  {
    path: 'iapproved',
    component: IapprovedComponent,
    data: {title: '全部审批'}
  },
  {
    path: 'statistics',
    component: StatisticsComponent,
    data: {title: '数据统计'}
  },
  {
    path: 'i-initiated',
    component: IInitiatedComponent,
    resolve: {courseListData: CourseListResolverService},
    data: {title: '我的审批'}
  },
  {
    path: 'initiatepkg', component: InitiatepkgComponent, data: {title: '我发起的'}
  },
  {
    path: 'course-list',
    component: CourseListComponent,
    resolve: {courseListData: CourseListResolverService},
    data: {title: '课程管理'}
  },
  {path: 'course-preview/:id', component: CoursePreviewComponent},
  {path: 'scp-list', component: StandardCoursePkgListNotreeComponent},
  {
    path: 'prepare-course',
    component: ScpPrepareCourseComponent
  }, {
    path: 'scp-course/:courseId/:knowledgeSubjectId/:status/:auditStatus/:code/:majorId',
    component: ScpCourseBuildComponent
  },
  {path: 'profession-list', component: ProfessionListComponent},
  {
    path: '**',
    component: NoFoundComponent,
    data: {title: '404'}
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [
    CourseListResolverService
  ]
})
export class CourseManageRoutingModule {
}
