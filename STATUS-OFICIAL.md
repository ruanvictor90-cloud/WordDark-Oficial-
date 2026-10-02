# WordDark Oficial — LINHA ATIVA

Este é o repositório oficial e único de desenvolvimento do mundo WordDark.

- Repositório oficial: `ruanvictor90-cloud/WordDark-Oficial-`
- Branch oficial: `main`
- Legado: preservado separadamente e desativado para desenvolvimento.
- Financeiro: permanece separado até ser incorporado ao mundo oficial.

## Regra estrutural oficial — infraestrutura antes da conta

O WordDark não cria País, Estado, Cidade ou Bairro apenas porque uma interface existe. Essas camadas surgem conforme contas, grupos, operações, ambientes e setores realmente conectados exigirem.

A infraestrutura atual é de gestores, portões, rodovias, setores e operações. Contas e operações reais ocupam essa infraestrutura depois da conexão.

### Regra de nascimento

1. Nenhuma conta conectada → somente infraestrutura de conexão.
2. Uma conta conectada → estrutura mínima; não criar País artificialmente.
3. Múltiplas contas ou grupo explicitamente criado → País representa o grupo.
4. Estado representa uma operação.
5. Cidade representa ambiente/perfil/rede sob gestão.
6. Bairro representa setor executor.

Exemplo de uma única conta: CONTA → ESTADO/conta conectada → CIDADE/Instagram.

Exemplo após Instagram + YouTube: PAÍS/Ruan → ESTADO/Gestão das Contas → CIDADE/Gestão das Operações → setores correspondentes.

Suco, SucoCast e derivados não são instanciados automaticamente. Só aparecem quando uma conta/grupo conectado criar ou receber essa operação.

## Regra estrutural anterior (referência consolidada)

A estrutura territorial também funciona como classificador de pertencimento. Antes de criar uma nova estrutura, o WordDark deve verificar se a solução já cabe em uma estrutura existente.

### Terra

```
PAÍS   → Grupo / Organização
ESTADO → Operação / Marca
CIDADE → Rede social / Perfil / Ambiente operacional
BAIRRO → Setor executor
```

Exemplo atual:

```
PAÍS: SUCO
└── ESTADO: SUCOCAST
    └── CIDADE: YOUTUBE
        ├── BAIRRO: ROTEIRO
        ├── BAIRRO: IMAGEM
        ├── BAIRRO: ÁUDIO
        ├── BAIRRO: VÍDEO
        └── BAIRRO: PUBLICAÇÃO
```

### Céu

O Céu mantém a mesma lógica estrutural, adaptada à sua natureza global:

```
DOMÍNIO → Grupo / domínio global
REGIÃO  → Operação global
NÚCLEO  → Ambiente / unidade global
DISTRITO → Setor global
```

Assim, Céu e Terra seguem a mesma lógica de organização sem obrigar os dois a terem a mesma implementação.

## Regra de criação

```
Nova solução
↓
Já existe grupo?
├─ não → criar PAÍS
└─ sim
   ↓
Existe operação adequada?
├─ não → criar ESTADO
└─ sim
   ↓
Existe ambiente/perfil adequado?
├─ não → criar CIDADE
└─ sim
   ↓
Existe setor adequado?
├─ não → criar BAIRRO
└─ sim → encaixar a solução no setor existente
```

A criação pode, portanto, terminar no menor nível necessário. Não se cria um novo prédio quando basta adicionar um setor ou uma solução a um prédio existente.

## Estruturas já consolidadas

O núcleo oficial já contempla, entre outras bases:

- Main geral do mundo;
- WordDark central;
- Céu e Terra;
- Portões;
- Rodovia e registro de capacidades;
- Central do Mundo;
- Biblioteca e memória;
- Segurança;
- Permissões;
- Auditoria;
- Criação do Mundo com autorização humana;
- Direitos das Produções;
- Financeiro Central;
- Operações e pipeline modular com reentrada;
- Dark Factory;
- Marketing;
- Central de Operações;
- Gestor de Contas;
- Gestor Central da Conta;
- perfis sociais conectáveis;
- estrutura País → Estado → Cidade → Bairro;
- primeira operação em desenvolvimento: SucoCast → YouTube.

## Regra operacional

Todo novo desenvolvimento estrutural e operacional do WordDark deve nascer, ser integrado e testado aqui.

A atualização estrutural não significa construir todas as funções agora. Ela apenas mantém a planta do mundo compatível com os setores que já foram definidos. A implementação detalhada continua sendo feita por operação, começando pelo circuito ativo do SucoCast.
