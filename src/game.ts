import type {
  Game,
  InitApi,
  RenderApi,
  UpdateApi,
} from "@clockwyrks/simple-2d";
import type { DeepReadonly } from "ts-essentials";
import * as K from "./constants";

export type Screen = "title" | "howto" | "playing" | "won";
export type Suit = "spades" | "hearts" | "diamonds" | "clubs";
export type PileKind = "stock" | "waste" | "foundation" | "tableau";
export interface CardState {
  readonly id: number;
  readonly suit: Suit;
  readonly rank: number;
  readonly faceUp: boolean;
}
export interface DragState {
  readonly cards: readonly CardState[];
  readonly fromPile: "waste" | "foundation" | "tableau";
  readonly fromIndex: number;
  readonly x: number;
  readonly y: number;
}
export interface DropTargetState {
  readonly pile: "foundation" | "tableau";
  readonly index: number;
}
export interface PointerState {
  readonly x: number;
  readonly y: number;
  readonly down: boolean;
}
export interface PressState {
  readonly x: number;
  readonly y: number;
  readonly at: number;
}
export interface FlyerState {
  readonly id: number;
  readonly suit: Suit;
  readonly rank: number;
  readonly x: number;
  readonly y: number;
  readonly vx: number;
  readonly vy: number;
}
export interface CascadeState {
  readonly screen: Screen;
  readonly menuIndex: number;
  readonly titleIndex: number;
  readonly stock: readonly CardState[];
  readonly waste: readonly CardState[];
  readonly wasteSets: readonly number[];
  readonly foundations: readonly (readonly CardState[])[];
  readonly tableau: readonly (readonly CardState[])[];
  readonly drag: DragState | null;
  readonly dropTarget: DropTargetState | null;
  readonly pointer: PointerState;
  readonly lastPress: PressState | null;
  readonly autoFlip: boolean;
  readonly winDetect: boolean;
  readonly launching: boolean;
  readonly trailPainting: boolean;
  readonly launchClock: number;
  readonly launched: number;
  readonly flyers: readonly FlyerState[];
  readonly cascadeDone: boolean;
  readonly trailStamps: number;
  readonly nextId: number;
  readonly simTime: number;
  readonly muted: boolean;
}
export const BACKGROUND = "#102d2b";
type ReadState = DeepReadonly<CascadeState>;
type Pile = readonly CardState[];
type Rect = { x: number; y: number; w: number; h: number };
type ReadCard = DeepReadonly<CardState>;
type SnapshotCard = CardState & { color: "red" | "black" };
export interface CascadeSnapshot {
  version: number;
  screen: Screen;
  menuIndex: number;
  titleIndex: number;
  dealMode: string;
  turnCount: number;
  dealModeLabel: string;
  muted: boolean;
  autoFlip: boolean;
  winDetect: boolean;
  launching: boolean;
  trailPainting: boolean;
  stock: SnapshotCard[];
  waste: SnapshotCard[];
  wasteSets: number[];
  wasteVisibleCount: number;
  foundations: SnapshotCard[][];
  tableau: SnapshotCard[][];
  drag: (Omit<DragState, "cards"> & { cards: SnapshotCard[] }) | null;
  dropTarget: DropTargetState | null;
  pointer: PointerState;
  lastPress: PressState | null;
  launchClock: number;
  launched: number;
  flyers: FlyerState[];
  cascadeDone: boolean;
  trailStamps: number;
  simTime: number;
}
export interface CascadeDebugApi {
  readonly version: number;
  reset(s: ReadState): CascadeState;
  snapshot(s: ReadState): CascadeSnapshot;
  reconcile(s: ReadState): CascadeState;
  menuItemRect(s: ReadState, index: number): Rect | null;
  setScreen(s: ReadState, screen: Screen): CascadeState;
  setMenuIndex(s: ReadState, index: number): CascadeState;
  setTitleIndex(s: ReadState, index: number): CascadeState;
  addCard(
    s: ReadState,
    pile: PileKind,
    index: number,
    suit: Suit,
    rank: number,
    faceUp: boolean,
  ): CascadeState;
  removeCard(s: ReadState, id: number): CascadeState;
  setCardFaceUp(s: ReadState, id: number, faceUp: boolean): CascadeState;
  clearPile(s: ReadState, pile: PileKind, index: number): CascadeState;
  clearTable(s: ReadState): CascadeState;
  addWasteSet(s: ReadState, count: number): CascadeState;
  clearWasteSets(s: ReadState): CascadeState;
  deal(s: ReadState): CascadeState;
  turnStock(s: ReadState): CascadeState;
  move(
    s: ReadState,
    fromPile: PileKind,
    fromIndex: number,
    fromRow: number,
    toPile: PileKind,
    toIndex: number,
  ): [CascadeState, boolean];
  autoMove(
    s: ReadState,
    pile: PileKind,
    index: number,
  ): [CascadeState, boolean];
  pointerDown(s: ReadState, x: number, y: number): CascadeState;
  pointerMove(s: ReadState, x: number, y: number): CascadeState;
  pointerUp(s: ReadState, x: number, y: number): CascadeState;
  setAutoFlip(s: ReadState, enabled: boolean): CascadeState;
  setWinDetect(s: ReadState, enabled: boolean): CascadeState;
  setLaunching(s: ReadState, enabled: boolean): CascadeState;
  setTrailPainting(s: ReadState, enabled: boolean): CascadeState;
  addFlyer(
    s: ReadState,
    suit: Suit,
    rank: number,
    x: number,
    y: number,
    vx: number,
    vy: number,
  ): CascadeState;
  setFlyerPosition(
    s: ReadState,
    id: number,
    x: number,
    y: number,
  ): CascadeState;
  setFlyerVelocity(
    s: ReadState,
    id: number,
    vx: number,
    vy: number,
  ): CascadeState;
  removeFlyer(s: ReadState, id: number): CascadeState;
  clearFlyers(s: ReadState): CascadeState;
  setLaunchClock(s: ReadState, seconds: number): CascadeState;
  clearTrail(s: ReadState): CascadeState;
  drawLaunchVx(): number;
}
const color = (suit: Suit): "red" | "black" =>
  suit === "hearts" || suit === "diamonds" ? "red" : "black";
