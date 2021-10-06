import {Component} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import {LocalStorageUtil} from 'core/utils/localstorage.util';
import {environment} from 'src/environments/environment';
import {ToolsUtil} from 'core/utils/tools.util';
import {timer} from 'rxjs';

@Component({
  selector: 'app-exercise-library',
  templateUrl: './exercise-library.component.html',
  styleUrls: ['./exercise-library.component.less'],
})
export class ExerciseLibraryComponent {
  _PAGE_ID_ = 'ExerciseLibraryComponent';
  orgCode = ToolsUtil.getOrgCode();
  url;
  codeMap = {
    cjsd: 1,
    zksd: 2,
    zxjy: 3,
    hgls: 4,
    qm: 5
  };
  tokenObj = LocalStorageUtil.getTkToken();

  constructor(
    private sanitizer: DomSanitizer,
  ) {
    this.getUrl();
  }

  async getUrl() {
    const codeUid = await ToolsUtil.getProdIdSync();
    this.url = this.sanitizer.bypassSecurityTrustResourceUrl(
      environment.questionBank + '/#/questionList?proId='
      + codeUid +
      '&token=' + this.tokenObj.token +
      '&refreshToken=' + this.tokenObj.refreshToken +
      '&show_layout=false');
  }

}
