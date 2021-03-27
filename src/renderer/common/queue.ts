
export default class Queue<T> {
  private dataStore: T[];

  constructor() {
    this.dataStore = [];
  }

  // 入队
  enqueue(...element: T[]): void {
    this.dataStore.push(...element);
  }

  // 出队
  dequeue(): T {
    return this.dataStore.shift();
  }

  // 队首
  front(): T {
    return this.dataStore[0];
  }

  // 队尾
  back(): T {
    return this.dataStore[this.size() - 1];
  }

  size(): number {
    return this.dataStore.length;
  }

  isEmpty(): boolean {
    return this.size() === 0;
  }

  clear(): void {
    this.dataStore = [];
  }

  toString(): string {
    let str = '';
    for (let i = 0, len = this.size(); i < len; i++) {
      str += String.prototype.toString.apply(this.dataStore[i]) + '\n';
    }
    return str;
  }
}
