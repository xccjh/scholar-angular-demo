import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AttachmentShowModalComponent } from './attachment-show-modal.component';
import { NzModalModule } from 'ng-zorro-antd';
import { QkcMediaModule } from 'components-qkc/qkc-media/qkc-media.module';

@NgModule({
  declarations: [AttachmentShowModalComponent],
  imports: [
    CommonModule,
    NzModalModule,
    QkcMediaModule
  ],
  exports: [
    AttachmentShowModalComponent
  ]
})
export class AttachmentShowModalModule { }
