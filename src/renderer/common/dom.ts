export function hasClass(el: Element, token: string): boolean {
  return new RegExp('(\\s|^)' + token + '(\\s|$)').test(el.className);
}

export function addClass(el: Element, token: string): void {
  if (!el) return;
  if (el.classList) {
    el.classList.add(token);
  } else if (!this.hasClass(el, token)) {
    el.className += '' + token;
  }
}

export function removeClass(el: Element, token: string): void {
  if (!el) return;
  if (el.classList) {
    el.classList.remove(token);
  } else if (this.hasClass(el, token)) {
    el.className = el.className.replace(new RegExp('(\\s|^)' + token + '(\\s|$)'), ' ').replace(/^\s+|\s+$/g, '');
  }
}
