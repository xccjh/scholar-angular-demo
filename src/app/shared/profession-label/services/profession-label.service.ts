import { Injectable, Injector } from '@angular/core';
import { HttpService } from 'core/services/http.service';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ProfessionLabelService {

    constructor(private injector: Injector) {

    }

    get httpService() {
        return this.injector.get(HttpService);
    }

    getByIds(ids: string): Observable<any> {
        return new Observable<any>(observe => {
            const options = {
                isCommonHttpHeader: true
            };
            const param = {
                ids
            };
            this.httpService.post('res/tag/getByIds', param, options).subscribe(
                result => {
                    if (result.status === 200) {
                        observe.next(result.data);
                        observe.unsubscribe();
                    }
                },
                error => {
                    observe.error(error);
                }
            );
        });
    }

    getTags(pids: string[] | string): Observable<any> {
        return new Observable<any>(observe => {
            const options = {
                isCommonHttpHeader: true
            };
            let postData = [];
            if (typeof pids === 'string') {
                postData = [pids];
            } else {
                postData = pids;
            }
            const param = {
                pids: JSON.stringify(postData)
            };
            this.httpService.post('res/tag/listBuildTags', param, options).subscribe(
                result => {
                    if (result.status === 200) {
                        observe.next(result.data);
                        observe.unsubscribe();
                    }
                },
                error => {
                    observe.error(error);
                }
            );
        });
    }
    // tagType: 11:学科标签，12：知识标签
    saveTags(id: string, tagName: string, pid: string, tagType: string, tagLevel: string): Observable<any> {
        return new Observable<any>(observe => {
            const options = {
                isCommonHttpHeader: true
            };
            const param = { id, tagName, pid, tagType, tagLevel };
            this.httpService.post('res/tag/save', param, options).subscribe(
                result => {
                    if (result.status === 201) {
                        observe.next(result.data);
                        observe.unsubscribe();
                    }
                },
                error => {
                    observe.error(error);
                }
            );
        });
    }


    delTags(id: string): Observable<any> {
        return new Observable<any>(observe => {
            const options = {
                isCommonHttpHeader: true
            };
            const param = {
                id
            };
            this.httpService.post('res/tag/del', param, options).subscribe(
                result => {
                    if (result.status === 204) {
                        observe.next(result);
                        observe.unsubscribe();
                    }
                },
                error => {
                    observe.error(error);
                }
            );
        });
    }



}
