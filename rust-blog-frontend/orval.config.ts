import { defineConfig } from 'orval'

// 使い方:
//   1. Rust API を起動（cargo run）
//   2. pnpm generate を実行
//   → src/api/generated/ 以下に型付きクライアントが自動生成される
export default defineConfig({
  blog: {
    input: {
      target: 'http://localhost:3000/api-docs/openapi.json',
    },
    output: {
      mode: 'tags-split',
      target: 'src/api/generated',
      client: 'react-query',
      override: {
        mutator: {
          path: 'src/lib/axios.ts',
          name: 'customInstance',
        },
      },
    },
  },
})
