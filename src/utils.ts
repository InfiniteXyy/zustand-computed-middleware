import { createProxy, isChanged } from "proxy-compare";
import { ComputeMethod } from "./types";

export const mapObject = <T extends object, R>(obj: T, fn: (value: T[keyof T], key: keyof T) => R): { [key in keyof T]: R } => {
  const result = {} as { [key in keyof T]: R };
  for (const key in obj) {
    result[key as unknown as keyof typeof result] = fn(obj[key], key);
  }
  return result;
};

// memoize function inspired by https://github.com/alexreardon/memoize-one
// deps-change detection based on proxy-compare by dai-shi https://github.com/dai-shi/proxy-compare
/** Get computed methods from the computed config, handling memoizing and modifiers */
export function getComputeMethod(fn: ComputeMethod) {
  const affected = new WeakMap();
  let cache: { lastResult: unknown; lastState: unknown; cleanup?: () => void } | null = null;
  return function (state: unknown): unknown {
    if (cache && !isChanged(cache.lastState, state, affected)) {
      // If the require dependencies are the same, return the cached result
      return cache.lastResult;
    }
    // Run cleanup function, if has
    //  especially useful for promise result
    if (cache && cache.cleanup) {
      cache.cleanup();
    }
    const proxy = createProxy(state, affected);
    let cleanup: (() => void) | undefined;
    const newResult = fn(proxy, {
      addCleanup: (_cleanup) => (cleanup = _cleanup),
    });
    cache = { lastResult: newResult, lastState: state, cleanup };
    return newResult;
  };
}

/** Get computed result from the computed methods */
export const getComputedResult = <S, C extends Record<string, (state: S) => unknown>>(computedMethods: C, state: S) => {
  return mapObject(computedMethods, (fn) => fn(state));
};
