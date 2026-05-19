# MedDoc AI — Frontend

Interface web do **MedDoc AI** desenvolvida pela **Notem** — plataforma de geracao de documentos medicos com inteligencia artificial para medicos brasileiros, em conformidade com a LGPD e as normas do CFM.

---

## Descricao

Frontend construido com Next.js 14 (App Router) + TypeScript + Tailwind CSS que permite ao medico:

- Cadastrar-se com consentimento LGPD explicito
- Gerar documentos medicos via IA preenchendo dados do paciente e anotacoes clinicas
- Revisar e editar o rascunho gerado pela IA
- Finalizar o documento (tornando-o somente leitura)
- Gerenciar todos os seus documentos em um painel centralizado

---

## Pre-requisitos

- **Node.js 18+**
- **npm** (incluso com Node.js) ou **yarn** / **pnpm**
- Backend MedDoc AI rodando (veja `notem-backend`)

---

## Instalacao

### 1. Clone o repositorio

```bash
git clone <url-do-repositorio>
cd notem-frontend
```

### 2. Instale as dependencias

```bash
npm install
```

---

## Configuracao do .env

Copie o arquivo de exemplo e edite:

```bash
cp .env.example .env.local
```

| Variavel | Descricao | Padrao |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | URL do backend | `http://localhost:8000` |

---

## Como executar em desenvolvimento

Certifique-se de que o backend esta rodando na porta 8000, entao:

```bash
npm run dev
```

Acesse em: `http://localhost:3000`

---

## Paginas

| Rota | Descricao |
|---|---|
| `/` | Login |
| `/cadastro` | Cadastro com consentimento LGPD |
| `/dashboard` | Painel — lista todos os documentos do usuario |
| `/gerar` | Formulario para gerar novo documento com IA |
| `/documento/[id]` | Visualizar, revisar e finalizar documento |

---

## Conformidade

### LGPD (Lei 13.709/2018)

- Checkbox de consentimento obrigatorio no cadastro com texto completo da politica de privacidade
- O cadastro nao e realizado sem aceite explicito da LGPD
- Token JWT armazenado localmente apenas durante a sessao do usuario

### CFM (Conselho Federal de Medicina)

- A interface deixa explicitamente claro que o documento gerado pela IA deve ser revisado e assinado pelo medico
- Fluxo de revisao obrigatorio: `gerado` -> `revisado` -> `finalizado`
- Documentos finalizados ficam em modo somente leitura, preservando a versao assinada pelo medico
- Aviso de conformidade exibido em todas as paginas de documento
