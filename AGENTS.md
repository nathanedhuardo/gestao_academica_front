# AGENTS.md — Guia Arquitetural e Operacional do SGU (Frontend)

Este documento serve como referência técnica permanente para engenheiros de software e agentes de IA que atuam no desenvolvimento, manutenção e evolução do **SGU (Sistema de Gestão Universitária)** da UFAPE/LMTS.

---

## 1. Visão Geral e Arquitetura do Sistema

O **SGU Frontend** (`gestao_academica_front`) é uma Single Page Application / SSR híbrida construída com **Next.js 15 (App Router)** e **React 19**, projetada para centralizar a governança acadêmica e administrativa da instituição.

### Características Arquiteturais Chave:
- **Arquitetura Modular (Multi-Módulos):** O sistema divide seus grandes domínios de negócio em sub-aplicações independentes dentro de `src/app/`, compartilhando a mesma casca de autenticação, layout e design system.
- **Metadata-Driven UI (CRUDs Orientados a Metadados):** Grande parte dos módulos utiliza componentes genéricos orientados a schemas declarativos (`Tabela` e `Cadastro`), onde colunas, filtros, tipos de input, validações e ações são definidos em um objeto `estrutura`.
- **RBAC Dinâmico (Role-Based Access Control):** O usuário pode possuir múltiplos papéis simultâneos e alternar entre eles em runtime pelo cabeçalho. As rotas, menus laterais e visibilidade de campos individuais reagem a essas permissões.
- **Sessão com Cookie HttpOnly + Proactive Refresh:** As credenciais e tokens JWT residem no backend com cookies seguros (`withCredentials: true`), enquanto o front monitora o tempo de vida do token (`exp`) e executa refresh pró-ativo antes das requisições.

---

## 2. Stack Tecnológica e Dependências

| Categoria | Tecnologia / Biblioteca | Versão / Detalhes |
|---|---|---|
| **Core** | Next.js | `^15.2.4` (App Router, Turbopack no dev) |
| **Biblioteca UI** | React / React DOM | `^19.0.0` |
| **Linguagem** | TypeScript | `^5` |
| **Estilização** | Tailwind CSS | `^3.4.17` (Paleta com cores institucionais `extra-*`) |
| **Componentes Base** | Material-UI (MUI) & Emotion | `^6.4.8` (Ícones e componentes específicos) |
| **Ícones Auxiliares** | Lucide React / Heroicons | `@heroicons/react ^2.2.0`, `lucide-react ^0.575.0` |
| **Comunicação HTTP** | Axios / Fetch API | Axios `^1.6.7` (interceptores e instâncias centralizadas) |
| **Eventos / Realtime** | Fetch Event Source | `@microsoft/fetch-event-source ^2.0.1` |
| **Formulários & Schemas** | Zod / React Hook Form | `zod ^3.24.2`, `react-hook-form ^7.54.2`, `@hookform/resolvers ^4.1.3` |
| **Editor de Texto** | React Quill New | `react-quill-new ^3.6.0` |
| **Datas e Calendários** | React Datepicker / Multi Date | `react-datepicker ^8.1.0`, `react-multi-date-picker ^4.5.2` |
| **Gráficos** | Chart.js & React-Chartjs-2 | `chart.js ^4.5.1`, `react-chartjs-2 ^5.3.0` |
| **Feedback ao Usuário** | React-Toastify & SweetAlert2 | `react-toastify ^10.0.5`, `sweetalert2 ^11.10.7` |

---

## 3. Organização dos Diretórios e Responsabilidades

