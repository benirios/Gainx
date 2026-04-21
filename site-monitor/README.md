# Site Monitor

SaaS de monitoramento de sites com assinatura mensal.

**Stack:** React + Vite · Supabase (auth + database) · Tailwind CSS · Recharts

## Requisitos

- Node.js 18+
- Conta no [Supabase](https://supabase.com)

## Como rodar

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env
# Preencha VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY com os valores do seu projeto Supabase

# 3. Rodar em desenvolvimento
npm run dev
```

## Estrutura de pastas

```
src/
├── components/   # Componentes reutilizáveis
├── pages/        # Páginas da aplicação
├── lib/          # Clientes externos (Supabase)
└── utils/        # Funções utilitárias
```

## Variáveis de ambiente

| Variável | Descrição |
|---|---|
| `VITE_SUPABASE_URL` | URL do projeto Supabase |
| `VITE_SUPABASE_ANON_KEY` | Chave pública (anon) do Supabase |
