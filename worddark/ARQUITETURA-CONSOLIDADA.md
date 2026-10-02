# Arquitetura Consolidada — WordDark Oficial

## Regra principal

O mundo possui uma única espinha dorsal operacional. Setores não recriam infraestrutura central.

## Linguagem técnica

- Código executável: JavaScript ES Modules.
- Identificadores técnicos: inglês, estáveis e consistentes.
- Interface para usuário: português-BR.
- Nomes do mundo (País, Estado, Cidade, Bairro, Céu, Terra): preservados como domínio conceitual.
- Status e eventos internos usam constantes padronizadas.
- Um módulo deve ter uma responsabilidade principal e uma entrada/saída clara.

## Núcleo central

```
WORDDARK
├── Runtime
├── Registry / Capabilities
├── Gates
├── Road
├── Pipeline
├── Operation Registry
├── Audit / Memory
├── Permissions / Security
├── Emergency Stop
├── Automation Controller
├── Central Orchestrator
└── External Connection Hub
```

## Conexões externas

Todas as integrações com serviços externos devem passar pelo:

```
EXTERNAL CONNECTION HUB
├── Provider Registry
├── Authorization State
├── Connector / Adapter
├── Capability Map
├── Health
├── Audit
└── Error / Recovery
```

Um setor pode pedir uma conexão, mas não deve implementar sua própria infraestrutura de OAuth, tokens, estados ou diagnóstico.

## Automação

```
REQUISITO
 ↓
PORTÃO
 ↓
VALIDAÇÃO
 ↓
FILA
 ↓
APROVAÇÃO
 ↓
EXECUÇÃO
 ↓
RESULTADO
 ↓
REGISTRO
```

A automação permanece preparada/desligada até autorização explícita.

## Segurança

Existem dois níveis:

- parada por operação;
- parada global — Socorro Deus.

Toda execução e reentrada crítica consulta a trava antes de avançar.

## Regra de reentrada

Se somente um módulo falhar, o reparo volta para aquele módulo. Não é necessário refazer módulos já aprovados.

## Estrutura do mundo

### Terra

```
PAÍS → ESTADO → CIDADE → BAIRRO
GRUPO → OPERAÇÃO → AMBIENTE/PERFIL → SETOR EXECUTOR
```

A hierarquia é dinâmica. Não se cria País/Estado/Cidade/Bairro sem necessidade.

### Céu

```
DOMÍNIO → REGIÃO → NÚCLEO → DISTRITO
GRUPO GLOBAL → OPERAÇÃO GLOBAL → UNIDADE → SETOR GLOBAL
```

## Estado atual das conexões

- YouTube: infraestrutura de conexão existente.
- Instagram: hub centralizado; OAuth específico ainda externo.
- TikTok: hub centralizado; OAuth específico ainda externo.
- Facebook: hub centralizado; OAuth específico ainda externo.

A infraestrutura interna não deve ser duplicada quando os conectores externos forem implementados.
