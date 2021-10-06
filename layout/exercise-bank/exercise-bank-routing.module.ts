import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';

import {ExerciseBankComponent} from './exercise-bank.component';
import {ViewAnswerComponent} from './exercises-lib/view-answer/view-answer.component';

const routes: Routes = [
  {
    path: '', component: ExerciseBankComponent, children: [],
  },
  {
    path: 'view-answer', component: ViewAnswerComponent, children: [],
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ExerciseBankRoutingModule {
}
