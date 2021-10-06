import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {KnowledgeReducer} from './reducers';
import {StoreModule} from '@ngrx/store';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    StoreModule.forFeature(KnowledgeReducer.Key, KnowledgeReducer.knowledgeReducer),
  ],
  exports: [],
})
export class NgrxDataModule {
}


