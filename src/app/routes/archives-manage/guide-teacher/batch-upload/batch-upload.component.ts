import { Component, OnInit, ViewChild, TemplateRef, Output, EventEmitter } from '@angular/core';
import { NzModalService, NzMessageService } from 'ng-zorro-antd';
import { environment } from 'src/environments/environment';
import { AliOssService } from 'core/services/ali-oss.service';
import { UploadDir } from 'core/utils/uploadDir';
import { ToolsUtil } from 'core/utils/tools.util';
@Component({
  selector: 'app-batch-upload',
  templateUrl: './batch-upload.component.html',
  styleUrls: ['./batch-upload.component.less'],
  providers: [
    UploadDir
  ],
})
export class BatchUploadComponent implements OnInit {
  environment = environment;
  downloadTemplateUrl: string = ''
  guideTeacherUpdata: any = ''
  fileData: {
    name: ''
  };
  uploadOss: {}
  constructor(
    private msg: NzMessageService,
    private modalService:NzModalService,
    private aliOssService: AliOssService
  ) {
  }
  @ViewChild('batchUploadContent') batchUploadContent: TemplateRef<any>;
  @Output() changeTableList = new EventEmitter()
  ngOnInit(): void {
  }
  handleUploadFile (e) {
    const self = this
    const file = e.target.files[0]
    if (!file) return false
    const type = file.name.split('.')[1]
    console.log(type);
    const regList = ['xls', 'xlsx']
    if (!regList.includes(type)) return self.msg.warning(`抱歉,只支持${regList.join(',')}格式`);
    const size = file.size/1024
    let fileMaxSize = 1024;//1M
    fileMaxSize = fileMaxSize * 100
    if (size > fileMaxSize) return self.msg.warning('文件大小超出限制,大小不超过10M');
    self.fileData = file
    e.target.value = ''
  }
  // handleDownloadTemplate ():void {
  //   const link = document.createElement('a');
  //   link.download = '指导老师批量模板.xls';
  //   link.href = this.downloadTemplateUrl
  //   link.click();
  // }
  createUploadModal({ httpServer }):void {
    const self = this
    self.modalService.create({
      nzTitle: '批量导入',
      nzContent: self.batchUploadContent,
      nzMaskClosable: false,
      nzWrapClassName: 'vertical-center-modal',
      nzBodyStyle: {paddingBottom: '0px'},
      nzWidth: 400,
      nzCancelText: '取消',
      nzOkText: '确认上传',
      nzOnCancel: () => {
        self.fileData = {
          name: ''
        }
      },
      nzOnOk: (e) => {
        return new Promise((resolve, reject) => {
          if(!self.fileData || !self.fileData.name) {
            self.msg.warning('请选择文件');
            return reject(false)
          }
          const dir = UploadDir.courseware_case_doc
          self.aliOssService.getPolicyDirect(dir).subscribe(res => {
            const obj = res.data
            const { formData, key } = self.setFormData(obj, self.fileData)
            httpServer.upDataOss(formData).subscribe((res) => {
              if(res.url){
                httpServer.guideTeacherUpdata({url: key}).subscribe((data) => {
                  self.fileData = {
                    name: ''
                  }
                  if (data.status !== 201) return reject(false)
                  // console.log('上传成功');
                  // 更新列表
                  self.changeTableList.emit('changeList')
                  resolve(true)
                },() => {
                  console.log('上传失败');
                  reject(false)
                })
              }
            }, () => {
              self.msg.warning('抱歉,上传oss失败');
              reject(false)
            })
          }, () => {
            reject(false)
            self.msg.warning('抱歉,获取签名失败');
          })
        })
      }
    });
  }
  setFormData (obj, file) {
    // 签名
    const key = obj.dir + ToolsUtil.getRandomFileName() + '.' + ToolsUtil.getFileExt(this.fileData.name);
    const formData = new FormData();
    formData.append('OSSAccessKeyId', obj.accessKeyId);
    formData.append('policy', obj.policy);
    formData.append('Signature', obj.signature);
    formData.append('key', key);
    formData.append('success_action_status', '200');
    formData.append('file', file);
    return {
      formData,
      key
    }
  }
}
