export interface Logger {
  info(obj: object | string, msg?: string): void;
  warn(obj: object | string, msg?: string): void;
  error(obj: object | string, msg?: string): void;
  debug(obj: object | string, msg?: string): void;
  child?(bindings: object): Logger;
}

function format(obj: object | string, msg?: string): string {
  if (typeof obj === "string") return obj;
  return msg ? `${msg} ${JSON.stringify(obj)}` : JSON.stringify(obj);
}

export const logger: Logger = {
  info: (obj, msg) => console.log(`[info]  ${format(obj, msg)}`),
  warn: (obj, msg) => console.warn(`[warn]  ${format(obj, msg)}`),
  error: (obj, msg) => console.error(`[error] ${format(obj, msg)}`),
  debug: (obj, msg) => console.debug(`[debug] ${format(obj, msg)}`),
};
