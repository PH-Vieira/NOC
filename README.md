# NOC — Monitoramento de Status

Dashboard que monitora o status de: **Vercel**, **Railway**, **Nuvem Fiscal**, **ViaCEP**, **Siscomex** (nomenclatura JSON), **GitHub** e **Supabase**.

## Estrutura

- **back/** — API Node.js + Express em TypeScript que agrega o status das fontes.
- **front/** — Aplicação Vue 3 + Vite + TypeScript que consome a API e exibe o dashboard.

## Como rodar

### Backend

Rode **sempre a partir da pasta `back`** (não use `node` direto nos arquivos `.ts`):

```bash
cd back
npm install
npm run dev
```

O backend sobe em `http://localhost:3000`. O script `npm run dev` usa `tsx` para executar o TypeScript; para produção use `npm run build` e depois `npm start`. A porta pode ser alterada pela variável de ambiente `PORT`:

```bash
PORT=4000 npm run dev
```

### Frontend

Em outro terminal:

```bash
cd front
npm install
npm run dev
```

O frontend sobe em `http://localhost:5173` e faz proxy de `/api` para o backend em `http://localhost:3000`. É necessário ter o backend rodando para o dashboard carregar os dados.

## API

- **GET /api/status** — Retorna o status agregado de todos os serviços (cache de 12 segundos). ViaCEP usa o CEP `01310100` como health check.

Resposta exemplo:

```json
{
  "updatedAt": "2026-02-02T13:30:00Z",
  "services": [
    {
      "id": "vercel",
      "name": "Vercel",
      "status": "operational",
      "description": "All Systems Operational"
    },
    ...
  ]
}
```

`status` pode ser: `operational`, `degraded`, `outage` ou `unknown`.

## Deploy: front na Vercel, back no Railway

- **Back (Railway)**  
  - Suba a pasta `back/` como app Node.js.  
  - Comando de start: `npm run build && npm start` (ou só `npm start` se o build for feito no deploy).  
  - Crie a variável **FRONT_ORIGIN** com a URL do front na Vercel (ex.: `https://seu-projeto.vercel.app`). Para vários domínios, use vírgula: `https://app.vercel.app,https://outro.vercel.app`.

- **Front (Vercel)**  
  - Suba a pasta `front/` (ou o monorepo com root em `front/`).  
  - Build: `npm run build`, output: `dist`.  
  - Crie a variável **VITE_API_URL** com a URL do back no Railway (ex.: `https://seu-back.railway.app`), **sem** barra no final.

Assim o front na Vercel faz polling em `VITE_API_URL/api/status` e o back no Railway aceita requisições do domínio definido em `FRONT_ORIGIN`.
