import { SetState, State, StateCreator } from "zustand";
import { Computed, PopArgument, ComputeMethod } from "./types";
import { mapObject, getComputeMethod, getComputedResult } from "./utils";

const computedImpl = <S extends State, C extends Record<string, ComputeMethod<S>>>(
  f: PopArgument<StateCreator<S, [], []>>,
  computedConfig: C | undefined
): ((computedConfig: C) => typeof f) | typeof f => {
  if (computedConfig === undefined) {
    return (computedConfig: C) => computedImpl(f, computedConfig) as typeof f;
  }
  return (set, get, store) => {
    const computedMethods = mapObject(computedConfig, (fn) => getComputeMethod(fn));
    const setWithComputed: SetState<S> = (update, replace) => {
      set((state) => {
        const updated = typeof update === "object" ? update : update(state);
        const newState = { ...state, ...updated };
        return { ...updated, ...getComputedResult(computedMethods, newState) };
      }, replace);
    };
    store.setState = setWithComputed;
    const state = f(setWithComputed, get, store);
    return { ...state, ...getComputedResult(computedMethods, state) };
  };
};

const computed = computedImpl as Computed;

export { computed };
