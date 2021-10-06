import {Injectable} from '@angular/core';
import {NzUploadXHRArgs, NzMessageService} from 'ng-zorro-antd';
import {
  HttpRequest,
  HttpEvent,
  HttpEventType,
  HttpResponse,
} from '@angular/common/http';
import {HttpService} from './http.service';
import {queryParam, ToolsUtil} from '../utils/tools.util';
import * as OSS from 'ali-oss';
import {defer, throwError, of, Observable, timer} from 'rxjs';
import {tap, switchMap, delay, retryWhen, scan} from 'rxjs/operators';
import {environment} from 'src/environments/environment';
import {NzUploadXHRArgsExtend} from '../base/common';
import {hex_sha1} from '../utils/sha1';
import {ServicesModule} from '@app/service/service.module';

export interface UploadTask {
  /**
   * 直接上传：true， 断点上传： false
   */
  isDirect: boolean;
  policy: any;
  uploadXhrArgs: NzUploadXHRArgs;
  objectName: string;
  undoneUploadPart: {
    done: boolean;
    lastCheckPoints: any;
  };
}

@Injectable({
  providedIn: ServicesModule
})
export class AliOssService {
  ossClient: OSS;
  uploadTasks: UploadTask[] = [];
  percent = 0;
  percentReport: (percent: number) => void;
  downloadPolicy: any;
  constructor(
    private httpService: HttpService,
    private nzMsg: NzMessageService
  ) {
  }

  createObjectName(dir: string, filename: string) {
    return `${dir}${ToolsUtil.getRandomFileName()}.${ToolsUtil.getFileExt(
      filename
    )}`;
  }


  addUploadTask(
    uploadXhrArgs: NzUploadXHRArgs,
    policy: any,
    isDirect?: boolean
  ) {
    const task: UploadTask = {
      isDirect,
      uploadXhrArgs,
      policy,
      objectName: this.createObjectName(policy.dir, uploadXhrArgs.file.name),
      undoneUploadPart: {
        done: true,
        lastCheckPoints: {},
      },
    };
    this.uploadTasks.push(task);
    return task;
  }

  download(data) {
    const filename = data.attachmentName || data.materialName;
    let url = '';
    if (data.sourceType === '2') {
      const params: any = {
        ptime: (new Date()).getTime(),
        vid: data.attachmentPath,
      };
      const sign = hex_sha1(queryParam(params) + environment.secretkey);
      params.sign = sign.toUpperCase();
      const apiUrl = environment.polywayApi + 'v2/video/' + environment.userid + '/get-video-msg';
      ToolsUtil.getAjax(apiUrl, params).subscribe((res) => {
        try {
          const result = JSON.parse(res);
          if (result.code !== 200) {
            this.nzMsg.error(result.msg);
            return false;
          }
          if (result.data[0]) {
            if (window.location.href.includes('https') && result.data[0].mp4.includes('http')) {
              url = result.data[0].mp4.replace('http', 'https');
            } else {
              url = result.data[0].mp4;
            }
            this.nzMsg.success('文件开始下载中...');
            this.baoliweiDownload(url, filename);
          }
        } catch (e) {
          this.nzMsg.error(res || e);
        }

      });
    } else {
      url = data.attachmentPath || data.materialUrl;
      this.downloadFile(filename, url).subscribe(res => {
        this.nzMsg.success('文件开始下载中...');
      }, err => {
        this.nzMsg.error(err);
      });
    }
  }


