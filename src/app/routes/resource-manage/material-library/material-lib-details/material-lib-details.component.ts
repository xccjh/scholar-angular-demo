import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { MaterialLibraryService } from '../../../../busi-services/material-library.service';


@Component({
  selector: 'app-material-lib-details',
  templateUrl: './material-lib-details.component.html',
  styleUrls: ['./material-lib-details.component.less'],
})
export class MaterialLibDetailsComponent implements OnInit {

  type = '';

  constructor(
    private route: ActivatedRoute
  ) {}


  ngOnInit(): void {
    this.type = this.route.snapshot.paramMap.get('type');
  }


}
