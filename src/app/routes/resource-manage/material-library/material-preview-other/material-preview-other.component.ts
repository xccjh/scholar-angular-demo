import {Component, OnInit} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import {MaterialLibraryService} from '../../../../busi-services/material-library.service';
import {ActivatedRoute} from '@angular/router';
import {environment} from 'src/environments/environment';
import {MenuService} from '../../../../../../core/services/menu.service';

@Component({
  selector: 'app-material-preview-other',
  templateUrl: './material-preview-other.component.html',
  styleUrls: ['./material-preview-other.component.less'],
})
export class MaterialPreviewOtherComponent implements OnInit {

  data: any = {};

  id = '';
  type = '';
  professionId = '';

  isShow = false;

  constructor(
    private materialLibService: MaterialLibraryService,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private menuService: MenuService,
  ) {
  }

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id');
    this.type = this.route.snapshot.paramMap.get('type');
    this.professionId = this.route.snapshot.paramMap.get('professionId');

    this.materialLibService.getResourceDetail(this.id, this.type).subscribe(result => {
      if (result.status === 200) {
        const url = environment.ow365 + environment.OSS_URL + result.data.resourceUrl;
        result.data.resourceUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
        this.data = result.data;
        setTimeout(() => {
          this.isShow = true;
        }, 200);
      }
    }, error => {

    });
  }

  backtolist() {
    this.menuService.goBack();
  }

}