  baoliweiDownload(videoUrl, filename) {
    this.getBlob(videoUrl).then((blob) => {
      this.saveAs(blob, filename);
    });
  }
  getBlob = (url) => {
    return new Promise((resolve) => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', url, true);
      xhr.responseType = 'blob';
      xhr.onload = () => {
        if (xhr.status === 200) {
          resolve(xhr.response);
        }
      };
      xhr.send();
    });
  }
  saveAs = (blob, filename = '') => {
    if (window.navigator.msSaveOrOpenBlob) {
      navigator.msSaveBlob(blob, filename);
    } else {
      const link = document.createElement('a');
      const body = document.querySelector('body');
      link.href = window.URL.createObjectURL(blob); // 创建对象url
      link.download = filename;
      link.style.display = 'none';
      body.appendChild(link);
      link.click();
      body.removeChild(link);
      window.URL.revokeObjectURL(link.href); // 通过调用 URL.createObjectURL() 创建的 URL 对象
    }
  }



  downloadFile(filename: string, objectName: string): Observable<any> {
    return new Observable<any>(observer => {
      const policy$ = this.downloadPolicy ? of(this.downloadPolicy) : this.getPolicyMult('/');
      policy$.subscribe( res => {
        if (res.status === 200) {
          if (!this.downloadPolicy) {
            this.downloadPolicy = res;
          }
          try {
            console.log(res.data);
            this.createOssClient(res.data);
            if (objectName.startsWith(environment.OSS_URL)) {
              objectName = objectName.substring(environment.OSS_URL.length, objectName.length + 1);
              console.log('attachmentPath', objectName);
            }
            const url = this.getSignatureUrl(filename, objectName);
            this.gotoDownload('', url);
            observer.next('');
            observer.complete();
          } catch (error) {
            observer.error(JSON.stringify(error) || '下载失败');
          }
        } else {
          observer.error(res.message || '获取签名失败');
        }
      });
    });
  }


  getUploadTask(objectName: string) {
    return this.uploadTasks.find((task) => task.objectName === objectName);
  }

  createOssClient(policy: any) {
    if (!this.ossClient) {
      console.log(policy);
      this.ossClient = new OSS({
        bucket: policy.bucket,
        accessKeyId: policy.accessKeyId,
        accessKeySecret: policy.accessKeySecret,
        stsToken: policy.securitytoken,
        endpoint: environment.endpoint,
      });
    }
  }

  getPartSize(fileSize: number) {
    const maxNumParts = 10 * 1000;
    const defaultPartSize = 1 * 1024 * 1024;
    const filesizeThreshold = 9 * 1000 * 1024 * 1024;
    const g = 1000;
    let partSize = 0;
    for (let i = 1; i < g; i++) {
      if (fileSize <= i * filesizeThreshold) {
        partSize = i * defaultPartSize;
        break;
      }
    }
    return Math.max(Math.ceil(fileSize / maxNumParts), partSize);
  }

  progressEvent = async (percentage: number, checkPoint: any, res: any) => {
    const objectName = checkPoint.name;
    const task = this.getUploadTask(objectName);
    if (!task) {
      return;
    }
    task.undoneUploadPart.lastCheckPoints = checkPoint;
    this.percentReport(percentage * 100);
    task.uploadXhrArgs.onProgress(
      {percent: percentage * 100},
      task.uploadXhrArgs.file
    );
  }

  /**
   * 分片上传
   * @param objectName 文件名
   * @param file 文件
   */
  async multipartUpload(uploadTask: UploadTask) {
    try {
      // object-name可以自定义为文件名（例如file.txt）或目录（例如abc/test/file.txt）的形式，实现将文件上传至当前Bucket或Bucket下的指定目录。
      const partSize = this.getPartSize(uploadTask.uploadXhrArgs.file.size);
      const opts: OSS.MultipartUploadOptions = {
        partSize,
        progress: this.progressEvent,
        checkpoint: uploadTask.undoneUploadPart.done
          ? undefined
          : uploadTask.undoneUploadPart.lastCheckPoints,
      };
      const result = await this.ossClient.multipartUpload(
        uploadTask.objectName,
        uploadTask.uploadXhrArgs.file,
        opts
      );
      uploadTask.undoneUploadPart.done = true;
      return {code: 200, data: result};
    } catch (e) {
      uploadTask.undoneUploadPart.done = false;
      return {code: 400, data: e};
    }
  }

  resumeUpload(uploadTask: UploadTask) {
    this.createOssClient(uploadTask.policy);
    return defer(async () => {
      return await this.multipartUpload(uploadTask);
    })
      .pipe(
        switchMap((res) => {
          if (res.code === 400) {
            return throwError(res.data);
          } else {
            return of(res.data);
          }
        }),
        retryWhen((err$) => {
          return err$.pipe(
            tap((err) => {
              this.nzMsg.error(
                this.getErrorDesc(err.code) + ',5秒后重新尝试上传！'
              );
            }),
            delay(5000),
            scan((acc, curr) => {
              if (acc > 2) {
                throw curr;
              }
              return acc + 1;
            }, 0)
          );
        })
      )
      .subscribe(
        (result) => {
          if (result.res.status === 200) {
            uploadTask.uploadXhrArgs.file.key = '/' + result.name;
            uploadTask.uploadXhrArgs.file.url = ToolsUtil.getOssUrl(
              uploadTask.uploadXhrArgs.file.key
            );
            uploadTask.uploadXhrArgs.onSuccess(
              result,
              uploadTask.uploadXhrArgs.file,
              {}
            );
          } else {
            uploadTask.uploadXhrArgs.onError(
              result,
              uploadTask.uploadXhrArgs.file
            );
          }
        },
        (err) => {
          uploadTask.uploadXhrArgs.onError(err, uploadTask.uploadXhrArgs.file);
          if (err.code === 'ConnectionTimeoutError') {
            this.nzMsg.error(
              this.getErrorDesc(err.code) + ',请到更换网络再试！',
              {nzDuration: 6000}
            );
          } else if (err.code === 'RequestError') {
            this.nzMsg.error(
              this.getErrorDesc(err.code) + ',请检查是否有网络！',
              {nzDuration: 6000}
            );
          } else {
            this.nzMsg.error(this.getErrorDesc(err.code) + err.code, {
              nzDuration: 6000,
            });
          }
        }
      );
  }

  getErrorDesc(code: string) {
    switch (code) {
      case 'ConnectionTimeoutError':
        return '网络超时';

      case 'RequestError':
        return '请求出错';

      default:
        return '未知错误';
    }
  }

  getPolicyMult(dir: string) {
    return this.httpService.post(
      'res/oss/getPolicyMult',
      {dir},
      ToolsUtil.getHttpOptions()
    );
  }

  getPolicyDirect(dir: string) {
    return this.httpService.post(
      'res/oss/getPolicy',
      {dir},
      ToolsUtil.getHttpOptions()
    );
  }

  getPolicy(isDirect: boolean, uploadDir: string) {
    if (isDirect) {
      return this.getPolicyDirect(uploadDir);
    } else {
      return this.getPolicyMult(uploadDir);
    }
  }

  isDirectUpload(filesize: number) {
    const filesizeThreshold = 20 * 1024 * 1024;
    return filesize < filesizeThreshold;
  }

  upload2AliOSS(uploadXhrArgs: NzUploadXHRArgsExtend, uploadDir: string) {
    const isDirect = this.isDirectUpload(uploadXhrArgs.file.size);
    this.percentReport = uploadXhrArgs.percentReport;
    return this.getPolicy(isDirect, uploadDir).subscribe((res) => {
      if (res.status === 200) {
        const policy = res.data;
        const uploadTask = this.addUploadTask(uploadXhrArgs, policy, isDirect);
        if (isDirect) {
          this.directUpload2AliOSS(uploadTask);
        } else {
          this.resumeUpload(uploadTask);
        }
      } else {
        const errMsg = res.message || '获取签名失败';
        uploadXhrArgs.onError(errMsg, uploadXhrArgs.file);
        this.nzMsg.error(errMsg, {nzDuration: 5000});
      }
    });
  }

  directUpload2AliOSS(uploadTask: UploadTask) {
    const that = this;
    const formData = new FormData();
    formData.append('key', uploadTask.objectName);
    formData.append('policy', uploadTask.policy.policy);
    formData.append('OSSAccessKeyId', uploadTask.policy.accessKeyId);
    formData.append('Signature', uploadTask.policy.signature);
    formData.append('file', uploadTask.uploadXhrArgs.postFile as any);
    formData.append('success_action_status', '200');
    const req = new HttpRequest('POST', environment.OSS_URL, formData, {
      reportProgress: true,
    });

    return this.httpService.originalHttpClient.request(req).subscribe(
      (event: HttpEvent<any>) => {
        if (event.type === HttpEventType.UploadProgress) {
          if (event.total > 0) {
            Object.defineProperty(event, 'percent', {
              configurable: true,
              get() {
                return that.percent;
              },
              set(val) {
                if(that.percentReport) {
                  that.percentReport(val);
                }
                that.percent = val;
              },
            });
            (event as any).percent = (event.loaded / event.total) * 100;
          }
          uploadTask.uploadXhrArgs.onProgress(
            event,
            uploadTask.uploadXhrArgs.file
          );
        } else if (event instanceof HttpResponse) {
          uploadTask.uploadXhrArgs.file.key = '/' + uploadTask.objectName;
          uploadTask.uploadXhrArgs.file.url = ToolsUtil.getOssUrl(
            uploadTask.objectName
          );
          uploadTask.uploadXhrArgs.onSuccess(
            event.body,
            uploadTask.uploadXhrArgs.file,
            event
          );
        }
      },
      (err) => {
        uploadTask.uploadXhrArgs.onError(err, uploadTask.uploadXhrArgs.file);
      }
    );
  }

  patchDownloadFileStudent(files: { filename: string, path: string }[]) {
    return new Observable<any>(observer => {
      const policy$ = this.downloadPolicy ? of(this.downloadPolicy) : this.getPolicyMult('/');
      policy$.subscribe( res => {
        if (res.status === 200) {
          if (!this.downloadPolicy) {
            this.downloadPolicy = res;
          }
          try {
            this.createOssClient(res.data);
            files.forEach((file, index) => {
              setTimeout(() => {
                const url = this.getSignatureUrl(file.filename, file.path);
                this.gotoDownload('', url);
                observer.next('');
              }, 1300 * (index + 1));
            });
          } catch (error) {
            observer.error(JSON.stringify(error) || '下载失败');
          }
        } else {
          observer.error(res.message || '获取签名失败');
        }
      });
    });
  }

  patchDownloadFile(filename: string, objectName: string): Observable<any> {
    const arr = objectName.toLowerCase().split('.');
    const ext = arr[arr.length - 1];
    if (!filename.toLowerCase().endsWith(ext)) {
      filename = filename + '.' + ext;
    }
    return new Observable<any>((observer) => {
      this.getPolicyMult('/').subscribe((res) => {
        if (res.status === 200) {
          this.createOssClient(res.data);
          const url = this.getSignatureUrl(filename, objectName);
          this.gotoDownload('', url);
          observer.next('');
          observer.complete();
        } else {
          observer.error(res.message || '获取签名失败');
        }
      });
    });
  }

  getSignatureUrl(filename: string, objectName: string) {
    return this.ossClient.signatureUrl(objectName, {
      response: {
        'content-disposition': `attachment; filename=${filename}`,
      },
    });
  }

  gotoDownload(filename: string, fileUrl: string) {
    const ele = document.createElement('iframe') as HTMLIFrameElement;
    ele.src = fileUrl;
    ele.width = '0px';
    ele.height = '0px';
    ele.style.display = 'none';
    document.body.appendChild(ele);
    timer(300).subscribe(() => {
      document.body.removeChild(ele);
    });
    // 支持HTML5下载属性的浏览器
    // const link = document.createElement('a');
    // const url = fileUrl;
    // link.setAttribute('href', url);
    // link.setAttribute('download', '知识图谱.xls');
    // link.style.visibility = 'hidden';
    // document.body.appendChild(link);
    // link.click();
    // document.body.removeChild(link);


    // const $eleForm = document.createElement('form');
    // $eleForm.setAttribute('method', 'get');
    // $eleForm.setAttribute('action','xx');
    // document.body.appendChild($eleForm);
    // $eleForm.submit();
  }
}
