import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {StudyOutlineComponent} from './study-outline.component';
import {NoFoundComponent} from '../404/404.component';
import {StudyOutlineFl} from '../study-outline-fl/study-outline-fl.component';

const routes: Routes = [
  {path: 'outline', pathMatch: 'full', component: StudyOutlineComponent},
  {path: 'outline-fl', component: StudyOutlineFl},
  {
    path: '**',
    component: NoFoundComponent,
    data: {title: '404'}
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StudyOutlineRoutingModule {
}
