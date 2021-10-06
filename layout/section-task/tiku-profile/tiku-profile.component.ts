import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MyClassService } from 'src/app/busi-services/my-class.service';
import {LocalStorageUtil} from 'core/utils/localstorage.util';

@Component({
  selector: 'app-tiku-profile',
  templateUrl: './tiku-profile.component.html',
  styleUrls: ['./tiku-profile.component.less']
})
export class TikuProfileComponent implements OnInit {
  backUrl = 'p/structure?flat=new';
  courseList = [];
  coursePacketId = '';
  chapters = [];
  selectedCourse: any;
  menusNav = [{ id: 0, name: '题库集' }, { id: 1, name: '错题集' }, { id: 2, name: '收藏'}];
  // 选中菜单， 初始化默认为第一
  curMenu = { id: 0, name: '题库集' };
  loading = false;
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private myClassService: MyClassService) { }

  ngOnInit(): void {
    const classMarketData = LocalStorageUtil.getClassMarketData();
    const orderId = classMarketData.id;
    this.defaultSelectMenu();
    this.getCourse(orderId);
  }

  goBack() {
    this.router.navigateByUrl(this.backUrl);
  }

  /** 获取课程列表 */
  getCourse(orderId: string) {
    this.loading = true;
    this.myClassService.getCourses(orderId).subscribe(res => {
      this.loading = false;
      if (res.status === 200) {
        this.courseList = res.data.orderDetails;
        if (this.courseList.length > 0) {
          const coursePacktet = this.defaultCoursePacket();
          this.coursePacketId = coursePacktet.coursePacketId;
          this.courseChange(this.coursePacketId);
        }
      }
    }, error => {
      this.loading = false;
    });
  }

  courseChange(coursePacketId: string): void {
    this.selectedCourse = this.courseList.find(course => course.coursePacketId === this.coursePacketId);
  }

  selectMenu(menu: any): void {
    this.curMenu = menu;
  }

  defaultSelectMenu() {
    const tikuType = parseInt(this.route.snapshot.queryParamMap.get('tikuType'), 10);
    if (Number.isFinite(tikuType)) {
      this.selectMenu({id: tikuType - 1});
    }
  }

  defaultCoursePacket(): any {
    const coursePacketId = this.route.snapshot.queryParamMap.get('coursePacketId');
    const coursePacktet = this.courseList.find(course => course.coursePacketId === coursePacketId);
    if (coursePacktet) {
      return coursePacktet;
    } else {
      return this.courseList[0];
    }
  }

}