```
gestao_academica_front/
├── public/                 # Assets estáticos (logos da UFAPE, SGU, brasões, ícones)
├── src/
│   ├── app/                # Next.js App Router (Páginas, layouts e rotas de API)
│   │   ├── api/            # API Routes locais (ex: /api/cep/[cep] proxy ViaCEP)
│   │   ├── authentication/ # Serviços de auth, tokens, PKCE e hooks
│   │   ├── conta/          # Perfil, login, cadastro público e recuperação de senha
│   │   ├── gestao-acesso/  # Módulo de Governança de Usuários e Permissões
│   │   ├── gestao-edital/  # Módulo de Modelagem e Ciclo de Vida de Editais
│   │   ├── gestao-extra-sisu/ # Processos seletivos complementares / Extra SISU
│   │   ├── home/           # Hub central de módulos e favoritos
│   │   ├── login/          # Tela de login e seleção de contas salvas
│   │   ├── notificacoes/   # Central de notificações com paginação
│   │   ├── pdi/            # Módulo de Plano de Desenvolvimento Institucional
│   │   ├── prae/           # Módulo da Pró-Reitoria de Assuntos Estudantis
│   │   ├── relatorio-financeiro/ # Dashboard financeiro público com gráficos
│   │   ├── layout.tsx      # RootLayout (AuthProvider, ThemeProvider, ToastContainer)
│   │   └── globals.css     # Estilos globais e diretivas do Tailwind
│   ├── components/         # Componentes compartilhados da aplicação
│   │   ├── AuthProvider/   # Provedores de sessão, HOC withAuthorization, ClientWrapper
│   │   ├── Cadastro/       # Motor de formulários orientados a metadados e inputs atômicos
│   │   ├── Calendar/       # Componente de calendário de agendamentos
│   │   ├── CalendarioCronograma/ # Calendário de cronogramas do PRAE
│   │   ├── DatePicker/     # Campos customizados de seleção de datas
│   │   ├── EditalModelo/   # Construtores de etapas e campos dinâmicos (Zod)
│   │   ├── EnderecoAutoComplete/ # Componente e hook de busca de endereço por CEP
│   │   ├── Layout/         # Casca visual: Interno (Sidebar + Header) e Externo
│   │   ├── Modal/          # Modais reutilizáveis e histórico de status
│   │   └── Tabela/         # Motor de listagens com ordenação, filtros e paginação Spring
│   ├── context/            # Contextos React globais (roleContext)
│   ├── theme/              # Definições de cores e tipografia Material-UI integradas
│   ├── types/              # DTOs, interfaces TypeScript e schemas Zod do domínio
│   └── utils/              # Helpers puros (api.tsx, mascaras.tsx, brasilianStates.tsx)
├── types/                  # Declarações globais de tipagem externas (.d.ts)
├── .env                    # Variáveis de ambiente locais
├── tailwind.config.ts      # Configuração de temas, cores (extra, primary) e fontes
└── tsconfig.json           # Configurações TypeScript e path alias (@/* -> ./src/*)
```

---

## 4. Módulos e Principais Funcionalidades

### 4.1. Autenticação e Sessão (`/login`, `/conta/*`, `src/app/authentication`)
- **Login / Logout:** Autenticação via `POST /login` em formato urlencoded com cookies seguros.
- **Gestão de Sessão & Refresh:** Token expira no backend; front agenda renovação automática (`auth.token.tsx`) ou dispara refresh pró-ativo ao interceptar chamadas (`ensureAuthenticated()`).
- **Criar Conta & Recuperar Senha:** Fluxo público de auto-cadastro com aceite de termos de uso e envio de link de ativação por e-mail.
- **Meu Perfil (`/conta/perfil`):** Visualização e edição de dados cadastrais (nome, telefone, foto) e dados acadêmicos vinculados à role (matrícula, cursos, SIAPE).

### 4.2. Home / Hub (`/home`)
- Ponto de entrada após autenticação.
- Apresenta os cards dos módulos com link direto, filtro por texto e sistema de "Favoritar Módulos" persistido no `localStorage`.

### 4.3. Gestão de Acesso (`/gestao-acesso`)
- **Unidades Administrativas & Tipos:** Cadastro institucional das unidades e departamentos da universidade.
- **Gestão de Usuários & Alocação:** Listagem, ativação/desativação e alocação de gestores para unidades administrativas específicas.
- **Cursos & Etnias:** Manutenção de cadastros base utilizados por todo o sistema.
- **Solicitações de Acesso:** Usuários solicitam elevação de perfil (Aluno, Professor, Técnico, Gestor); Administradores aprovam ou rejeitam.

### 4.4. PRAE — Pró-Reitoria de Assuntos Estudantis (`/prae`)
- **Estudantes:** Gestão do cadastro socioeconômico de estudantes, com upload e conferência de documentos comprobatórios.
- **Benefícios:** Gestão de bolsas e auxílios (Alimentação, Moradia, Transporte, etc.), beneficiários ativos e cancelamentos.
- **Pagamentos & Folha:** Criação e fechamento de folhas de pagamento mensais, acompanhamento de beneficiários pagos e extrato individual ("Meus Recebimentos").
- **Agendamentos de Atendimentos:** Configuração de cronogramas de atendimento (médico, psicológico, pedagógico), marcação por alunos, controle de faltas e cancelamentos.

