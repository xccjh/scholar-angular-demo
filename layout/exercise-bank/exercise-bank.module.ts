import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {ExerciseBankComponent} from './exercise-bank.component';
import {ExerciseBankRoutingModule} from './exercise-bank-routing.module';
import {SmartQuestionComponent} from './exercises-lib/smart-question/smart-question.component';
import {ViewAnswerComponent} from './exercises-lib/view-answer/view-answer.component';
import {ExerciseseaderComponent} from './exercises-lib/exercises-header/exercises-header.component';
import {SharedModule} from '@app/shared/shared.module';

@NgModule({
  declarations: [
    ExerciseBankComponent,
    SmartQuestionComponent,
    ViewAnswerComponent,
    ExerciseseaderComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    ExerciseBankRoutingModule
  ]
})

export class ExerciseBankModule {
}
