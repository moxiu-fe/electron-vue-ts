import { isDate, timeFormat, getUUID } from '@common/helper';

export function isFile(value: any): boolean {
  return value instanceof File;
}

export function isImageFile(value: any): boolean {
  return value instanceof File && /^image\/.*$/i.test(value.type);
}

export function isAudioFile(value: any): boolean {
  return value instanceof File && /^audio\/.*$/i.test(value.type);
}

export function isVideoFile(value: any): boolean {
  return value instanceof File && /^video\/.*$/i.test(value.type);
}

/**
 * 语义化时间（刚刚、hh:mm、昨天 hh:mm、yyyy-MM-dd hh:mm）
 * @param {Date} time 时间
 * @return {String} 语义化后的字符串
 */
export function semanticTimeFormat(time: Date | string | number): string {
  const date: Date = isDate(new Date(time)) ? new Date(time) : new Date();
  const currDate: Date = new Date();
  const diffDate: number = (currDate.getTime() - date.getTime()) / (60 * 1000);
  switch (true) {
    case diffDate <= 1:
      return '刚刚';
    case timeFormat(currDate, 'yyyy-MM-dd') === timeFormat(date, 'yyyy-MM-dd'):
      return timeFormat(date, 'hh:mm');
    case currDate.setDate(currDate.getDate() - 1) &&
      timeFormat(currDate, 'yyyy-MM-dd') === timeFormat(date, 'yyyy-MM-dd'):
      return '昨天 ' + timeFormat(date, 'hh:mm');
    default:
      return timeFormat(date, 'yyyy-MM-dd hh:mm');
  }
}

/**
 * notification
 * @param {String} title Notification title
 * @param {Object} options Notification options
 * @return {undefined | Object} undefined or Notification实例
 */
export function notification(title: string, options: { body?: string; tag?: string; data?: string; icon?: string }, clickCallback: (event: any) => any) {
  options.tag = options.tag || getUUID();
  title = typeof title === 'string' ? title.slice(0, 60) : ''; // 标题限制60个字符

  if (Notification.permission === 'granted') {
    let instance: Notification | null = new Notification(title, options);
    // eslint-disable-next-line space-before-function-paren
    instance.onclick = function (event) {
      clickCallback(event);
      instance = null;
    };
  } else if (Notification.permission !== 'denied') {
    // 否则向用户获取权限
    // eslint-disable-next-line space-before-function-paren
    Notification.requestPermission(function (permission) {
      if (permission === 'granted') {
        let instance: Notification | null = new Notification(title, options);
        // eslint-disable-next-line space-before-function-paren
        instance.onclick = function (event) {
          clickCallback(event);
          instance = null;
        };
      }
    });
  }
}

// 获取光标相对于文档的坐标
export function getSelectionCoords(win?: any): { x: number; y: number } {
  win = win || window;
  const doc: any = window.document;
  let sel = doc.selection;
  let range;
  let rects;
  let rect;
  let x = 0;
  let y = 0;
  if (sel) {
    if (sel.type !== 'Control') {
      range = sel.createRange();
      range.collapse(true);
      x = range.boundingLeft;
      y = range.boundingTop;
    }
  } else if (window.getSelection) {
    sel = window.getSelection();
    if (sel.rangeCount) {
      range = sel.getRangeAt(0).cloneRange();
      if (range.getClientRects) {
        range.collapse(true);
        rects = range.getClientRects();
        if (rects.length > 0) {
          rect = rects[0];
        }
        // 光标在行首时，rect为undefined
        if (rect) {
          x = rect.left;
          y = rect.top;
        }
      }
      // Fall back to inserting a temporary element
      if ((x === 0 && y === 0) || rect === undefined) {
        const span = doc.createElement('span');
        if (span.getClientRects) {
          // Ensure span has dimensions and position by
          // adding a zero-width space character
          span.appendChild(doc.createTextNode('\u200b'));
          range.insertNode(span);
          rect = span.getClientRects()[0];
          x = rect.left;
          y = rect.top;
          const spanParent = span.parentNode;
          spanParent.removeChild(span);

          // Glue any broken text nodes back together
          spanParent.normalize();
        }
      }
    }
  }
  return { x, y };
}
