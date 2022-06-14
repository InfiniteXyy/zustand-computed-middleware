import { SetState } from "zustand";
import { Computed, ComputedImpl, GenComputed } from "./types";
import { mapObject, simpleMemoizedFn, withCleanup } from "./utils";

const getComputedDict = <S, C extends Record<string, (state: S) => unknown>>(computedConfig: C, state: S) => {
  return mapObject(computedConfig, (fn) => fn(state));
};

const computedImpl: ComputedImpl = (f, _computedConfig) => (set, get, store) => {
  const computedConfig = mapObject(_computedConfig, (fn) => simpleMemoizedFn(fn));
  const setWithComputed: SetState<ReturnType<typeof f>> = (update, replace) => {
    set((state) => {
      const updated = typeof update === "object" ? update : update(state);
      const newState = { ...state, ...updated };
      return { ...updated, ...getComputedDict(computedConfig, newState) };
    }, replace);
  };
  store.setState = setWithComputed;
  const state = f(setWithComputed, get, store);
  return { ...state, ...getComputedDict(computedConfig, state) };
};

const computed = computedImpl as unknown as Computed;

export { withCleanup, computed };
