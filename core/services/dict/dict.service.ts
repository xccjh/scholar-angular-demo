import { Injectable } from '@angular/core';
import { HttpService } from '../http.service';
import { Observable } from 'rxjs';
import { DictGroup } from '../../base/common';
import { SessionStorageUtil } from '../../utils/sessionstorage.util';

@Injectable({
  providedIn: 'root'
})
export class DictService {

  constructor( private httpService: HttpService) {
  }
  getDictBycode(code: string): Observable<DictGroup> {
    console.log(code);
    return new Observable<any>(observe => {
      const dict = SessionStorageUtil.getDictGroupByCode(code);
      if (dict && dict != null) {
        observe.next( dict);
        observe.unsubscribe();
      } else {
        const options = {
          isCommonHttpHeader: true
        };
        this.httpService.post('sys/combo', {groupCode: code}, options).subscribe(
          result => {
            let data: DictGroup = null;
            if (result.status === 200) {
              data =  {
                groupCode: code,
                dicts: result.data
              };
              SessionStorageUtil.putDictGroup(data);
            }
            observe.next(data);
            observe.unsubscribe();
          },
          error => {
            observe.error(error);
            observe.unsubscribe();
          }
        );
      }
    });
  }
}
