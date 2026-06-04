# workspace-ui

A React + TypeScript frontend application scaffolded with Vite.

## Tech Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Data Fetching**: Axios + TanStack React Query
- **Forms**: React Hook Form + Zod (schema validation)

---

## Getting Started

### Prerequisites

- Node.js >= 18
- npm >= 9

### Installation

```bash
# 1. Create the Vite project
npm create vite@latest workspace-ui -- --template react-ts

# 2. Move into the project directory
cd workspace-ui

# 3. Install base dependencies
npm install

# 4. Install project dependencies
npm install axios @tanstack/react-query react-hook-form @hookform/resolvers zod

# 5. Install Tailwind CSS
npm install @tailwindcss/vite tailwindcss

# 6. Initialize a git repository
git init
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:5173` by default.

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

---

## Project Structure

```
workspace-ui/
├── public/               # Static assets
├── src/
│   ├── assets/           # Images, fonts, etc.
│   ├── components/       # Reusable UI components
│   ├── hooks/            # Custom React hooks
│   ├── pages/            # Page-level components
│   ├── services/         # Axios API calls
│   ├── types/            # TypeScript type definitions
│   ├── App.tsx
│   └── main.tsx
├── index.html
├── tailwind.config.ts
├── vite.config.ts
├── tsconfig.json
└── package.json
```

---

## Configuration

### Tailwind CSS (`vite.config.ts`)

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

### TanStack React Query (`main.tsx`)

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
)
```

---

## Dependencies

| Package | Purpose |
|---|---|
| `axios` | HTTP client for API requests |
| `@tanstack/react-query` | Server state management and caching |
| `react-hook-form` | Performant form state management |
| `@hookform/resolvers` | Connects Zod schemas to React Hook Form |
| `zod` | TypeScript-first schema validation |
| `tailwindcss` | Utility-first CSS framework |
| `@tailwindcss/vite` | Tailwind CSS Vite plugin |

---

## Git

```bash
git init
git add .
git commit -m "initial commit"
```
