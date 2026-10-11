import { describe, expect, it } from "vitest";
import { game, debug } from "./game";
import type { InitApi } from "@clockwyrks/simple-2d";
import type { CascadeState } from "./game";

function setup() {
  const registered: string[] = [];
  const cues: string[] = [];
  const api = {
    input: { register: (name: string) => registered.push(name) },
    audio: { define: (name: string) => cues.push(name) },
    diagnostics: { register: () => undefined },
  } as unknown as InitApi<CascadeState>;
  const [state] = game.initialize(api) as [CascadeState, typeof debug];
  return { state, debug, registered, cues };
}

describe("Cascade rules", () => {
  it("deals a complete deck and turns three cards per stock click", () => {
    const { state, debug, registered, cues } = setup();
    expect(registered).toHaveLength(4);
    expect(cues).toHaveLength(10);
    let s = debug.deal(state);
    expect(s.tableau.map((p) => p.length)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(s.stock).toHaveLength(24);
    expect(
      new Set(
        [...s.stock, ...s.tableau.flat()].map((c) => `${c.suit}:${c.rank}`),
      ).size,
    ).toBe(52);
    s = debug.turnStock(s);
    expect(s.stock).toHaveLength(21);
    expect(s.wasteSets).toEqual([3]);
    expect(s.waste.every((c) => c.faceUp)).toBe(true);
    for (let i = 0; i < 7; i++) s = debug.turnStock(s);
    expect(s.stock).toHaveLength(0);
    s = debug.turnStock(s);
    expect(s.stock).toHaveLength(24);
    expect(s.wasteSets).toEqual([]);
  });
  it("moves a valid alternating run and flips the exposed card", () => {
    const { state, debug } = setup();
    let s = debug.addCard(state, "tableau", 0, "spades", 7, false);
    s = debug.addCard(s, "tableau", 0, "hearts", 6, true);
    s = debug.addCard(s, "tableau", 1, "clubs", 7, true);
    const [next, ok] = debug.move(s, "tableau", 0, 1, "tableau", 1);
    expect(ok).toBe(true);
    expect(next.tableau[0][0].faceUp).toBe(true);
    expect(next.tableau[1].map((c) => c.rank)).toEqual([7, 6]);
    const [refused, notOk] = debug.move(next, "tableau", 0, 0, "foundation", 0);
    expect(notOk).toBe(false);
    expect(refused.tableau[0]).toEqual(next.tableau[0]);
  });
  it("plays only the waste top and keeps set memory", () => {
    const { state, debug } = setup();
    let s = debug.addCard(state, "waste", 0, "spades", 1, true);
    s = debug.addCard(s, "waste", 0, "hearts", 1, true);
    s = debug.addWasteSet(s, 2);
    let result = debug.move(s, "waste", 0, 0, "foundation", 0);
    expect(result[1]).toBe(false);
    result = debug.move(s, "waste", 0, 1, "foundation", 0);
    expect(result[1]).toBe(true);
    expect(result[0].wasteSets).toEqual([1]);
    expect(result[0].foundations[0][0].suit).toBe("hearts");
  });
  it("processes a pointer press and release as a stock turn", () => {
    const { state, debug } = setup();
    let s: CascadeState = { ...debug.deal(state), screen: "playing" };
    s = debug.pointerDown(s, 250, 70);
    s = debug.pointerUp(s, 250, 70);
    expect(s.stock).toHaveLength(21);
    expect(s.wasteSets).toEqual([3]);
  });
});
