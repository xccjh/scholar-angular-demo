/*
 * @Descripttion:
 * @Author: junjiaHuang
 * @Date: 2020-10-21 17:06:00
 * @LastEditors: junjiaHuang
 * @LastEditTime: 2020-10-22 11:38:31
 */
import {environment} from 'src/environments/environment';

export function limitNumberInRange(val: number, min: number, max: number): number {
  return Math.min(Math.max(val, min), max);
}


export function getPercent(min: number, max: number, val: number): number {
  return ((val - min) / (max - min)) * 100;
}


// 取[min, max]之间的一个随机数
export function getRandomInt(range: [number, number]): number {
  return Math.floor(Math.random() * (range[1] - range[0] + 1) + range[0]);
}

export function shuffle<T>(arr: T[]): T[] {
  const result = arr.slice();
  for (let i = 0; i < result.length; i++) {

    // 0和i 之间的一个随机数
    const j = getRandomInt([0, i]);

    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}


export function getFileThumbUrl(type: string): string {
  let thumbUrl = '';
  if (
    type === 'application/msword' ||
    type ===
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    type === 'doc' ||
    type === 'docx' || type === 'zip' || type === 'rar'
  ) {
    thumbUrl = environment.OSS_URL + '/common/doc.png';
  } else if (
    type === 'application/vnd.ms-excel' ||
    type === 'application/x-xls' ||
    type ===
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
    type === 'xls' ||
    type === 'xlsx'
  ) {
    thumbUrl = environment.OSS_URL + '/common/excel.png';
  } else if (
    type === 'application/x-ppt' ||
    type === 'application/vnd.ms-powerpoint' ||
    type ===
    'application/vnd.openxmlformats-officedocument.presentationml.presentation' ||
    type === 'ppt' ||
    type === 'pptx'
  ) {
    thumbUrl = environment.OSS_URL + '/common/ppt.png';
  } else if (type === 'application/pdf' || type === 'pdf') {
    thumbUrl = environment.OSS_URL + '/common/pdf.png';
  } else if (type === 'video/mp4' || type === 'mp4' || type === 'webm' || type === 'ogg') {
    thumbUrl = environment.OSS_URL + '/common/video.png';
  }
  return thumbUrl ||  environment.OSS_URL + '/common/video.png';
}
