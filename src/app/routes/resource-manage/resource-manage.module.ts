import {NgModule} from '@angular/core';
import {SharedModule} from 'src/app/shared/shared.module';
import {ResourceManageRoutingModule} from './resource-manage-routing.module';
import {QkcMediaModule, QkcMenuModule} from 'components-qkc';
import {CKEditorModule} from '@ckeditor/ckeditor5-angular';

import {MaterialLibDetailsComponent} from './material-library/material-lib-details/material-lib-details.component';
import {MaterialCaseComponent} from './material-library/material-case/material-case.component';
import {MaterialOtherComponent} from './material-library/material-other/material-other.component';
import {MaterialPreviewCaseComponent} from './material-library/material-preview-case/material-preview-case.component';
import {MaterialPreviewOtherComponent} from './material-library/material-preview-other/material-preview-other.component';
import {ReadLibComponent} from './material-library/read-lib/read-lib.component';
import {CaseLibComponent} from './material-library/case-lib/case-lib.component';
import {TrainLibraryCourseComponent} from './train-library-course/train-library-course.component';
import {SaveTrainCourseComponent} from './train-library-course/save-train-course/save-train-course.component';
import {ExerciseLibraryComponent} from '@app/routes/resource-manage/exercise-library/exercise-library.component';

import {QRCodeModule} from 'angular2-qrcode';

const COMPONENTS = [
  MaterialLibDetailsComponent,
  MaterialCaseComponent,
  MaterialOtherComponent,
  MaterialPreviewCaseComponent,
  MaterialPreviewOtherComponent,
  ReadLibComponent,
  CaseLibComponent,
  TrainLibraryCourseComponent,
  SaveTrainCourseComponent,
  ExerciseLibraryComponent
];

@NgModule({
  declarations: [...COMPONENTS],
  imports: [
    SharedModule,
    QkcMenuModule,
    ResourceManageRoutingModule,
    QkcMediaModule,
    CKEditorModule,
    QRCodeModule
  ]
})
export class ResourceManageModule {
}
