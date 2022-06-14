import { createProxy, isChanged } from "proxy-compare";

const cleanupMark = Symbol.for("computed:cleanup");

// memoize function inspired by https://github.com/alexreardon/memoize-one
// deps-change detection based on proxy-compare by dai-shi https://github.com/dai-shi/proxy-compare
export function simpleMemoizedFn<T extends (state: any) => any>(fn: T) {
  const affected = new WeakMap();
  let cache: { lastResult: ReturnType<T>; lastState: Parameters<T>[0] } | null = null;
  return function (state: Parameters<T>[0]): ReturnType<T> {
    if (cache && !isChanged(cache.lastState, state, affected)) {
      // If the require dependencies are the same, return the cached result
      return cache.lastResult;
    }
    // Run cleanup function, if has
    if (cache && cache.lastResult[cleanupMark]) {
      cache.lastResult[cleanupMark]();
    }
    const proxy = createProxy(state, affected);
    const newResult = fn(proxy);
    cache = { lastResult: newResult, lastState: state };
    return newResult;
  };
}

/** call the cleanup function when computed value will be change
 * 
 * especially useful for promise result
 */
export const withCleanup = <T extends object>(config: { value: T; cleanup: () => void }): T => {
  const { value, cleanup } = config;
  (value as any)[cleanupMark] = cleanup;
  return value;
};

export const mapObject = <T extends object, R>(obj: T, fn: (value: T[keyof T], key: keyof T) => R): { [key in keyof T]: R } => {
  const result = {} as { [key in keyof T]: R };
  for (const key in obj) {
    result[key as unknown as keyof typeof result] = fn(obj[key], key);
  }
  return result;
};
