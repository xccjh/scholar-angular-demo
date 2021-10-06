import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule} from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzUploadModule } from 'ng-zorro-antd/upload';
import { AttachmentShowModalModule } from '../attachment-show-modal/attachment-show-modal.module';

import { QkcUploadComponent } from './qkc-upload.component';

@NgModule({
  declarations: [QkcUploadComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzButtonModule,
    NzUploadModule,
    AttachmentShowModalModule
  ],
  exports: [
    QkcUploadComponent
  ]
})
export class QkcUploadModule { }
