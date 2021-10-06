import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

import {NzEmptyModule} from 'ng-zorro-antd/empty';
import {NzButtonModule} from 'ng-zorro-antd/button';
import {NzMessageModule} from 'ng-zorro-antd/message';
import {NzSpinModule} from 'ng-zorro-antd/spin';
import {NzAvatarModule} from 'ng-zorro-antd/avatar';
import {NzLayoutModule} from 'ng-zorro-antd/layout';
import {NzInputModule} from 'ng-zorro-antd/input';
import {NzIconModule} from 'ng-zorro-antd/icon';
import {NzGridModule} from 'ng-zorro-antd/grid';
import {NzTabsModule} from 'ng-zorro-antd/tabs';
import {NzUploadModule} from 'ng-zorro-antd/upload';
import {NzDividerModule} from 'ng-zorro-antd/divider';
import {NzPopoverModule} from 'ng-zorro-antd/popover';
import {NzResultModule} from 'ng-zorro-antd/result';
import {NzModalModule} from 'ng-zorro-antd/modal';
import {NzNotificationModule} from 'ng-zorro-antd/notification';
import {NzBadgeModule} from 'ng-zorro-antd/badge';
import {NzToolTipModule} from 'ng-zorro-antd/tooltip';


import {ExercisesLibModule} from './exercises-lib/exercises-lib.module';


import {SectionTaskComponent} from './section-task.component';
import {ExerciseTaskComponent} from './exercise-task/exercise-task.component';
import {SectionTaskItemComponent} from './task-list/section-task-item/section-task-item.component';
import {CaseTaskComponent} from './case-complex-task/case-task/case-task.component';
import {ReadTaskComponent} from './read-task/read-task.component';
import {ExerciseRadioComponent} from './exercise-task/exercise-radio/exercise-radio.component';
import {SpeakWallComponent} from './case-complex-task/speak-wall/speak-wall.component';
import {SectionTabBarComponent} from './task-list/section-tab-bar/section-tab-bar.component';
import {CaseComplexTaskComponent} from './case-complex-task/case-complex-task.component';
import {DefaultTaskComponent} from './default-task/default-task.component';
import {TrainTaskComponent} from './train-task/train-task.component';
import {TaskListComponent} from './task-list/task-list.component';
import {TestTaskComponent} from './test-task/test-task.component';
import {QuestionTaskComponent} from './question-task/question-task.component';
import {TikuProfileComponent} from './tiku-profile/tiku-profile.component';
import {NzCollapseModule, NzSelectModule} from 'ng-zorro-antd';
import {TikuExerciseTaskComponent} from './tiku-exercise-task/tiku-exercise-task.component';
import {TikuWrongExerciseSetComponent} from './tiku-wrong-exercise-set/tiku-wrong-exercise-set.component';
import {TikuCollectionComponent} from './tiku-collection/tiku-collection.component';
import {TikuExerciseSetComponent} from './tiku-exercise-set/tiku-exercise-set.component';
import {TikuTaskItemComponent} from './tiku-task-item/tiku-task-item.component';
import {
  AttachmentShowModalModule,
  QkcLiveModalModule,
  QkcMediaModule,
  QkcMenuModule,
  QkcUploadModule
} from '../../components-qkc';
import {ScrollModule} from '../../core/directive';

const ZORRO_MODULES = [
  NzButtonModule,
  NzSpinModule,
  NzEmptyModule,
  NzLayoutModule,
  NzInputModule,
  NzAvatarModule,
  NzIconModule,
  NzMessageModule,
  NzGridModule,
  NzTabsModule,
  NzUploadModule,
  NzDividerModule,
  NzPopoverModule,
  NzResultModule,
  NzModalModule,
  NzNotificationModule,
  NzBadgeModule,
  NzCollapseModule,
  NzSelectModule,
  NzResultModule,
  NzToolTipModule,
];


const routes: Routes = [
  {path: '', component: SectionTaskComponent},
  {path: 'tiku-profile', component: TikuProfileComponent},
  {path: 'tiku-execrise-task', component: TikuExerciseTaskComponent}
];

@NgModule({
  declarations: [
    SectionTaskComponent,
    ExerciseTaskComponent,
    SectionTaskItemComponent,
    CaseTaskComponent,
    ReadTaskComponent,
    ExerciseRadioComponent,
    SpeakWallComponent,
    SectionTabBarComponent,
    CaseComplexTaskComponent,
    DefaultTaskComponent,
    TrainTaskComponent,
    TaskListComponent,
    TestTaskComponent,
    QuestionTaskComponent,
    TikuProfileComponent,
    TikuExerciseTaskComponent,
    TikuWrongExerciseSetComponent,
    TikuCollectionComponent,
    TikuExerciseSetComponent,
    TikuTaskItemComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ...ZORRO_MODULES,
    ExercisesLibModule,
    QkcLiveModalModule,
    QkcMenuModule,
    AttachmentShowModalModule,
    ScrollModule,
    QkcUploadModule,
    QkcMediaModule,

    RouterModule.forChild(routes)
  ]
})
export class SectionTaskModule {
}
