const { networkInterfaces } = require('os');
const macRegex = /(?:[a-z0-9]{1,2}[:-]){5}[a-z0-9]{1,2}/i;
const zeroRegex = /(?:[0]{1,2}[:-]){5}[0]{1,2}/;

/**
 * Get the first proper MAC address
 * @param iface If provided, restrict MAC address fetching to this interface
 */
export function getMAC(iface: string = 'en0'): string {
  const list = networkInterfaces();
  if (iface) {
    const parts = list[iface];
    if (!parts) return;
    for (const part of parts) {
      if (zeroRegex.test(part.mac) === false) {
        return part.mac;
      }
    }
  } else {
    for (const [key, parts] of Object.entries(list)) {
      // for some reason beyond me, this is needed to satisfy typescript
      // fix https://github.com/bevry/getmac/issues/100
      // if (!parts) continue;
      // @ts-ignore
      for (const part of parts) {
        if (zeroRegex.test(part.mac) === false) {
          return part.mac;
        }
      }
    }
  }
}

/** Check if the input is a valid MAC address */
export function isMAC(macAddress: string): boolean {
  return macRegex.test(macAddress);
}
