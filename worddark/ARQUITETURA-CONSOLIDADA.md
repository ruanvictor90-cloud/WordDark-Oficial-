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


## Governança estrutural — pontos consolidados

### 1. Modularidade
Nenhum módulo é estruturalmente indispensável ao mundo inteiro. O núcleo fornece contratos, segurança, roteamento e observabilidade; executores podem ser substituídos.

### 2. Contrato em toda troca
Toda troca entre origem e destino operacional recebe um contrato formal no `ContractRegistry`. O contrato identifica origem, destino, operação, capability, reversibilidade e metadados da rota.

### 3. Infraestrutura compartilhada
Permissões, capabilities, auditoria, emergência, contratos, dependências, rollback e ciclo de vida ficam no núcleo. Setores não devem recriar essas funções.

### 4. Mapa de dependências
`DependencyMap` registra dependências e bloqueia desativação de uma estrutura quando existe dependente obrigatório.

### 5. Capabilities e permissões
Capability descreve o que um módulo consegue executar. Permission Manager controla quem pode solicitar uma capability. A política de autonomia acrescenta o nível de independência permitido.

### 6. Automação controlada
Fluxo padrão:
```
PROPOR → VALIDAR → AUTORIZAR → EXECUTAR → OBSERVAR → REGISTRAR
```
A automação continua preparada/desligada por padrão e exige aprovação quando a política determinar.

### 7. Níveis de autonomia
```
0 MANUAL
1 ASSISTED
2 CONTROLLED
3 AUTONOMOUS
```
Nível maior não remove contratos, permissões, auditoria ou parada de emergência.

### 8. Reversibilidade
`RollbackManager` captura estado antes de operações que suportem reversão. Quando não existe função de desfazer, o sistema informa que o rollback não está disponível em vez de fingir reversibilidade.

### 9. Biblioteca Central
A Biblioteca permanece lenta e deliberadamente consolidada. Ela recebe memória e registros sem ser transformada em dependência obrigatória de cada execução.

### 10. Conceito não é componente
Uma ideia só vira componente executável quando possui responsabilidade, contrato, consumidor e ciclo de vida. Caso contrário permanece documentação/conceito.

## Estruturas temporárias

O mundo pode criar uma estrutura temporária para uma necessidade específica.

```
NECESSIDADE
 ↓
CRIAR
 ↓
VALIDAR
 ↓
USAR
 ↓
AVALIAR
 ├── RETER
 ├── ARQUIVAR
 └── DELETAR
```

O `LifecycleManager` mantém o ciclo de vida da estrutura. A exclusão da estrutura não apaga automaticamente os registros de auditoria da operação que a utilizou.

Uma estrutura temporária também pode ser promovida para uma estrutura permanente quando a necessidade se torna recorrente. A criação continua limitada por contratos, capabilities, permissões, dependências, recursos e Socorro Deus.
