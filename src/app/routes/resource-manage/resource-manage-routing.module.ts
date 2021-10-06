import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ReadLibComponent} from './material-library/read-lib/read-lib.component';
import {CaseLibComponent} from './material-library/case-lib/case-lib.component';
import {MaterialLibDetailsComponent} from './material-library/material-lib-details/material-lib-details.component';
import {MaterialPreviewCaseComponent} from './material-library/material-preview-case/material-preview-case.component';
import {MaterialPreviewOtherComponent} from './material-library/material-preview-other/material-preview-other.component';
import {NoFoundComponent} from '../../../../layout/404/404.component';
import {TrainLibraryCourseComponent} from './train-library-course/train-library-course.component';
import {SaveTrainCourseComponent} from './train-library-course/save-train-course/save-train-course.component';
import {ExerciseLibraryComponent} from './exercise-library/exercise-library.component';

const routes: Routes = [
  {path: 'read', component: ReadLibComponent},
  {path: 'case', component: CaseLibComponent},
  {path: 'setting', component: TrainLibraryCourseComponent},
  {path: 'exercise', component: ExerciseLibraryComponent},
  {path: 'save-train/:type/:id/:professionId', component: SaveTrainCourseComponent},
  {path: 'material-details/:id/:type/:professionId', component: MaterialLibDetailsComponent},
  {path: 'material-pre-case/:id/:type/:professionId', component: MaterialPreviewCaseComponent},
  {path: 'material-pre-other/:id/:type/:professionId', component: MaterialPreviewOtherComponent}, {
    path: '**',
    component: NoFoundComponent,
    data: {title: '404'}
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ResourceManageRoutingModule {
}