### 4.5. Gestão de Editais (`/gestao-edital`)
- **Modelagem de Editais:** Definição de Tipos de Edital com formulários dinâmicos (campos customizados como texto, data, anexo de arquivo, selects).
- **Etapas e Prazos:** Ciclo de vida com etapas sequenciais configuráveis via schemas validados com **Zod**.

### 4.6. Gestão Extra SISU (`/gestao-extra-sisu`)
- Módulo dedicado a seleções especiais (Transferências, Reintegrações, Portadores de Diploma).
- Páginas públicas de landing page para candidatos, inscrição em editais, solicitações de isenção de taxa e acompanhamento do status.

### 4.7. PDI — Plano de Desenvolvimento Institucional (`/pdi`)
- Monitoramento de metas e indicadores estratégicos da instituição.

### 4.8. Relatório Financeiro Público (`/relatorio-financeiro`)
- Painel de transparência de acesso público (sem necessidade de login).
- Gráficos em tempo real com **Chart.js** (recurso por benefício, percentual de atendimento por curso, valores totais).

### 4.9. Notificações (`/notificacoes`)
- Popover no cabeçalho com contador de mensagens não lidas e página completa com paginação infinita / carregar mais, com marcação de leitura individual e em lote.

---

## 5. Fluxo de Comunicação e Integrações

### 5.1. Backend do SGU (API REST)
- **Base URL:** Definida via `NEXT_PUBLIC_BASE_URL` (padrão local `http://localhost:8082`, produção `https://lmtsteste23.ufape.edu.br`).
- **Autenticação nas requisições:** `withCredentials: true` para tráfego seguro de cookies de sessão.
- **Cliente HTTP Centralizado (`src/utils/api.tsx`):**
  - Função `generica({ metodo, uri, params, data, contentType, responseType })`: wrapper padronizado que antes de cada disparo executa `ensureAuthenticated()`.
  - Tratamento de status HTTP:
    - `401`: Sessão expirada → limpa refresh schedule e redireciona para `/login`.
    - `404`, `500`: Emite toast de notificação amigável.
    - Erro de rede (`ERR_NETWORK`): Alerta falha com o servidor.
  - Formato de Paginação Spring Boot padrão:
    ```ts
    {
      content: T[],
      totalElements: number,
      totalPages: number,
      number: number, // página atual (0-based)
      size: number,
      last: boolean
    }
    ```

### 5.2. Serviços Externos
1. **ViaCEP (`https://viacep.com.br`):**
   - Rota interna de proxy: `GET /api/cep/[cep]`.
   - Hook client-side: `useEnderecoByCep(cep)` em `src/utils/brasilianStates.tsx`.
2. **BrasilAPI (`https://brasilapi.com.br`):**
   - Estados: `/api/ibge/uf/v1`.
   - Municípios: `/api/ibge/municipios/v1/${uf}`.
   - Consulta de CNPJ: `/api/cnpj/v1/${cnpj}` via hook `useEmpresaByCnpj`.

---

## 6. Padrões de Código e Convenções Estabelecidas

### 6.1. O Padrão "Estrutura" (Metadata-Driven UI)

Sempre que uma tela realizar CRUD ou listagens padronizadas, utilize o padrão declarativo adotado no projeto:

#### Exemplo de Declaração de Listagem (`Tabela`):
```tsx
const estrutura = {
  uri: "curso",
  cabecalho: {
    titulo: "Cursos",
    migalha: [
      { nome: 'Início', link: '/home' },
      { nome: 'Gestão Acesso', link: '/gestao-acesso' },
      { nome: 'Cursos', link: '/gestao-acesso/cursos' },
    ]
  },
  tabela: {
    configuracoes: { pesquisar: true, cabecalho: true, rodape: true },
    botoes: [{ nome: 'Adicionar', chave: 'adicionar', bloqueado: false }],
    colunas: [
      { nome: "Nome do Curso", chave: "nome", tipo: "texto", pesquisar: true },
      { nome: "Ações", chave: "acoes", tipo: "button" }
    ],
    acoes_dropdown: [
      { nome: 'Editar', chave: 'editar' },
      { nome: 'Deletar', chave: 'deletar' }
    ]
  }
};
```

