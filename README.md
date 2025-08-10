# ChatGPT Clone – Frontend (Next.js)

Next.js 15 app for a ChatGPT-like UI. It manages conversations, streams assistant replies, and provides per-conversation settings (temperature, system prompt, optional web browsing).

## Features

- Conversation sidebar (create/rename/delete)
- Streaming chat with typing interruption
- Markdown rendering (GFM) for assistant messages
- Per-conversation settings modal: temperature, system prompt, web browsing options
- Works with the Spring Boot backend via `BACKEND_URL`

## Quick start

1) Configure backend endpoint

Set `NEXT_PUBLIC_BACKEND_URL` (defaults to `http://localhost:8080`):

```bash
export NEXT_PUBLIC_BACKEND_URL=http://localhost:8080
```

2) Install and run

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Project structure

- `app/(chat)/conversations/*`: routes and server actions for conversations
- `components/chat/*`: chat UI (messages, composer, header, list)
- `hooks/useChatStream.ts`: SSE streaming hook
- `lib/api.ts`: backend API helpers
- `types/*`: shared types

## Settings

Each conversation can store settings (saved via PATCH to backend):

```json
{
  "temperature": 0.7,
  "systemPrompt": "You are a helpful assistant.",
  "webAccessEnabled": false,
  "searchTopK": 3
}
```

## Notes

- Messages stream over SSE; if formatting looks off mid-stream it should resolve by the end. We use markdown rendering with `react-markdown` and GFM.
- The sidebar refreshes automatically on route changes and after actions.

## License

MIT
