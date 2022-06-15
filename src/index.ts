import { SetState, State, StateCreator } from "zustand";
import { Computed, PopArgument } from "./types";
import { mapObject, simpleMemoizedFn, withCleanup } from "./utils";

const getComputedDict = <S, C extends Record<string, (state: S) => unknown>>(computedConfig: C, state: S) => {
  return mapObject(computedConfig, (fn) => fn(state));
};

const computedImpl = <S extends State, C extends Record<string, (state: S) => unknown>>(
  f: PopArgument<StateCreator<S, [], []>>,
  _computedConfig: C | undefined
): ((_computedConfig: C) => typeof f) | typeof f => {
  if (_computedConfig === undefined) {
    return (computedConfig: C) => computedImpl(f, computedConfig) as typeof f;
  }
  return (set, get, store) => {
    const computedConfig = mapObject(_computedConfig, (fn) => simpleMemoizedFn(fn));
    const setWithComputed: SetState<S> = (update, replace) => {
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
};

const computed = computedImpl as Computed;

export { withCleanup, computed };
