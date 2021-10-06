import { NgModule } from '@angular/core';

// import { NzButtonModule } from 'ng-zorro-antd/button';
// import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
// import { NzEmptyModule } from 'ng-zorro-antd/empty';
// import { NzMessageModule } from 'ng-zorro-antd/message';
// import { NzSpinModule } from 'ng-zorro-antd/spin';
// import { NzAvatarModule } from 'ng-zorro-antd/avatar';
// import { NzLayoutModule } from 'ng-zorro-antd/layout';
// import { NzInputModule } from 'ng-zorro-antd/input';
// import { NzIconModule } from 'ng-zorro-antd/icon';
// import { NzGridModule } from 'ng-zorro-antd/grid';
// import { NzTabsModule } from 'ng-zorro-antd/tabs';
// import { NzUploadModule } from 'ng-zorro-antd/upload';
// import { NzDividerModule } from 'ng-zorro-antd/divider';


import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { QkcCheckboxComponent} from './choice-question/qkc-checkbox/qkc-checkbox.component';
import { ChoiceQuestionComponent } from './choice-question/choice-question.component';
import { SketchComponent } from './sketch/sketch.component';
import { FillBlanksComponent } from './fill-blanks/fill-blanks.component';
import { EntrySubjectComponent } from './entry-subject/entry-subject.component';
import { FormSubjectComponent } from './form-subject/form-subject.component';
import { BaseEntrySubjectComponent } from './entry-subject/base-entry-subject/base-entry-subject.component';
import { ComplexComponent } from './complex/complex.component';
import {NgZorroAntdModule} from '../../../components-qkc/ng-zorro-antd.module';
import {SharedModule} from '@app/shared/shared.module';

const CONPONMENTS = [
  QkcCheckboxComponent,
  ChoiceQuestionComponent,
  SketchComponent,
  FillBlanksComponent,
  BaseEntrySubjectComponent,
  EntrySubjectComponent,
  FormSubjectComponent,
  ComplexComponent,
];
const ZORRO_MODULES = [
  NgZorroAntdModule
];

@NgModule({
  declarations: [...CONPONMENTS],
  imports: [
    CommonModule,
    FormsModule,
    ...ZORRO_MODULES,
    SharedModule
  ],
  exports: [...CONPONMENTS]
})
export class ExercisesLibModule { }
