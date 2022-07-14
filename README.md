# Zustand Computed

Another zustand computed middleware

Inspired greatly by https://github.com/cmlarsen/zustand-middleware-computed-state

## Features

- Better type definition: built for zustand v4
- On-demand computing: only compute when needed, thanks to `proxy-compare`
- Cleanup function: useful for promise computed result

## Why not improve zustand-middleware-computed-state

zustand-middleware-computed-state API is designed in a different pattern, some features, (cleanup function / on demand computing) are not easy to support.

## Usage

### Install

```bash
yarn install zustand-computed-middleware zustand@4
```

### Basic Usage

```tsx
const useStore = create(
  computed(
    () => {
      return { count: 0, input: "abc" };
    },
    {
      doubled: ({ count }) => count * 2, // will use the cache unless count changes
      upperCase: ({ input }) => input.toUpperCase(),
    }
  )
);
```

### Cleanup function

```tsx
// cleanup
const useStore = create(
  computed(
    () => {
      return { index: 0 };
    },
    {
      pokemonDetail$: async ({ pokemonIndex }, { addCleanup }) => {
        const abortController = new AbortController();
        const abortSignal = abortController.signal;
        addCleanup(() => abortController.abort());
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonIndex}`, { signal: abortSignal });
        return await response.json();
      },
    }
  )
);
```

### TypeScript

If your store **has a setter/getter function** inside, you should define it explicitly.
The definition is not easy.

```ts
type State = { count: number; add: () => void };
type StateComputed = { doubled: (state: State) => number };
const useStore = create(
  computed<State, StateComputed>(
    (set) => {
      return { count: 0, add: () => set((s) => ({ count: s.count + 1 })) };
    },
    { doubled: (state) => state.count * 2 }
  )
);
```

To make it simpler, you can use it in a curried function way. And it's a workaround for https://github.com/microsoft/TypeScript/issues/10571 (this is also used in [zustand](https://github.com/pmndrs/zustand/blob/main/docs/typescript.md#basic-usage) v4)

A simple example can be found here [codesandbox](https://codesandbox.io/s/zustand-computed-middleware-demo-forked-9wkop4)

```ts
type State = { count: number; add: () => void };
const useStore = create(
  computed<State>((set) => {
    return { count: 0, add: () => set((state) => ({ count: state.count + 1 })) };
  })({
    doubled: (state) => state.count * 2,
  })
);
```
