import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {NoFoundComponent} from '../404/404.component';
import {StudyOutlineFl} from '../study-outline-fl/study-outline-fl.component';
const routes: Routes = [
  {path: 'outline-fl', pathMatch: 'full', component: StudyOutlineFl},
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
export class StudyOutlineFlRoutingModule {
}