const copyCard = (c: ReadCard): CardState => ({
  id: c.id,
  suit: c.suit,
  rank: c.rank,
  faceUp: c.faceUp,
});
const clone = (s: ReadState): CascadeState => ({
  ...s,
  stock: s.stock.map(copyCard),
  waste: s.waste.map(copyCard),
  wasteSets: [...s.wasteSets],
  foundations: s.foundations.map((p) => p.map(copyCard)),
  tableau: s.tableau.map((p) => p.map(copyCard)),
  drag: s.drag && { ...s.drag, cards: s.drag.cards.map(copyCard) },
  dropTarget: s.dropTarget && { ...s.dropTarget },
  pointer: { ...s.pointer },
  lastPress: s.lastPress && { ...s.lastPress },
  flyers: s.flyers.map((f) => ({ ...f })),
});
const base = (muted = false): CascadeState => ({
  screen: "title",
  menuIndex: 0,
  titleIndex: 0,
  stock: [],
  waste: [],
  wasteSets: [],
  foundations: Array.from({ length: K.FOUNDATION_COUNT }, () => []),
  tableau: Array.from({ length: K.TABLEAU_COLUMNS }, () => []),
  drag: null,
  dropTarget: null,
  pointer: { x: 0, y: 0, down: false },
  lastPress: null,
  autoFlip: true,
  winDetect: true,
  launching: true,
  trailPainting: true,
  launchClock: 0,
  launched: 0,
  flyers: [],
  cascadeDone: false,
  trailStamps: 0,
  nextId: 0,
  simTime: 0,
  muted,
});
function assertPile(p: PileKind, i: number): void {
  if (
    !Number.isInteger(i) ||
    (p === "stock" || p === "waste"
      ? i !== 0
      : p === "foundation"
        ? i < 0 || i >= K.FOUNDATION_COUNT
        : p === "tableau"
          ? i < 0 || i >= K.TABLEAU_COLUMNS
          : true)
  )
    throw new RangeError(`invalid pile ${p}:${i}`);
}
function pile(s: ReadState, p: PileKind, i: number): Pile {
  assertPile(p, i);
  return p === "stock"
    ? s.stock
    : p === "waste"
      ? s.waste
      : p === "foundation"
        ? s.foundations[i]
        : s.tableau[i];
}
function put(s: ReadState, p: PileKind, i: number, cards: Pile): CascadeState {
  assertPile(p, i);
  const c = cards.map(copyCard);
  if (p === "stock") return { ...clone(s), stock: c };
  if (p === "waste") return { ...clone(s), waste: c };
  if (p === "foundation")
    return {
      ...clone(s),
      foundations: s.foundations.map((old, j) =>
        j === i ? c : old.map(copyCard),
      ),
    };
  return {
    ...clone(s),
    tableau: s.tableau.map((old, j) => (j === i ? c : old.map(copyCard))),
  };
}
const inside = (x: number, y: number, r: Rect): boolean =>
  x >= r.x && y >= r.y && x < r.x + r.w && y < r.y + r.h;
