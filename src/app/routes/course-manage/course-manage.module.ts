import {NgModule} from '@angular/core';
import {SharedModule} from '../../shared/shared.module';
import {CourseManageRoutingModule} from './course-manage-routing.module';
import {NgxEchartsModule} from 'ngx-echarts';
import * as echarts from 'echarts';
import {QkcMediaModule} from 'components-qkc/qkc-media/qkc-media.module';
import {CKEditorModule} from '@ckeditor/ckeditor5-angular';
import {QkcMenuModule} from 'components-qkc';
import {NgrxDataModule} from 'core/ngrx-data/ngrx-data.module';
import {UploadOssService} from 'core/services/upload-oss.service';
import {TrainManageService, KnowledgeManageService} from 'src/app/busi-services';

import {
  StructureAdjustmentComponent,
  StructureAdjustmentSectionComponent,
  StructureAdjustmentChapterComponent,
  // 课包结构
  StructureAdjustTreeComponent,
  // 学习设置
  ChapterHandoutComponent,
  // 其他设置
  OtherSettingComponent,
  RewardSettingsComponent,
  // 智适应
  IntellectualAdaptationComponent,
  // 完成
  CompleteCourseComponent,
  CourseStructureTreeComponent,
  UploadHandoutComponent,
  FlexTableComponent,
  CourseDataComponent,
  SearchTableComponent,
  ResolverDataComponent,
  VideoImportComponent,
  NewLevelComponent,
  NewCompanyComponent,
  NewHqComponent,
  EditLessonComponent
} from './components';

const CommonComponents = [
  StructureAdjustmentComponent,
  StructureAdjustmentSectionComponent,
  StructureAdjustmentChapterComponent,
  // 课包结构
  StructureAdjustTreeComponent,
  // 学习设置
  ChapterHandoutComponent,
  VideoImportComponent,
  // 其他设置
  OtherSettingComponent,
  EditLessonComponent,
  RewardSettingsComponent,
  NewLevelComponent,
  NewHqComponent,
  NewCompanyComponent,
  // 智适应
  IntellectualAdaptationComponent,
  // 完成
  CompleteCourseComponent,
  CourseStructureTreeComponent,
  UploadHandoutComponent,
  FlexTableComponent,
  SearchTableComponent,
  ResolverDataComponent
];

// 课程
import {CourseListComponent} from './course-list/course-list.component';
import {IInitiatedComponent} from './i-initiated/i-initiated.component';
import {ApproveAllComponent} from './approve-all/approve-all.component';
import {CoursePreviewComponent} from './course-preview/course-preview.component';
import {CourseDetailsComponent} from './course-details/course-details.component';
import {ProfessionListComponent} from './profession-list/profession-list.component';
import {ScpCourseBuildComponent} from './scp-course-build/scp-course-build.component';
import {StructureComponent} from './structure/structure.component';
import {QuestionbankConfigurationComponent} from './questionbank-configuration/questionbank-configuration.component';
import {SubquestionConfigurationComponent} from './subquestion-configuration/subquestion-configuration.component';
import {QuestionsettingConfigurationComponent} from './questionsetting-configuration/questionsetting-configuration.component';
import {StatisticsComponent} from './statistics/statistics.component';
import {OperationLogComponent} from './operation-log/operation-log.component';
import {GraphStatisticsComponent} from './graph-statistics/graph-statistics.component';
import {WrongQuestionsComponent} from './wrong-questions/wrong-questions.component';


const CourseComponents = [
  StatisticsComponent,
  OperationLogComponent,
  GraphStatisticsComponent,
  WrongQuestionsComponent,
  CourseListComponent,
  IInitiatedComponent,
  ApproveAllComponent,
  CoursePreviewComponent,
  CourseDetailsComponent,
  ProfessionListComponent,
  ScpCourseBuildComponent,
  StructureComponent,
  QuestionbankConfigurationComponent,
  SubquestionConfigurationComponent,
  QuestionsettingConfigurationComponent,
];

// 课包
import {StandardCoursePkgListComponent} from './standard-course-pkg-list/standard-course-pkg-list.component';
import {StandardCoursePkgListNotreeComponent} from './standard-course-pkg-list-notree/standard-course-pkg-list-notree.component';
import {SeriesManagementComponent} from './series-management/series-management.component';
import {SchoolZoneComponent} from './components/school-zone/school-zone.component';
import {SchoolZoneTreeComponent} from './components/school-zone-tree/school-zone-tree.component';
import {ScpPrepareCourseComponent} from './scp-prepare-course/scp-prepare-course.component';
import {InitiatepkgComponent} from './i-initiated-pkg/initiatepkg.component';
import {IapprovedComponent} from './iapproved/iapproved.component';
import {FeedbackStatisticsComponent} from './feedback-statistics/feedback-statistics.component';
import {PackageOverviewComponent} from './package-overview/package-overview.component';

const CoursePkgComponents = [
  StandardCoursePkgListComponent,
  FeedbackStatisticsComponent,
  PackageOverviewComponent,
  SeriesManagementComponent,
  SchoolZoneComponent,
  SchoolZoneTreeComponent,
  ScpPrepareCourseComponent,
  InitiatepkgComponent,
  IapprovedComponent,
  StandardCoursePkgListNotreeComponent
];


@NgModule({
  declarations: [
    ...CommonComponents,
    ...CourseComponents,
    ...CoursePkgComponents,
    FlexTableComponent,
    CourseDataComponent
  ],
  imports: [
    SharedModule,
    QkcMenuModule,
    QkcMediaModule,
    CKEditorModule,
    NgrxDataModule,
    NgxEchartsModule.forRoot({
      echarts
    }),
    CourseManageRoutingModule,
  ],
  entryComponents: [],
})
export class CourseManageModule {
}
