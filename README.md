# Zustand Computed

Another zustand computed middleware

Inspired greatly by https://github.com/cmlarsen/zustand-middleware-computed-state

## Usage

```bash
yarn install zustand-computed-middleware zustand@4
```

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

```tsx
// cleanup
const useStore = create(
  computed(
    () => {
      return { index: 0 };
    },
    {
      pokemonDetail$: ({ index }) => {
        const abortController = new AbortController();
        const abortSignal = abortController.signal;
        return withCleanup({
          value: fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonIndex}`, { signal: abortSignal }).then((r) => r.json()),
          cleanup: () => abortController.abort(),
        });
      },
    }
  )
);
```

## features

- Better type definition: built for zustand v4
- On demand computing: only compute when needed, thanks to `proxy-compare`
- Cleanup function: useful for promise computed result

## Why not improve zustand-middleware-computed-state

zustand-middleware-computed-state API is designed in a different pattern, some features, (cleanup function / on demand computing) are not easy to support.
