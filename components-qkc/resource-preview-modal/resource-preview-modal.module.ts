import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResourcePreviewModalComponent } from './resource-preview-modal.component';
import {NzIconModule, NzModalModule} from 'ng-zorro-antd';

@NgModule({
  declarations: [ResourcePreviewModalComponent],
  imports: [
    CommonModule,
    NzModalModule,
    NzIconModule
  ],
  exports: [
    ResourcePreviewModalComponent
  ]
})
export class ResourcePreviewModalModule { }
