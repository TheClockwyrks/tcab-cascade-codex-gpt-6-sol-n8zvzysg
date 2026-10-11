# Cascade

Cascade is a browser Klondike solitaire game with a Draw Three stock and a card filled victory cascade. It runs entirely on the client and needs no account or network service to play.

## Run locally

```sh
npm ci
npm run dev
```

Open the address Vite prints. For a static release, run `npm run build` and serve the `dist/` directory from any static web server. `npm test`, `npm run typecheck`, `npm run lint`, and `npm run format` check the source.

## Play

Start a new game from the title menu. Drag face up cards or descending alternating color runs between tableau columns. Build foundations by suit from Ace to King. Only a King may fill an empty column. Click or tap the stock to turn three cards to the waste; when the stock is empty, click it again to recycle the waste. Only the front card of the visible waste set can be played. Double click a playable tableau or waste card to send it to a foundation when legal.

Use the bottom menu to deal again, return to the title, or toggle sound. Menus work with mouse or touch. Arrow Up and Arrow Down, or W and S, change the selected menu item; Enter or Space activates it. Escape returns from How to Play. Backquote toggles the read only debug overlay.
