declare module 'jsencrypt' {
  interface JSEncrypt {
    constructor();
    setPublicKey(pk: string): void;
    encrypt(key: string): string;
  }
}
