import { Component, OnInit, Input, Output, EventEmitter, Injector } from '@angular/core';

import { ProfessionLabelService } from '../services/profession-label.service';



@Component({
  // tslint:disable-next-line:component-selector
  selector: 'qkc-profession-label-input',
  templateUrl: './profession-label-input.component.html',
  styleUrls: ['./profession-label-input.component.less']
})
export class ProfessionLabelInputComponent implements OnInit {

  isShow = false;

  @Input() tagType: string;
  @Input() tagLevel: string;

  @Input() data: any;

  value = '';
  @Output() delChange = new EventEmitter<string>();

  constructor(private injector: Injector) { }

  ngOnInit() {
  }

  get proLabelService() {
    return this.injector.get(ProfessionLabelService);
  }

  add() {
    this.isShow = true;
  }

  close() {
    this.isShow = false;
  }

  edit(): void {
    this.value = this.data.tagName;
    this.isShow = true;
  }

  del() {
    this.proLabelService.delTags(this.data.id).subscribe(result => {
      this.delChange.emit(this.data.id);
    },
    error => {

    });
  }

  confirm(): void {
    this.proLabelService.saveTags(this.data.id, this.value, this.data.pid, this.tagType, this.tagLevel).subscribe(result => {
      this.data = result;
      this.isShow = false;
    },
    error => {

    });
  }

}
