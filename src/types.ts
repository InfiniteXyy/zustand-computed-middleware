import { State, StateCreator, StoreMutatorIdentifier, StoreApi, SetState } from "zustand";

export type PopArgument<T extends (...a: never[]) => unknown> = T extends (...a: [...infer A, infer _]) => infer R ? (...a: A) => R : never;

export type ComputedModifiers = {
  addCleanup: (cleanup: () => void) => void;
};

export type ComputeMethod<S = any, R = unknown> = (state: S, modifiers: ComputedModifiers) => R;

export type GenComputed<C extends Record<string, ComputeMethod<any>>> = { [K in keyof C]: ReturnType<C[K]> };

declare module "zustand" {
  type Write<T extends object, U extends object> = Omit<T, keyof U> & U;
  type Cast<T, U> = T extends U ? T : U;
  interface StoreMutators<S, A> {
    computed: Write<Cast<S, object>, { setState: S extends StoreApi<infer State> ? SetState<Omit<State, keyof A>> : SetState<{}> }>;
  }
}

export interface Computed {
  <
    S extends State,
    C extends Record<string, ComputeMethod<S>>,
    Mps extends [StoreMutatorIdentifier, unknown][] = [],
    Mcs extends [StoreMutatorIdentifier, unknown][] = []
  >(
    f: StateCreator<S, [...Mps, ["computed", C]], Mcs>,
    computedConfig: C
  ): StateCreator<S & GenComputed<C>, Mps, [["computed", C], ...Mcs]>;

  <S extends State, Mps extends [StoreMutatorIdentifier, unknown][] = [], Mcs extends [StoreMutatorIdentifier, unknown][] = []>(
    f: StateCreator<S, [...Mps, ["computed", unknown]], Mcs>
  ): <C extends Record<string, ComputeMethod<S>>>(computedConfig: C) => StateCreator<S & GenComputed<C>, Mps, [["computed", C], ...Mcs]>;
}
