abstract class Storage {
  storageType: string

  constructor(storageType: string) {
    this.storageType = storageType;
  }

  getItem(name: string): any {
    const data = window[this.storageType].getItem(name);
    try {
      return JSON.parse(data);
    } catch (err) {
      return data;
    }
  }

  removeItem(name): void {
    if (name) window[this.storageType].removeItem(name);
  }

  setItem(name: string, data: any): string | null {
    if (!name) return null;
    return window[this.storageType].setItem(name, JSON.stringify(data));
  }
}

// sessionStorage 工具类
class SessionStorage extends Storage {
  constructor() {
    super('sessionStorage');
  }
}

// localStorage 工具类
class LocalStorage extends Storage {
  constructor() {
    super('localStorage');
  }
}

export const sessionStorage = new SessionStorage();
export const localStorage = new LocalStorage();