function positions(cards: Pile): number[] {
  const down = cards.slice(0, -1).filter((c) => !c.faceUp).length;
  const up = cards.length - 1 - down;
  const available =
    K.COLUMN_BOTTOM_LIMIT - K.TABLEAU_Y - K.CARD_H - down * K.FACE_DOWN_OFFSET;
  const upOffset = up
    ? Math.max(K.FACE_UP_OFFSET_MIN, Math.min(K.FACE_UP_OFFSET, available / up))
    : K.FACE_UP_OFFSET;
  let y = K.TABLEAU_Y;
  return cards.map((c, i) => {
    const value = y;
    if (i < cards.length - 1) y += c.faceUp ? upOffset : K.FACE_DOWN_OFFSET;
    return value;
  });
}
function rect(s: ReadState, p: PileKind, i: number): Rect {
  assertPile(p, i);
  if (p === "stock")
    return { x: K.STOCK_X, y: K.TOP_ROW_Y, w: K.CARD_W, h: K.CARD_H };
  if (p === "waste")
    return { x: K.WASTE_X, y: K.TOP_ROW_Y, w: K.CARD_W, h: K.CARD_H };
  if (p === "foundation")
    return { x: K.FOUNDATION_X[i], y: K.TOP_ROW_Y, w: K.CARD_W, h: K.CARD_H };
  const cards = s.tableau[i];
  const ys = positions(cards);
  return {
    x: K.COLUMN_X[i],
    y: K.TABLEAU_Y,
    w: K.CARD_W,
    h: cards.length ? ys[ys.length - 1] + K.CARD_H - K.TABLEAU_Y : K.CARD_H,
  };
}
function targetAt(
  s: ReadState,
  x: number,
  y: number,
): { pile: PileKind; index: number } | null {
  for (const p of ["stock", "waste", "foundation", "tableau"] as const)
    for (let i = 0; i < (p === "foundation" ? 4 : p === "tableau" ? 7 : 1); i++)
      if (inside(x, y, rect(s, p, i))) return { pile: p, index: i };
  return null;
}
function validRun(cards: Pile): boolean {
  return cards.every(
    (c, i) =>
      c.faceUp &&
      (!i ||
        (cards[i - 1].rank === c.rank + 1 &&
          color(cards[i - 1].suit) !== color(c.suit))),
  );
}
function accepts(s: ReadState, cards: Pile, to: PileKind, i: number): boolean {
  const dest = pile(s, to, i);
  if (!cards.length || !validRun(cards)) return false;
  if (to === "foundation")
    return (
      cards.length === 1 &&
      (!dest.length
        ? cards[0].rank === K.RANK_MIN
        : dest[dest.length - 1].suit === cards[0].suit &&
          dest[dest.length - 1].rank + 1 === cards[0].rank)
    );
  if (to === "tableau")
    return !dest.length
      ? cards[0].rank === K.RANK_MAX
      : dest[dest.length - 1].faceUp &&
          dest[dest.length - 1].rank === cards[0].rank + 1 &&
          color(dest[dest.length - 1].suit) !== color(cards[0].suit);
  return false;
}
function win(s: ReadState): boolean {
  return (
    s.foundations.reduce((n, p) => n + p.length, 0) === K.DECK_SIZE &&
    s.foundations.every(
      (p) =>
        p.length === K.RANK_MAX &&
        p[0].rank === K.RANK_MIN &&
        p[K.RANK_MAX - 1].rank === K.RANK_MAX,
    )
  );
}
function afterMove(
  s: ReadState,
  from: PileKind,
  index: number,
  to: PileKind,
): CascadeState {
  let n = clone(s);
  if (from === "tableau" && n.autoFlip) {
    const col = n.tableau[index];
    if (col.length && !col[col.length - 1].faceUp)
      n = put(n, "tableau", index, [
        ...col.slice(0, -1),
        { ...col[col.length - 1], faceUp: true },
      ]);
  }
  if (to === "foundation" && n.winDetect && win(n))
    n = {
      ...n,
      screen: "won",
      launchClock: K.LAUNCH_INTERVAL,
      cascadeDone: false,
    };
  return n;
}
function decrementSet(sets: readonly number[]): number[] {
  const n = [...sets];
  if (n.length) {
    n[n.length - 1]--;
    if (n[n.length - 1] <= 0) n.pop();
  }
  return n;
}
function move(
  s: ReadState,
  from: PileKind,
  fi: number,
  row: number,
  to: PileKind,
  ti: number,
): [CascadeState, boolean] {
  const src = pile(s, from, fi),
    dst = pile(s, to, ti);
  if (!Number.isInteger(row) || row < 0 || row >= src.length)
    throw new RangeError("invalid fromRow");
  const cards = src.slice(row);
  const playable =
    from === "tableau"
      ? validRun(cards)
      : from === "waste"
        ? row === src.length - 1 && s.wasteSets.length > 0
        : from === "foundation"
          ? row === src.length - 1
          : false;
  if (!playable || (from === to && fi === ti) || !accepts(s, cards, to, ti))
    return [clone(s), false];
  let n = put(s, from, fi, src.slice(0, row));
  n = put(n, to, ti, [...dst, ...cards]);
  if (from === "waste") n = { ...n, wasteSets: decrementSet(n.wasteSets) };
  return [afterMove(n, from, fi, to), true];
}
function autoMove(
  s: ReadState,
  p: PileKind,
  i: number,
): [CascadeState, boolean] {
  const src = pile(s, p, i);
  if (
    (p !== "waste" && p !== "tableau") ||
    !src.length ||
    !src[src.length - 1].faceUp ||
    (p === "waste" && !s.wasteSets.length)
  )
    return [clone(s), false];
  for (let j = 0; j < K.FOUNDATION_COUNT; j++)
    if (accepts(s, [src[src.length - 1]], "foundation", j))
      return move(s, p, i, src.length - 1, "foundation", j);
  return [clone(s), false];
}
function deal(s: ReadState): CascadeState {
  const deck: CardState[] = [];
  let id = s.nextId;
  for (const suit of K.SUITS)
    for (let rank = K.RANK_MIN; rank <= K.RANK_MAX; rank++)
      deck.push({ id: id++, suit, rank, faceUp: false });
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  const tableau: CardState[][] = [];
  for (let i = 0; i < K.TABLEAU_COLUMNS; i++) {
    const col = deck.splice(0, i + 1);
    col[col.length - 1] = { ...col[col.length - 1], faceUp: true };
    tableau.push(col);
  }
  trail = [];
  return {
    ...clone(s),
    stock: deck,
    waste: [],
    wasteSets: [],
    foundations: Array.from({ length: K.FOUNDATION_COUNT }, () => []),
    tableau,
    drag: null,
    dropTarget: null,
    flyers: [],
    launchClock: 0,
    launched: 0,
    cascadeDone: false,
    trailStamps: 0,
    nextId: id,
  };
}
function turnStock(s: ReadState): CascadeState {
  if (s.stock.length) {
    const stock = [...s.stock],
      waste = [...s.waste];
    let count = 0;
    while (count < K.TURN_COUNT && stock.length) {
      waste.push({ ...stock.pop()!, faceUp: true });
      count++;
    }
    return { ...clone(s), stock, waste, wasteSets: [...s.wasteSets, count] };
  }
  if (!s.waste.length) return clone(s);
  return {
    ...clone(s),
    stock: [...s.waste].reverse().map((c) => ({ ...c, faceUp: false })),
    waste: [],
    wasteSets: [],
  };
}
function wasteTopPos(s: ReadState): number {
  return (
    K.WASTE_X +
    Math.max(0, (s.wasteSets[s.wasteSets.length - 1] ?? 0) - 1) * K.WASTE_FAN
  );
}
function hitCard(
  s: ReadState,
  x: number,
  y: number,
): {
  pile: "waste" | "foundation" | "tableau";
  index: number;
  row: number;
  card: ReadCard;
  cx: number;
  cy: number;
} | null {
  for (let i = K.TABLEAU_COLUMNS - 1; i >= 0; i--) {
    const col = s.tableau[i],
      ys = positions(col);
    for (let j = col.length - 1; j >= 0; j--)
      if (
        inside(x, y, { x: K.COLUMN_X[i], y: ys[j], w: K.CARD_W, h: K.CARD_H })
      )
        return {
          pile: "tableau",
          index: i,
          row: j,
          card: col[j],
          cx: K.COLUMN_X[i],
          cy: ys[j],
        };
  }
  for (let i = K.FOUNDATION_COUNT - 1; i >= 0; i--) {
    const col = s.foundations[i];
    if (col.length && inside(x, y, rect(s, "foundation", i)))
      return {
        pile: "foundation",
        index: i,
        row: col.length - 1,
        card: col[col.length - 1],
        cx: K.FOUNDATION_X[i],
        cy: K.TOP_ROW_Y,
      };
  }
  if (
    s.wasteSets.length &&
    s.waste.length &&
    inside(x, y, {
      x: wasteTopPos(s),
      y: K.TOP_ROW_Y,
      w: K.CARD_W,
      h: K.CARD_H,
    })
  )
    return {
      pile: "waste",
      index: 0,
      row: s.waste.length - 1,
      card: s.waste[s.waste.length - 1],
      cx: wasteTopPos(s),
      cy: K.TOP_ROW_Y,
    };
  return null;
}
function menuRect(s: ReadState, i: number): Rect | null {
  if (!Number.isInteger(i)) return null;
  if (s.screen === "title")
    return i < 0 || i >= K.TITLE_ITEMS.length
      ? null
      : { x: 490, y: 390 + i * 72, w: 300, h: 56 };
  if (s.screen === "howto")
    return i === 0 ? { x: 490, y: 592, w: 300, h: 54 } : null;
  if (s.screen === "playing")
    return i < 0 || i >= K.HUD_ITEMS.length
      ? null
      : { x: 240 + i * 154, y: K.HUD_Y, w: 138, h: K.HUD_H };
  return null;
}
function selectedAt(s: ReadState, x: number, y: number): number {
  const count =
    s.screen === "title"
      ? 2
      : s.screen === "playing"
        ? 3
        : s.screen === "howto"
          ? 1
          : 0;
  for (let i = 0; i < count; i++) if (inside(x, y, menuRect(s, i)!)) return i;
  return -1;
}
function activate(s: ReadState, i: number): CascadeState {
  if (s.screen === "title") {
    if (i === 0)
      return { ...deal(s), screen: "playing", titleIndex: 0, menuIndex: 0 };
    if (i === 1)
      return { ...clone(s), screen: "howto", titleIndex: 1, menuIndex: 0 };
  }
  if (s.screen === "howto")
    return { ...clone(s), screen: "title", menuIndex: s.titleIndex };
  if (s.screen === "playing") {
    if (i === 0) return { ...deal(s), screen: "playing", menuIndex: 0 };
    if (i === 1)
      return { ...clone(s), screen: "title", menuIndex: s.titleIndex };
    if (i === 2) return { ...clone(s), muted: !s.muted };
  }
  return clone(s);
}
function dropTarget(s: ReadState): DropTargetState | null {
  if (!s.drag) return null;
  const t = targetAt(s, s.drag.x + K.CARD_W / 2, s.drag.y + K.CARD_H / 2);
  return t &&
    (t.pile === "foundation" || t.pile === "tableau") &&
    accepts(s, s.drag.cards, t.pile, t.index) &&
    !(s.drag.fromPile === t.pile && s.drag.fromIndex === t.index)
    ? { pile: t.pile, index: t.index }
    : null;
}
function restore(s: ReadState): CascadeState {
  if (!s.drag) return clone(s);
  const d = s.drag;
  return {
    ...put(s, d.fromPile, d.fromIndex, [
      ...pile(s, d.fromPile, d.fromIndex),
      ...d.cards,
    ]),
    drag: null,
    dropTarget: null,
  };
}
function pointerDown(s: ReadState, x: number, y: number): CascadeState {
  let n: CascadeState = {
    ...clone(s),
    pointer: { x, y, down: true },
    lastPress: { x, y, at: s.simTime },
  };
  if (s.screen === "won")
    return { ...deal(n), screen: "playing", menuIndex: 0 };
  const menu = selectedAt(n, x, y);
  if (menu >= 0) n = { ...n, menuIndex: menu };
  if (s.screen !== "playing" || menu >= 0) return n;
  const hit = hitCard(s, x, y);
  const dbl =
    hit &&
    s.lastPress &&
    s.simTime - s.lastPress.at <= K.DOUBLE_CLICK_WINDOW &&
    Math.hypot(x - s.lastPress.x, y - s.lastPress.y) <= K.DOUBLE_CLICK_SLOP &&
    (hit.pile === "waste" ||
      (hit.pile === "tableau" &&
        hit.row === s.tableau[hit.index].length - 1)) &&
    hit.card.faceUp;
  if (dbl) {
    const [next] = autoMove(n, hit.pile, hit.index);
    return {
      ...next,
      pointer: { x, y, down: true },
      lastPress: { x, y, at: s.simTime },
    };
  }
  if (!hit || !hit.card.faceUp || (hit.pile === "waste" && !s.wasteSets.length))
    return n;
  const cards = pile(n, hit.pile, hit.index).slice(hit.row);
  n = put(
    n,
    hit.pile,
    hit.index,
    pile(n, hit.pile, hit.index).slice(0, hit.row),
  );
  return {
    ...n,
    drag: {
      cards,
      fromPile: hit.pile,
      fromIndex: hit.index,
      x: hit.cx,
      y: hit.cy,
    },
    dropTarget: null,
  };
}
function pointerMove(s: ReadState, x: number, y: number): CascadeState {
  let n: CascadeState = { ...clone(s), pointer: { ...s.pointer, x, y } };
  if (s.screen !== "won") {
    const m = selectedAt(n, x, y);
    if (m >= 0) n = { ...n, menuIndex: m };
  }
  if (s.drag && s.pointer.down && s.lastPress) {
    n = {
      ...n,
      drag: {
        ...s.drag,
        x: s.drag.x + x - s.pointer.x,
        y: s.drag.y + y - s.pointer.y,
      },
    };
    n = { ...n, dropTarget: dropTarget(n) };
  }
  return n;
}
function pointerUp(s: ReadState, x: number, y: number): CascadeState {
  let n = pointerMove(s, x, y);
  n = { ...n, pointer: { x, y, down: false } };
  const press = s.lastPress;
  if (!press) return n;
  const clicked = Math.hypot(x - press.x, y - press.y) <= K.DRAG_THRESHOLD;
  const a = selectedAt(s, press.x, press.y),
    b = selectedAt(s, x, y);
  if (s.screen === "playing" && s.drag) {
    if (clicked) n = restore(n);
    else {
      const t = dropTarget(n);
      if (t) {
        const d = n.drag!;
        n = put(n, t.pile, t.index, [...pile(n, t.pile, t.index), ...d.cards]);
        if (d.fromPile === "waste")
          n = { ...n, wasteSets: decrementSet(n.wasteSets) };
        n = {
          ...afterMove(n, d.fromPile, d.fromIndex, t.pile),
          drag: null,
          dropTarget: null,
        };
      } else n = restore(n);
    }
  }
  if (
    s.screen === "playing" &&
    clicked &&
    inside(press.x, press.y, rect(s, "stock", 0))
  )
    n = turnStock(n);
  if (a >= 0 && a === b) n = activate({ ...n, menuIndex: a }, a);
  return n;
}
let trail: FlyerState[] = [];
const vxDraw = (): number =>
  (K.LAUNCH_VX_MIN + Math.random() * (K.LAUNCH_VX_MAX - K.LAUNCH_VX_MIN)) *
  (Math.random() < 0.5 ? -1 : 1);