#### Exemplo de Declaração de Formulário (`Cadastro`):
```tsx
const estrutura = {
  uri: "curso",
  cabecalho: { titulo: "Cadastrar Curso", migalha: [...] },
  cadastro: {
    campos: [
      {
        line: 1,
        colSpan: "md:col-span-1",
        nome: "Nome",
        chave: "nome",
        tipo: "text",
        obrigatorio: true,
        validacao: (valor: string) => (!valor ? "Campo obrigatório" : null),
        exibirPara: ["ADMINISTRADOR", "GESTOR"] // Filtro por perfil
      }
    ],
    acoes: [
      { nome: "Cancelar", chave: "voltar", tipo: "botao" },
      { nome: "Salvar", chave: "salvar", tipo: "submit" }
    ]
  }
};
```

### 6.2. Proteção de Telas e Autorização
- Toda página restrita é envolvida com o HOC `withAuthorization`:
  ```tsx
  export default withAuthorization(MinhaPagina);
  ```
- Para layouts de módulos com sidebar contextual, crie `layout.tsx` no diretório da rota encapsulando com `<ClientWrapper layoutConfig={meuLayoutConfig}>{children}</ClientWrapper>`.

### 6.3. Cores e Estilos Customizados
- Cores de destaque (Vinho institucional UFAPE e Neutros):
  - `bg-extra-50` (`#972E3F`) — Botões primários, títulos principais e bordas ativas.
  - `bg-extra-100` (`#393C47`) — Elementos secundários e botões neutros.
  - `bg-extra-150` (`#AB3447`) — Hover de botões de destaque.
- SweetAlert2 estilizado: sempre utilizar `customClass: { popup: "my-swal-popup", title: "my-swal-title", htmlContainer: "my-swal-html" }`.
- Máscaras: utilize `aplicarMascara(valor, tipo)` onde tipo pode ser `cpf`, `cnpj`, `cep`, `celular`, `telefone`, `valor`, `dataisobr`, `hora`.

---

## 7. Configurações e Comandos de Execução

### Variáveis de Ambiente (`.env`)
```env
NEXT_PUBLIC_BASE_URL=http://localhost:8080
```
> Em ambiente de teste/homologação: `https://lmtsteste23.ufape.edu.br`.

### Comandos de Terminal
```bash
# Executar servidor de desenvolvimento com Turbopack (padrão do projeto)
npm run dev

# Compilar para produção
npm run build

# Iniciar servidor compilado
npm run start

# Executar validação de linter
npm run lint
```

---

## 8. Diretrizes e Cuidados para Novas Implementações

Ao adicionar novas funcionalidades ou corrigir bugs, siga rigorosamente estas regras:

1. **Preserve a Arquitetura Metadata-Driven:** Não crie tabelas ou formulários estáticos com tags HTML avulsas quando for implementar um CRUD. Use os componentes `Cadastro` e `Tabela` existentes para garantir consistência visual e manutenibilidade.
2. **Respeite o Controle de Acesso por Role (RBAC):** Ao criar novos campos sensíveis em formulários, utilize a propriedade `exibirPara: ["ROLE"]`. Nos menus laterais (`layoutConfig.sidebar.menuItems`), informe a lista `roles: [...]`.
3. **Comunicação Segura:** Sempre utilize a função `generica()` ou `api()` de `@/utils/api`. Nunca utilize `fetch()` puro sem as credenciais e headers configurados no cliente base.
4. **Tratamento de Erros da API:** O backend Spring pode retornar mensagens em `response.data.errors` (objeto de validação por campo), `response.data.error.message` ou `response.data.message`. Sempre verifique essas estruturas antes de notificar o usuário com `toast.error()`.
5. **Responsividade Mobile-First:** O layout possui comportamento responsivo estruturado (Sidebar retrátil, tabelas empilhadas em cards no mobile e grids de formulário adaptáveis). Teste novas interfaces em resoluções mobile e desktop.
6. **Integridade de Tipos:** Em novos serviços e entidades (como no padrão estabelecido em `gestao-extra-sisu`), prefira criar arquivos de tipagem (`.types.ts`) e serviços dedicados encapsulando as chamadas à API.
