import create from "zustand";
import { computed } from "../src";

import { usePromiseResolved } from "./use-promise";

type Store = { input: string; pokemonIndex: number };
const useStore = create(
  computed(
    () => {
      return { input: "World", pokemonIndex: 1 } as Store;
    },
    {
      displayText: ({ pokemonIndex, input }) => {
        return `Hello ${input}, Pokemon Index is ${pokemonIndex}`;
      },
      pokemonDetail$: async ({ pokemonIndex }, {addCleanup}) => {
        const abortController = new AbortController();
        const abortSignal = abortController.signal;
        addCleanup(() => abortController.abort())
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonIndex}`, { signal: abortSignal })
        return await response.json()
      },
    }
  )
);

export default function App() {
  const { pokemonDetail$, pokemonIndex, input, displayText } = useStore();
  const pokemonDetail = usePromiseResolved(pokemonDetail$);

  const changePokemonIndex = (pokemonIndex: number) => {
    useStore.setState(() => ({ pokemonIndex }));
  };

  return (
    <div>
      <input value={input} onChange={(e) => useStore.setState({ input: e.target.value })}></input>
      {/* Use debounce will be a better choice, here use range to show the computed cleanup feature */}
      <input type="range" value={pokemonIndex} max={100} onChange={(e) => changePokemonIndex(e.target.valueAsNumber)} />
      <button onClick={() => changePokemonIndex(pokemonIndex + 1)}>+1</button>
      <div>{displayText}</div>
      {pokemonDetail && (
        <>
          <div>{pokemonDetail.name}</div>
          <img alt={pokemonDetail.name + " sprites"} src={pokemonDetail.sprites.front_default} />
        </>
      )}
    </div>
  );
}
