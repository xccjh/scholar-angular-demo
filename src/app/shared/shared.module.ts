import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ReactiveFormsModule, FormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {registerLocaleData} from '@angular/common';
import zh from '@angular/common/locales/zh';

import {AttachmentShowModalModule} from 'components-qkc';
import {ResourcePreviewModalModule} from 'components-qkc';
import {ClipboardModule} from 'ngx-clipboard';
import {NgZorroAntdModule} from 'components-qkc/ng-zorro-antd.module';

import {
  AtrErrorImgDirective,
  AtrRoleDirective,
  ClickoutsideDirective,
  StopPropagationDirective,
  ImgDefaultDirective,
  QkcSpinDirective,
  FullscreenDirective,
  HighlightDirective,
  DebounceClickDirective,
  EqualValidator, ExeBackgroundDirective,
  ExeIfDirective,
  ExeButtonPressDirective
} from 'core/directive';
import {
  SafeHtmlPipe,
  DayPipe,
  RestypePipe,
  ChinaDatePipe,
  AgoPipe,
  PlayCountPipe,
  RepeatPipe,
  WelcomePipe
} from 'core/pipe';

import {
  UploadComponent,
  TreeComponent,
  ProfessionLabelComponent,
  ProfessionLabelInputComponent,
  ProfessionLabelItemComponent,
  ProfessionLabelAddComponent,
  ProfessionLabelDrawerComponent,
  CourseMemberComponent,
  RoleMemberComponent,
  ChangeProfessionComponent,
  CustomCheckboxComponent,
  TagSelectComponent,
  QkcUploadComponent,
  VerificationCodeComponent,
  PackTreeComponent,
  ChangeTrainComponent,
  QkcTrainTreeComponent,
  QkcResTagComponent,
  TreeKnowledgegraphComponent,
  SimpleKnowledgegraphTreeComponent,
  ServiceProviderComponent,
  DisciplineDataComponent,
} from './';

registerLocaleData(zh);
const THIRDMODULES = [
  AttachmentShowModalModule,
  ResourcePreviewModalModule,
  ClipboardModule,
  NgZorroAntdModule,
];
const COMPONENTS = [
  UploadComponent, SimpleKnowledgegraphTreeComponent,
  TreeComponent, ProfessionLabelComponent, ProfessionLabelInputComponent,
  ProfessionLabelItemComponent, ProfessionLabelAddComponent, ProfessionLabelDrawerComponent,
  CourseMemberComponent, RoleMemberComponent, ChangeProfessionComponent, CustomCheckboxComponent,
  TagSelectComponent, QkcUploadComponent, VerificationCodeComponent, QkcResTagComponent,
  PackTreeComponent, ChangeTrainComponent, QkcTrainTreeComponent, TreeKnowledgegraphComponent,
  ServiceProviderComponent, DisciplineDataComponent];
const DIRECTIVES = [AtrRoleDirective, AtrErrorImgDirective,
  QkcSpinDirective, FullscreenDirective,
  ClickoutsideDirective, HighlightDirective, StopPropagationDirective,
  ImgDefaultDirective, DebounceClickDirective, EqualValidator,
  ExeBackgroundDirective, ExeIfDirective,
  ExeButtonPressDirective];
const PIPES = [DayPipe, ChinaDatePipe, RestypePipe, SafeHtmlPipe, PlayCountPipe, AgoPipe, RepeatPipe, WelcomePipe];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    DragDropModule,
    ...THIRDMODULES,
  ],
  declarations: [
    ...COMPONENTS,
    ...DIRECTIVES,
    ...PIPES
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DragDropModule,
    RouterModule,
    ...COMPONENTS,
    ...DIRECTIVES,
    ...PIPES,
    ...THIRDMODULES,
  ]
})
export class SharedModule {
}
