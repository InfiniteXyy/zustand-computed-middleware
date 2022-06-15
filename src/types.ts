import { State, StateCreator, StoreMutatorIdentifier, Mutate, StoreApi, SetState } from "zustand";

export type GenComputed<C extends Record<string, (state: any) => any>> = { [K in keyof C]: ReturnType<C[K]> };

export type PopArgument<T extends (...a: never[]) => unknown> = T extends (...a: [...infer A, infer _]) => infer R ? (...a: A) => R : never;

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
    C extends Record<string, (state: S) => unknown>,
    Mps extends [StoreMutatorIdentifier, unknown][] = [],
    Mcs extends [StoreMutatorIdentifier, unknown][] = []
  >(
    f: StateCreator<S, [...Mps, ["computed", C]], Mcs>,
    computedConfig: C
  ): StateCreator<S & GenComputed<C>, Mps, [["computed", C], ...Mcs]>;

  <S extends State, Mps extends [StoreMutatorIdentifier, unknown][] = [], Mcs extends [StoreMutatorIdentifier, unknown][] = []>(
    f: StateCreator<S, [...Mps, ["computed", unknown]], Mcs>
  ): <C extends Record<string, (state: S) => unknown>>(
    computedConfig: C
  ) => StateCreator<S & GenComputed<C>, Mps, [["computed", C], ...Mcs]>;
}
