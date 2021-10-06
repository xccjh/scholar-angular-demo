import {Component, OnInit, Output, EventEmitter, Input} from '@angular/core';
import {HttpService} from 'core/services/http.service';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'qkc-change-profession',
  templateUrl: './change-profession.component.html',
  styleUrls: ['./change-profession.component.less']
})
export class ChangeProfessionComponent implements OnInit {

  professionArr = [];
  isLoading = false;
  @Input() select = '';

  @Output() professionChange = new EventEmitter<any>();

  constructor(private httpService: HttpService) {
  }

  ngOnInit() {
    this.getProfessionList();
  }

  getProfessionList() {
    const options = {
      isCommonHttpHeader: true
    };
    this.isLoading = true;
    this.httpService.postBody('res/knowledgeSubject/listByUserId', {}, options).subscribe(
      result => {
        this.isLoading = false;
        if (result.status === 200) {
          this.professionArr = result.data;
          if (Array.isArray(this.professionArr) && this.professionArr.length > 0) {
            const curItem = (this.select
              ? this.professionArr.find(it => it.code === this.select)
              : this.professionArr[0]) || this.professionArr[0];
            this.professionChange.emit(curItem);
          }
        }
      },
      error => {
        this.isLoading = false;
      }
    );
  }

  changeProfession(item: any) {
    this.professionChange.emit(item);
  }

}
