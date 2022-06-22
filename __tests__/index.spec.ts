import { describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import create from "zustand";
import { devtools } from "zustand/middleware";
import { computed } from "../src";

describe("test zustand-computed-middleware", () => {
  it("should return initial computed", () => {
    const useCounter = create(computed(() => ({ count: 1 }), { doubled: (state) => state.count * 2 }));
    const { result } = renderHook(() => useCounter());
    expect(result.current.doubled).toBe(2);
  });

  it("should computed updated", () => {
    type State = { count: number; add: () => void };
    const useCounter = create(
      computed<State, { doubled: (s: State) => number }>(
        (set) => ({
          count: 1,
          add: () => set((state) => ({ count: state.count + 1 })),
        }),
        {
          doubled: (state) => state.count * 2,
        }
      )
    );
    const { result } = renderHook(() => useCounter());
    act(() => result.current.add());
    expect(result.current.doubled).toBe(4);
  });

  it("should curried version works", () => {
    const useCounter = create(
      computed<{ count: number; add: () => void }>((set) => ({
        count: 1,
        add: () => set((state) => ({ count: state.count + 1 })),
      }))({
        doubled: (state) => state.count * 2,
      })
    );
    const { result } = renderHook(() => useCounter());
    act(() => result.current.add());
    expect(result.current.doubled).toBe(4);
  });

  it("should computed updated with setStateAPI", () => {
    const useCounter = create(
      computed(() => ({ count: 1 }), {
        doubled: (state) => state.count * 2,
      })
    );
    const { result } = renderHook(() => useCounter());
    act(() => useCounter.setState({ count: 2 }));
    expect(result.current.doubled).toBe(4);
  });

  it("should setState replace works", () => {
    const useCounter = create(
      computed(() => ({ count: 1, input: "" }), {
        doubled: (state) => state.count * 2,
      })
    );
    const { result } = renderHook(() => useCounter());
    // not a good practice, just to test the zustand function still works
    act(() => useCounter.setState({ count: 2 }, true));
    expect(result.current.input).toBe(undefined);
  });

  it("should middleware composable", () => {
    const useCounter = create(
      devtools(
        computed(() => ({ count: 1 }), {
          doubled: (state) => state.count * 2,
        })
      )
    );
    const { result } = renderHook(() => useCounter());
    act(() => useCounter.setState({ count: 2 }));
    expect(result.current.doubled).toBe(4);
  });

  it("should on-demand computing works", () => {
    const doubledSpy = vi.fn();
    const upperSpy = vi.fn();
    const infoSpy = vi.fn();
    const useCounter = create(
      computed(() => ({ count: 1, input: "" }), {
        doubled: (state) => (doubledSpy(), state.count * 2),
        upper: (state) => (upperSpy(), state.input.toUpperCase()),
        info: (state) => (infoSpy(), `${state.count} ${state.input}`),
      })
    );
    renderHook(() => useCounter());
    act(() => useCounter.setState({ count: 2 }));
    expect(doubledSpy).toBeCalledTimes(2);
    expect(infoSpy).toBeCalledTimes(2);
    expect(upperSpy).toBeCalledTimes(1);
    act(() => useCounter.setState({ input: "123" }));
    expect(doubledSpy).toBeCalledTimes(2);
    expect(infoSpy).toBeCalledTimes(3);
    expect(upperSpy).toBeCalledTimes(2);
  });

  it("should withCleanup works", () => {
    const cleanupSpy = vi.fn();
    const useCounter = create(
      computed(() => ({ count: 1 }), {
        doubled: (state, { addCleanup }) => {
          addCleanup(cleanupSpy);
          return state.count * 2;
        },
      })
    );
    renderHook(() => useCounter());
    expect(cleanupSpy).toBeCalledTimes(0);
    act(() => useCounter.setState({ count: 2 }));
    expect(cleanupSpy).toBeCalledTimes(1);
  });
});
