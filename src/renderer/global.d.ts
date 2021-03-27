interface Window {
  SKAPP?: { onEvent: (a: string, d: string) => any };
  wiseAPM?: {
    notifyError: (d: any) => void,
    customError: (d: {
      message: string,
      stack: string,
      sourceURL: string
      line?: string,
      column?: string
    }) => any
  }
}
