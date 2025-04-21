declare module 'lodash' {
  export function cloneDeep<T>(value: T): T;
  export function omit<T extends object, K extends keyof T>(object: T, ...paths: K[]): Omit<T, K>;
  export function omit<T extends object>(object: T, paths: string[]): Partial<T>;
  // 添加其他你需要的lodash函数
  export default {
    cloneDeep,
    omit
  };
}