function step(s: ReadState, dt: number): CascadeState {
  let n: CascadeState = { ...clone(s), simTime: s.simTime + dt };
  if (s.screen !== "won") return n;
  const flyers: FlyerState[] = [];
  for (const f of s.flyers) {
    let vy = f.vy + K.GRAVITY * dt,
      y = f.y + vy * dt;
    const x = f.x + f.vx * dt;
    if (y >= K.FLOOR_Y && vy > 0) {
      y = K.FLOOR_Y;
      vy = -vy * K.BOUNCE_DAMP;
    }
    const next = { ...f, x, y, vy };
    if (s.trailPainting) trail.push(next);
    if (x + K.CARD_W >= 0 && x <= K.STAGE_W) flyers.push(next);
  }
  n = {
    ...n,
    flyers,
    trailStamps: s.trailStamps + (s.trailPainting ? s.flyers.length : 0),
  };
  if (s.launching) {
    let clock = s.launchClock + dt;
    const foundations = n.foundations.map((p) => [...p]);
    let launched = n.launched;
    const newFlyers = [...flyers];
    while (
      clock >= K.LAUNCH_INTERVAL &&
      launched < K.DECK_SIZE &&
      foundations.some((p) => p.length)
    ) {
      clock -= K.LAUNCH_INTERVAL;
      let index = launched % K.FOUNDATION_COUNT;
      for (let j = 0; j < K.FOUNDATION_COUNT && !foundations[index].length; j++)
        index = (index + 1) % K.FOUNDATION_COUNT;
      const c = foundations[index].pop()!;
      newFlyers.push({
        id: c.id,
        suit: c.suit,
        rank: c.rank,
        x: K.FOUNDATION_X[index],
        y: K.TOP_ROW_Y,
        vx: vxDraw(),
        vy: K.LAUNCH_VY,
      });
      launched++;
    }
    n = { ...n, foundations, flyers: newFlyers, launched, launchClock: clock };
  }
  if (n.launched === K.DECK_SIZE && !n.flyers.length)
    n = { ...n, cascadeDone: true };
  return n;
}
function findCard(
  s: ReadState,
  id: number,
): { p: PileKind; i: number; r: number } | null {
  for (const p of ["stock", "waste", "foundation", "tableau"] as const)
    for (
      let i = 0;
      i < (p === "foundation" ? 4 : p === "tableau" ? 7 : 1);
      i++
    ) {
      const r = pile(s, p, i).findIndex((c) => c.id === id);
      if (r >= 0) return { p, i, r };
    }
  return null;
}
function requiredCard(s: ReadState, id: number) {
  const found = findCard(s, id);
  if (!found) throw new RangeError(`unknown card ${id}`);
  return found;
}
function requiredFlyer(s: ReadState, id: number): number {
  const i = s.flyers.findIndex((f) => f.id === id);
  if (i < 0) throw new RangeError(`unknown flyer ${id}`);
  return i;
}
const cardSnapshot = (c: ReadCard): SnapshotCard => ({
  ...copyCard(c),
  color: color(c.suit),
});
export const debug: CascadeDebugApi = {
  version: K.CASCADE_DEBUG_VERSION,
  reset: (s) => {
    trail = [];
    return { ...base(s.muted), nextId: s.nextId };
  },
  snapshot: (s) => ({
    version: K.CASCADE_DEBUG_VERSION,
    screen: s.screen,
    menuIndex: s.menuIndex,
    titleIndex: s.titleIndex,
    dealMode: K.DEAL_MODE,
    turnCount: K.TURN_COUNT,
    dealModeLabel: K.DEAL_MODE_LABEL,
    muted: s.muted,
    autoFlip: s.autoFlip,
    winDetect: s.winDetect,
    launching: s.launching,
    trailPainting: s.trailPainting,
    stock: s.stock.map(cardSnapshot),
    waste: s.waste.map(cardSnapshot),
    wasteSets: [...s.wasteSets],
    wasteVisibleCount: s.wasteSets[s.wasteSets.length - 1] ?? 0,
    foundations: s.foundations.map((p) => p.map(cardSnapshot)),
    tableau: s.tableau.map((p) => p.map(cardSnapshot)),
    drag: s.drag && { ...s.drag, cards: s.drag.cards.map(cardSnapshot) },
    dropTarget: dropTarget(s),
    pointer: { ...s.pointer },
    lastPress: s.lastPress && { ...s.lastPress },
    launchClock: s.launchClock,
    launched: s.launched,
    flyers: s.flyers.map((f) => ({ ...f })),
    cascadeDone: s.cascadeDone,
    trailStamps: s.trailStamps,
    simTime: s.simTime,
  }),
  reconcile: (s) => ({ ...clone(s), dropTarget: dropTarget(s) }),
  menuItemRect: menuRect,
  setScreen: (s, screen) => ({ ...clone(s), screen }),
  setMenuIndex: (s, menuIndex) => ({ ...clone(s), menuIndex }),
  setTitleIndex: (s, titleIndex) => ({ ...clone(s), titleIndex }),
  addCard: (s, p, i, suit, rank, faceUp) => {
    if (
      !K.SUITS.includes(suit) ||
      !Number.isInteger(rank) ||
      rank < K.RANK_MIN ||
      rank > K.RANK_MAX
    )
      throw new RangeError("invalid card");
    return {
      ...put(s, p, i, [...pile(s, p, i), { id: s.nextId, suit, rank, faceUp }]),
      nextId: s.nextId + 1,
    };
  },
  removeCard: (s, id) => {
    const { p, i, r } = requiredCard(s, id);
    const n = put(
      s,
      p,
      i,
      pile(s, p, i).filter((_, j) => j !== r),
    );
    return p === "waste" ? { ...n, wasteSets: decrementSet(n.wasteSets) } : n;
  },
  setCardFaceUp: (s, id, faceUp) => {
    const { p, i, r } = requiredCard(s, id);
    return put(
      s,
      p,
      i,
      pile(s, p, i).map((c, j) => (j === r ? { ...c, faceUp } : c)),
    );
  },
  clearPile: (s, p, i) => {
    const n = put(s, p, i, []);
    return p === "waste" ? { ...n, wasteSets: [] } : n;
  },
  clearTable: (s) => ({
    ...clone(s),
    stock: [],
    waste: [],
    wasteSets: [],
    foundations: Array.from({ length: K.FOUNDATION_COUNT }, () => []),
    tableau: Array.from({ length: K.TABLEAU_COLUMNS }, () => []),
    drag: null,
    dropTarget: null,
  }),
  addWasteSet: (s, count) => {
    if (!Number.isInteger(count) || count < 0)
      throw new RangeError("invalid count");
    return { ...clone(s), wasteSets: [...s.wasteSets, count] };
  },
  clearWasteSets: (s) => ({ ...clone(s), wasteSets: [] }),
  deal,
  turnStock,
  move,
  autoMove,
  pointerDown,
  pointerMove,
  pointerUp,
  setAutoFlip: (s, autoFlip) => ({ ...clone(s), autoFlip }),
  setWinDetect: (s, winDetect) => ({ ...clone(s), winDetect }),
  setLaunching: (s, launching) => ({ ...clone(s), launching }),
  setTrailPainting: (s, trailPainting) => ({ ...clone(s), trailPainting }),
  addFlyer: (s, suit, rank, x, y, vx, vy) => ({
    ...clone(s),
    flyers: [
      ...s.flyers.map((f) => ({ ...f })),
      { id: s.nextId, suit, rank, x, y, vx, vy },
    ],
    nextId: s.nextId + 1,
  }),
  setFlyerPosition: (s, id, x, y) => {
    requiredFlyer(s, id);
    return {
      ...clone(s),
      flyers: s.flyers.map((f) => (f.id === id ? { ...f, x, y } : { ...f })),
    };
  },
  setFlyerVelocity: (s, id, vx, vy) => {
    requiredFlyer(s, id);
    return {
      ...clone(s),
      flyers: s.flyers.map((f) => (f.id === id ? { ...f, vx, vy } : { ...f })),
    };
  },
  removeFlyer: (s, id) => {
    requiredFlyer(s, id);
    return {
      ...clone(s),
      flyers: s.flyers.filter((f) => f.id !== id).map((f) => ({ ...f })),
    };
  },
  clearFlyers: (s) => ({ ...clone(s), flyers: [] }),
  setLaunchClock: (s, launchClock) => ({ ...clone(s), launchClock }),
  clearTrail: (s) => {
    trail = [];
    return { ...clone(s), trailStamps: 0 };
  },
  drawLaunchVx: vxDraw,
};
const suitSymbol: Record<Suit, string> = {
  spades: "♠",
  hearts: "♥",
  diamonds: "♦",
  clubs: "♣",
};
const rankSymbol = (n: number) =>
  n === 1 ? "A" : n === 11 ? "J" : n === 12 ? "Q" : n === 13 ? "K" : String(n);
function round(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}
function drawCard(
  ctx: CanvasRenderingContext2D,
  c: ReadCard,
  x: number,
  y: number,
  shadow = false,
): void {
  ctx.save();
  if (shadow) {
    ctx.shadowColor = "#0008";
    ctx.shadowBlur = 22;
    ctx.shadowOffsetY = 10;
  }
  round(ctx, x, y, K.CARD_W, K.CARD_H, 9);
  ctx.fillStyle = c.faceUp ? "#fffaf0" : "#123f4e";
  ctx.fill();
  ctx.shadowColor = "transparent";
  ctx.strokeStyle = c.faceUp ? "#c7bfae" : "#72b4ac";
  ctx.lineWidth = 2;
  ctx.stroke();
  if (c.faceUp) {
    const ink = color(c.suit) === "red" ? "#bb3b4a" : "#153d4b";
    ctx.fillStyle = ink;
    ctx.textAlign = "left";
    ctx.font = "bold 24px Georgia";
    ctx.fillText(rankSymbol(c.rank), x + 9, y + 29);
    ctx.font = "26px Georgia";
    ctx.fillText(suitSymbol[c.suit], x + 8, y + 57);
    ctx.textAlign = "center";
    ctx.font = "58px Georgia";
    ctx.fillText(suitSymbol[c.suit], x + K.CARD_W / 2, y + 96);
    ctx.textAlign = "right";
    ctx.font = "bold 18px Georgia";
    ctx.fillText(rankSymbol(c.rank), x + K.CARD_W - 9, y + K.CARD_H - 10);
  } else {
    ctx.strokeStyle = "#86c3b7";
    ctx.lineWidth = 1;
    round(ctx, x + 8, y + 8, K.CARD_W - 16, K.CARD_H - 16, 5);
    ctx.stroke();
    ctx.fillStyle = "#2e6972";
    for (let yy = y + 17; yy < y + K.CARD_H - 12; yy += 17)
      for (let xx = x + 17; xx < x + K.CARD_W - 12; xx += 17) {
        ctx.beginPath();
        ctx.moveTo(xx, yy - 5);
        ctx.lineTo(xx + 5, yy);
        ctx.lineTo(xx, yy + 5);
        ctx.lineTo(xx - 5, yy);
        ctx.fill();
      }
    ctx.fillStyle = "#e7c987";
    ctx.textAlign = "center";
    ctx.font = "bold 30px Georgia";
    ctx.fillText("C", x + K.CARD_W / 2, y + K.CARD_H / 2 + 11);
  }
  ctx.restore();
}
function slot(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  label: string,
  highlight = false,
): void {
  ctx.save();
  round(ctx, x, y, K.CARD_W, K.CARD_H, 9);
  ctx.fillStyle = highlight ? "#b8d1a84d" : "#061f2050";
  ctx.fill();
  ctx.strokeStyle = highlight ? "#f2d691" : "#9bb9a359";
  ctx.lineWidth = highlight ? 4 : 2;
  ctx.setLineDash(highlight ? [] : [7, 7]);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = highlight ? "#f9e0a3" : "#a1c1ae";
  ctx.textAlign = "center";
  ctx.font = "bold 14px Arial";
  ctx.fillText(label, x + K.CARD_W / 2, y + K.CARD_H / 2 + 5);
  ctx.restore();
}
function label(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  size: number,
  selected = false,
): void {
  ctx.textAlign = "center";
  ctx.font = `${selected ? "bold " : ""}${size}px Georgia`;
  ctx.fillStyle = selected ? "#ffe1a0" : "#eff1d9";
  ctx.fillText(text, x, y);
}
function drawMenu(
  ctx: CanvasRenderingContext2D,
  s: ReadState,
  items: readonly string[],
): void {
  items.forEach((item, i) => {
    const r = menuRect(s, i)!;
    round(ctx, r.x, r.y, r.w, r.h, 9);
    ctx.fillStyle = i === s.menuIndex ? "#d7b572" : "#ffffff16";
    ctx.fill();
    ctx.strokeStyle = "#f3e2b088";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.textAlign = "center";
    ctx.font = `${i === s.menuIndex ? "bold " : ""}22px Georgia`;
    ctx.fillStyle = i === s.menuIndex ? "#173b38" : "#eff1d9";
    ctx.fillText(item, r.x + r.w / 2, r.y + r.h / 2 + 8);
  });
}
function drawTable(ctx: CanvasRenderingContext2D, s: ReadState): void {
  slot(ctx, K.STOCK_X, K.TOP_ROW_Y, "STOCK");
  if (s.stock.length)
    drawCard(ctx, s.stock[s.stock.length - 1], K.STOCK_X, K.TOP_ROW_Y);
  slot(ctx, K.WASTE_X, K.TOP_ROW_Y, "WASTE");
  const count = Math.min(
    s.wasteSets[s.wasteSets.length - 1] ?? 0,
    K.TURN_COUNT,
    s.waste.length,
  );
  for (let j = 0; j < count; j++)
    drawCard(
      ctx,
      s.waste[s.waste.length - count + j],
      K.WASTE_X + j * K.WASTE_FAN,
      K.TOP_ROW_Y,
    );
  for (let i = 0; i < K.FOUNDATION_COUNT; i++) {
    const x = K.FOUNDATION_X[i],
      highlight =
        s.dropTarget?.pile === "foundation" && s.dropTarget.index === i;
    slot(ctx, x, K.TOP_ROW_Y, "A", highlight);
    const col = s.foundations[i];
    if (col.length) drawCard(ctx, col[col.length - 1], x, K.TOP_ROW_Y);
    if (highlight && col.length) slot(ctx, x, K.TOP_ROW_Y, "", true);
  }
  for (let i = 0; i < K.TABLEAU_COLUMNS; i++) {
    const x = K.COLUMN_X[i],
      col = s.tableau[i],
      ys = positions(col),
      highlight = s.dropTarget?.pile === "tableau" && s.dropTarget.index === i;
    slot(ctx, x, K.TABLEAU_Y, "K", highlight);
    col.forEach((c, j) => drawCard(ctx, c, x, ys[j]));
    if (highlight && col.length) slot(ctx, x, ys[ys.length - 1], "", true);
  }
  if (s.drag) {
    s.drag.cards.forEach((c, i) =>
      drawCard(ctx, c, s.drag!.x, s.drag!.y + i * K.FACE_UP_OFFSET, true),
    );
  }
}
function render(s: ReadState, api: RenderApi): void {
  const ctx = api.ctx;
  ctx.fillStyle = BACKGROUND;
  ctx.fillRect(0, 0, K.STAGE_W, K.STAGE_H);
  ctx.fillStyle = "#16463f";
  ctx.fillRect(202, 0, 876, K.STAGE_H);
  ctx.strokeStyle = "#d5b47344";
  ctx.strokeRect(201, 0, 878, K.STAGE_H);
  ctx.fillStyle = "#d6bd81";
  ctx.font = "bold 20px Georgia";
  ctx.textAlign = "left";
  ctx.fillText("CASCADE", 28, 42);
  if (s.screen === "playing") {
    drawTable(ctx, s);
    ctx.fillStyle = "#061e20";
    ctx.fillRect(0, K.HUD_Y, K.STAGE_W, K.HUD_H);
    drawMenu(ctx, s, K.HUD_ITEMS);
    label(ctx, K.DEAL_MODE_LABEL, 965, K.HUD_Y + 25, 16);
  } else if (s.screen === "won") {
    for (const f of trail) drawCard(ctx, { ...f, faceUp: true }, f.x, f.y);
    for (let i = 0; i < 4; i++) {
      const col = s.foundations[i];
      if (col.length)
        drawCard(ctx, col[col.length - 1], K.FOUNDATION_X[i], K.TOP_ROW_Y);
    }
    for (const f of s.flyers) drawCard(ctx, { ...f, faceUp: true }, f.x, f.y);
    if (s.cascadeDone) {
      ctx.fillStyle = "#061f20b8";
      ctx.fillRect(0, 230, K.STAGE_W, 190);
      label(ctx, K.WIN_TEXT, K.STAGE_W / 2, 335, 76, true);
      label(ctx, "TOUCH ANYWHERE TO PLAY AGAIN", K.STAGE_W / 2, 386, 18);
    }
  } else {
    ctx.fillStyle = "#082c2acb";
    ctx.fillRect(0, 0, K.STAGE_W, K.STAGE_H);
    if (s.screen === "title") {
      label(ctx, K.TITLE_TEXT, 640, 234, 88, true);
      label(ctx, K.TAGLINE_TEXT, 640, 284, 23);
      label(ctx, K.DEAL_MODE_LABEL, 640, 345, 18);
      drawMenu(ctx, s, K.TITLE_ITEMS);
    } else {
      label(ctx, "HOW TO PLAY", 640, 138, 52, true);
      const lines = [
        "Build each foundation from ACE to KING.",
        "On the table, build down in rank and alternate colors.",
        "Only a KING can fill an empty column.",
        "Turn the STOCK to reveal three cards at a time.",
        "When it runs out, turn it again to recycle.",
        "Drag cards to move them, or DOUBLE-CLICK to send one home.",
      ];
      lines.forEach((t, i) => label(ctx, t, 640, 219 + i * 51, 23));
      drawMenu(ctx, s, [K.HOWTO_BACK_LABEL]);
    }
  }
}
function init(api: InitApi<CascadeState>): [CascadeState, CascadeDebugApi] {
  for (const [name, keys] of Object.entries(K.MENU_BINDINGS))
    api.input.register(name, { keys: [...keys] });
  const sounds: [string, number, number, number][] = [
    [K.CUES.deal, 392, 523, 120],
    [K.CUES.turn, 480, 370, 75],
    [K.CUES.recycle, 260, 420, 140],
    [K.CUES.lift, 590, 690, 65],
    [K.CUES.drop, 360, 240, 80],
    [K.CUES.reject, 220, 160, 110],
    [K.CUES.flip, 680, 870, 90],
    [K.CUES.home, 720, 1050, 180],
    [K.CUES.launch, 340, 650, 120],
    [K.CUES.win, 520, 1040, 420],
  ];
  for (const [name, freq, freqTo, durationMs] of sounds)
    api.audio.define(name, { freq, freqTo, durationMs, gain: 0.11 });
  api.diagnostics.register("screen", (s) => s.screen);
  api.diagnostics.register("deal", () => K.DEAL_MODE);
  api.diagnostics.register("stock", (s) => s.stock.length);
  api.diagnostics.register("waste", (s) => s.waste.length);
  api.diagnostics.register("foundations", (s) =>
    s.foundations.map((p) => p.length).join("/"),
  );
  api.diagnostics.register("tableau", (s) =>
    s.tableau.map((p) => p.length).join("/"),
  );
  api.diagnostics.register("hand", (s) => (s.drag ? s.drag.cards.length : 0));
  api.diagnostics.register("launched", (s) => s.launched);
  api.diagnostics.register("flying", (s) => s.flyers.length);
  return [base(), debug];
}
function update(s: ReadState, api: UpdateApi, dt: number): CascadeState {
  let n = step(s, dt);
  const before = s;
  for (const sample of api.input.pointerSamples()) {
    if (
      !sample.primary ||
      (sample.device === "mouse" &&
        sample.button !== null &&
        sample.button !== "primary")
    )
      continue;
    n =
      sample.type === "down"
        ? pointerDown(n, sample.x, sample.y)
        : sample.type === "up"
          ? pointerUp(n, sample.x, sample.y)
          : pointerMove(n, sample.x, sample.y);
  }
  const up = api.input.pressed(K.MENU_UP),
    down = api.input.pressed(K.MENU_DOWN),
    confirm = api.input.pressed(K.MENU_CONFIRM),
    back = api.input.pressed(K.MENU_BACK);
  const count =
    n.screen === "title"
      ? 2
      : n.screen === "playing"
        ? 3
        : n.screen === "howto"
          ? 1
          : 0;
  if (count) {
    if (up) n = { ...n, menuIndex: (n.menuIndex + count - 1) % count };
    else if (down) n = { ...n, menuIndex: (n.menuIndex + 1) % count };
    else if (confirm) n = activate(n, n.menuIndex);
    else if (back && n.screen === "howto") n = activate(n, 0);
  }
  if (before.screen !== n.screen && n.screen === "won")
    api.audio.play(K.CUES.win);
  if (n.nextId > before.nextId && n.stock.length === K.DEAL_STOCK_CARDS)
    api.audio.play(K.CUES.deal);
  else if (
    before.stock.length > n.stock.length &&
    n.waste.length > before.waste.length
  )
    api.audio.play(K.CUES.turn);
  else if (
    before.stock.length === 0 &&
    before.waste.length > 0 &&
    n.stock.length > 0
  )
    api.audio.play(K.CUES.recycle);
  if (before.drag === null && n.drag !== null) api.audio.play(K.CUES.lift);
  if (before.drag !== null && n.drag === null) {
    const moved =
      n.foundations.some((p, i) => p.length > before.foundations[i].length) ||
      n.tableau.some((p, i) => p.length > before.tableau[i].length);
    api.audio.play(moved ? K.CUES.drop : K.CUES.reject);
  }
  if (n.foundations.some((p, i) => p.length > before.foundations[i].length))
    api.audio.play(K.CUES.home);
  if (n.launched > before.launched) api.audio.play(K.CUES.launch);
  if (
    before.tableau.some((p, i) =>
      p.some(
        (c, j) =>
          !c.faceUp && n.tableau[i][j]?.id === c.id && n.tableau[i][j]?.faceUp,
      ),
    )
  )
    api.audio.play(K.CUES.flip);
  if (n.muted !== api.audio.muted()) api.audio.setMuted(n.muted);
  return { ...n, muted: api.audio.muted() };
}
export const game: Game<CascadeState, CascadeDebugApi> = {
  initialize: init,
  update,
  render,
};
