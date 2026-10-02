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
A Biblioteca Central é a **Memória Mundial permanente**. Ela recebe, preserva e relaciona conhecimento filtrado pelos setores. A consolidação pode acontecer de forma assíncrona, mas sua função não é ser apenas um arquivo lento: ela mantém a memória global sem virar dependência obrigatória de cada execução.

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

## Biblioteca Mundial — memória em camadas

A Biblioteca Central é a **Memória Mundial do WordDark**. Ela preserva e relaciona memória, conhecimento, histórico, aprendizados, padrões, erros, soluções, decisões, versões, resultados e experiências produzidos pelo mundo.

Cada setor de operação possui uma **Biblioteca Local** própria. A biblioteca local é a primeira camada de memória do setor e registra o contexto operacional sem obrigar toda informação a subir para a Central.

Fluxo:

```text
SETOR
 ↓
BIBLIOTECA LOCAL
 ↓
FILTRAGEM / CONSOLIDAÇÃO
 ├── permanece local
 ├── conhecimento reutilizável no setor
 ├── candidato à memória mundial
 └── Biblioteca Central
```

A consolidação é seletiva. A Biblioteca Central não é dependência síncrona de cada execução e não controla os setores; ela recebe conhecimento filtrado para formar a memória mundial.

A estrutura é compatível com setores temporários: a exclusão de um setor ou executor não apaga automaticamente sua memória relevante já consolidada.

`SectorLibraryManager` registra bibliotecas por setor, permite classificação local e promove somente os registros selecionados para a Biblioteca Central.


## Governança do mundo — Conselho, Escola e Controle

### Conselho Mundial

O Conselho é uma camada de **governança, julgamento e observação**, não um executor oculto. Sua composição e regras finais ainda serão definidas. A arquitetura já reserva o setor responsável para que ele possa julgar situações do mundo segundo as leis do próprio WordDark.

O braço jurídico/“Judiciário” do Conselho poderá trabalhar com:
- leis e regras do mundo;
- termos;
- contratos;
- versões e vigência;
- fatos/evidências da operação;
- decisões e histórico auditável.

O Conselho não publica, edita ou executa diretamente: ele julga, registra a decisão e encaminha a consequência ao setor responsável. Ele pode analisar o uso recorrente do mundo, comparar estruturas e identificar quando uma função está sendo usada fora do setor mais adequado.

Fluxo:

```
MEMÓRIA + USO DO MUNDO
        ↓
     CONSELHO
        ↓
OBSERVAÇÃO / DECISÃO
        ├── manter
        ├── reclassificar setor
        ├── solicitar reestruturação
        └── solicitar revisão
```

O Conselho pode decidir sobre organização e encaminhamento, mas continua sujeito às permissões, contratos, auditoria e controles do mundo.

### Escola do Mundo

A Escola fica na Central de Controle e será tratada como uma **camada de conhecimento e pesquisa do mundo**, com uma experiência conceitual próxima de um buscador: ela poderá procurar, cruzar, comparar e organizar conhecimento externo e interno. O acesso externo será feito por conectores autorizados; antes das conexões reais, a estrutura fica preparada sem fingir acesso à internet.

A Escola poderá estudar:
- tendências e assuntos em alta;
- diretrizes e políticas públicas das plataformas;
- critérios e sinais usados pelas plataformas para avaliar conteúdo, quando essas informações estiverem disponíveis de forma legítima;
- conhecimento técnico e histórico externo;
- conhecimento das bibliotecas locais;
- memória mundial;
- resultados dos próprios experimentos do WordDark.

A Escola não transforma informação externa em verdade automática: cada conhecimento deve carregar origem, contexto e registro.

Ela aprende por duas fontes:

- conhecimento filtrado das bibliotecas locais;
- acontecimentos/sinais relevantes observados no mundo.

Ela pode preparar conteúdos e mantê-los prontos, mas **não possui autorização implícita para colocá-los no mundo**.

```
BIBLIOTECA LOCAL ─┐
                  ├→ ESCOLA → CONTEÚDO PRONTO
MUNDO REAL ───────┘                 ↓
                             AUTORIZAÇÃO HUMANA
                                    ↓
                              LINHA DE POSTAGEM
```

### Escola → conhecimento → produção

A Escola pode alimentar duas saídas diferentes:

1. **Conhecimento:** aprendizado volta para a biblioteca local ou para a Memória Mundial quando merecer consolidação.
2. **Conteúdo preparado:** material pronto fica aguardando autorização humana e pode seguir para a Linha de Postagem.

### Automação

Automação deve ser usada principalmente onde existe repetição, previsibilidade e baixo impacto externo. Ela acelera setores e tarefas internas, mas não transforma automaticamente uma operação interna em autorização para agir no mundo.

### Resultado parcial e reestruturação

Uma operação não precisa ser classificada apenas como "sucesso" ou "falha". Há duas situações diferentes:

- **PARTIAL:** parte dos alvos/etapas terminou e outra parte ainda está pendente ou falhou. Ex.: YouTube concluiu, Instagram aguarda conexão.
- **NEEDS_RESTRUCTURE:** a operação terminou, mas a qualidade/resultado ficou abaixo do objetivo. Ex.: conteúdo publicado/testado não atingiu a métrica esperada e volta para melhoria.

Uma operação não deve ser chamada de “parcial” apenas porque ficou mediana.

```
RESULTADO
├── COMPLETED
├── NEEDS_EDIT
├── NEEDS_RESTRUCTURE
├── FAILED
├── BLOCKED
└── WAITING_HUMAN
```

**NEEDS_EDIT** é usado quando existe um problema corrigível, como direitos, segurança, conteúdo prejudicial ou requisito específico.

**NEEDS_RESTRUCTURE** é usado quando a operação funciona, mas o resultado ficou abaixo do objetivo e precisa ser melhorado. Exemplo: um conteúdo foi produzido corretamente, porém apresentou métricas abaixo do objetivo; ele volta para melhoria sem ser tratado como uma falha total.

Quando a reestruturação não resolve, a operação pode ser encaminhada para uma nova tentativa/refazimento conforme a política do setor.

### Fronteira entre o mundo interno e o mundo externo

O WordDark trata ações com consequência pública/externa como uma **fronteira de autorização**. Produção e preparação podem ser automatizadas conforme política; a passagem para o mundo externo permanece explicitamente controlada.

### O que exige confirmação humana

Tudo que produzir consequência externa relevante permanece atrás de autorização humana explícita, especialmente:

- conteúdo que será publicado;
- escolha/confirmação do conteúdo a publicar;
- definição de data e horário de postagem;
- autorização final de publicação;
- ações que alterem contas externas;
- ações com direitos, segurança ou risco relevante.

A **Linha de Postagem** recebe conteúdo autorizado e mantém a confirmação humana como requisito antes do agendamento/execução.

## Bloco 1 — Controle, Escola, Conselho e passagem ao mundo

### Conselho Mundial
O Conselho possui visão de mundo e acesso à Memória Mundial para observar recorrências, sinais e uso de estruturas. Ele pode registrar decisões de observação, reclassificação, revisão, reestruturação ou retenção. A decisão do Conselho não substitui o executor: ela gera uma decisão/diretriz que deve ser encaminhada ao setor responsável.

### Escola Mundial
A Escola aprende em duas direções:
- biblioteca local dos setores;
- acontecimentos/sinais observados no mundo.

Ela pode analisar conhecimento, aprender com eventos e preparar conteúdos. A preparação não equivale à publicação: conteúdo destinado ao mundo permanece atrás de autorização humana.

### Ciclo de conteúdo
- NEEDS_EDIT: direitos, segurança ou correção localizada exigem edição.
- NEEDS_RESTRUCTURE: resultado abaixo do objetivo/métrica ou qualidade mediana pede melhoria estrutural.
- REDO: quando a solução não é viável, o conteúdo volta para refazer.
- WORLD_RELEASE_GATE: conteúdo tecnicamente pronto aguarda a passagem humana ao mundo.

Uma operação não deve ser considerada "parcial" por ter qualidade mediana. Parcial fica reservado para operações com múltiplos alvos quando apenas parte deles concluiu.

### Linha de postagem
A Linha de Postagem é a fronteira entre produção e mundo externo. Publicação e agendamento exigem confirmação humana registrada. A automação pode preparar, organizar e acelerar etapas repetitivas, mas não recebe por padrão a autoridade final de colocar algo no mundo.

### Automação
Automação é mecanismo de aceleração para tarefas repetitivas e controláveis. Ela não deve assumir a autorização humana necessária para ações de passagem ao mundo. O catálogo exato de tarefas automatizáveis será definido antes das conexões externas.

### Regra de passagem ao mundo
Fluxo conceitual:
Necessidade → Produção → Validação → Edição/Reestruturação/Refazer quando necessário → Pronto → Confirmação humana → Linha de Postagem → Agendamento/Publicação.

Ações externas irreversíveis ou públicas permanecem explicitamente atrás de confirmação humana.


## Escola — pesquisa externa e conhecimento interno

A Escola possui fontes internas e pontos de conexão externa. A implementação interna já reserva fontes de busca/tendência e um catálogo de diretrizes por plataforma, mas o acesso real a cada plataforma só será ativado na etapa de Conexões Externas.

Fluxo:
```
MUNDO EXTERNO ─┐
               ├→ ESCOLA → CRUZAMENTO → APRENDIZADO
MUNDO INTERNO ─┘                 ↓
                         BIBLIOTECA LOCAL / MEMÓRIA MUNDIAL
                                   ↓
                            PRODUÇÃO / MELHORIA
```

A Escola pode observar o que está acontecendo fora e comparar com o que o próprio mundo já aprendeu. Ela não recebe autoridade para publicar só porque aprendeu algo.

## Conselho — Judiciário do mundo

O Conselho será responsável pela camada de julgamento interno segundo as leis que ainda serão definidas. A estrutura suporta leis, termos, contratos, fatos, decisões e auditoria. A definição de composição, competências detalhadas e regras materiais permanece pendente de decisão do criador.

## Terra — pendência legada

A Terra oficial deve permanecer dinâmica. País, Estado, Cidade e Bairro só são materializados quando uma necessidade real exigir. Estruturas antigas de exemplo não devem ser carregadas automaticamente para a operação oficial.

A ligação atual é:
```
TERRA
 ↓
NECESSIDADE
 ↓
CIDADE / SETOR RESPONSÁVEL
 ↓
PORTÃO
 ↓
RODOVIA / RUNTIME
 ↓
SERVIÇO
 ↓
RESULTADO
 ↓
MEMÓRIA
```

O teste legado de Terra deve validar essa criação dinâmica, e não depender de País/SucoCast pré-existentes.


## Mapa oficial de setores — sem pontas soltas

Cada responsabilidade possui um setor de referência. A Central coordena o fluxo, mas não absorve o poder funcional dos setores.

| Setor | Responsabilidade principal |
|---|---|
| Central de Controle | coordenação, filas, orquestração e fronteira de postagem |
| Central de Conexões Externas | todos os conectores, provedores, autorização, saúde e adapters externos |
| Governança | Conselho, leis, termos, contratos e Judiciário |
| Escola Mundial | pesquisa, aprendizado interno/externo, tendências e diretrizes de plataformas |
| Memória Mundial | bibliotecas locais + Biblioteca Central |
| Segurança | permissões, capabilities, auditoria e Socorro Deus |
| Rodovia | transporte de pedidos/resultados |
| Operações/Núcleo | runtime, contratos, dependências, rollback e ciclo de vida |
| Dark Factory | produção local de conteúdo, edição, montagem, áudio, visual e qualidade |
| Marketing | estratégia e campanhas; não possui conectores externos |
| Financeiro | operações financeiras, mantido modular |
| Terra | necessidades, operações, ambientes e setores executores |

### Regra dos conectores

Nenhum setor operacional cria seu próprio conector externo. Redes sociais, serviços de pesquisa, bancos de dados externos e futuros provedores passam pela Central de Conexões.

### Escola Mundial

A Escola é um centro de pesquisa e aprendizagem. Ela cruza conhecimento interno (bibliotecas locais, Memória Mundial e resultados das operações) com conhecimento externo (fontes conectadas, pesquisa, tendências da internet e diretrizes/sinais das plataformas). Aprender não concede autorização automática para publicar.

### Governança e Judiciário

O Conselho pertence ao bloco de Governança. O Judiciário é uma função interna desse bloco e trabalha com leis, termos, contratos, evidências, decisões e histórico. A composição do Conselho permanece sem participantes por enquanto; representantes e cargos serão definidos depois.

As decisões deverão usar uma regra configurável de unanimidade ou maioria votada. O poder funcional permanece distribuído: nenhum bloco recebe autoridade universal apenas por ocupar uma posição hierárquica.

### Hierarquia funcional

A hierarquia será definida por importância e responsabilidade. A arquitetura reserva categorias funcionais como Executores (execução), Gestores (gestão), Orquestradores (coordenação) e Representantes/Governança (julgamento e representação). Os cargos, poderes exatos, representantes e pesos ainda serão definidos por bloco.

### Fronteira humana

A intervenção humana é obrigatória quando a operação cruza para o mundo externo ou produz consequência externa relevante: publicação, confirmação final do conteúdo, definição/confirmação de data e horário, alteração de conta externa ou ação externa de risco.

A automação pode acelerar tarefas repetitivas internas, mas não herda automaticamente essa autoridade.

### Dark Factory — estúdio local

A Dark Factory é uma fábrica/estúdio local de conteúdo, conceitualmente próxima de um editor de vídeo, mas pertencente ao WordDark. Possui briefing, roteiro, visual, edição, áudio, montagem, qualidade e conhecimento.

A fábrica produz e devolve resultados ao fluxo do WordDark; ela não possui conectores externos. Cada produção pode manter projeto local, versões, ativos, timeline, áudio e avaliação de qualidade.

### Aprendizado contínuo

Operação → Resultado → Biblioteca Local → Escola → Análise/Cruzamento → Conhecimento Reutilizável → Memória Mundial.

Eventos externos relevantes também podem entrar pela Escola e ser comparados com o conhecimento interno.

### Ciclo de conteúdo

Necessidade → Fábrica → Validação.

- Direitos/segurança: volta para Edição.
- Resultado mediano: vai para Reestruturação.
- Sem solução: vai para Refazer.
- Aprovado tecnicamente: aguarda Autorização Humana.
- Autorizado: entra na Linha de Postagem.

`PARTIAL` fica reservado para operações com partes independentes em estados diferentes; não significa resultado mediano.

## Organização de responsabilidades — consolidação 2026-10

### Central de Controle
Responsável por coordenar o fluxo operacional central, sem absorver as funções especializadas.
- Orquestrador Central
- Controlador de Automação
- Linha de Postagem
- Escola do Mundo

A Escola é uma área da Central de Controle, mas possui autonomia funcional para pesquisar, aprender, cruzar conhecimento e preparar conteúdo.

### Central de Conexões Externas
É o único ponto responsável por conectores, provedores, autorização, contas/conexões externas, saúde e adaptadores.
Nenhum setor operacional deve manter seu próprio conector externo.

### Governança
É o bloco responsável pelo poder institucional do mundo:
- Conselho Mundial
- Judiciário
- Leis
- Termos
- Contratos
- Regras externas incorporadas como requisitos de conformidade

A composição do Conselho, representantes, cargos, pesos e regra definitiva de votação permanecem deliberadamente em definição.

### Escola do Mundo
A Escola funciona como uma camada de conhecimento ampla, inspirada em uma ferramenta de pesquisa:
- conhecimento interno das bibliotecas locais e da Memória Mundial;
- conhecimento externo autorizado;
- sinais de tendência;
- métricas das operações;
- diretrizes e critérios públicos das plataformas;
- comparação entre conteúdo produzido e desempenho observado.

A Escola aprende continuamente, mas não possui autoridade para publicar no mundo externo.

### Dark Factory
A Dark Factory é o estúdio local de produção do WordDark, não um conector de plataformas.
Seu papel é semelhante ao de um editor/estúdio de conteúdo local:
- briefing;
- roteiro;
- visual;
- áudio;
- edição;
- montagem;
- qualidade;
- versões;
- melhoria baseada em métricas.

Uma operação que apresentar problema de direitos, segurança ou conformidade retorna para edição. Se não houver solução adequada, pode ser refeita. Uma operação com resultado abaixo do objetivo entra em reestruturação para melhoria.

### Ciclo de conteúdo
```
NECESSIDADE
  ↓
DARK FACTORY
  ↓
QUALIDADE / CONFORMIDADE
  ├── problema de direitos/segurança → EDIÇÃO
  ├── problema sem solução → REFAZER
  ├── resultado abaixo do objetivo → REESTRUTURAÇÃO
  └── aprovado internamente → CENTRAL DE CONTROLE
                                      ↓
                                AUTORIZAÇÃO HUMANA
                                      ↓
                                  LINHA DE POSTAGEM
                                      ↓
                              CONEXÃO EXTERNA
```

### Resultados
`PARTIAL` significa somente que uma parte da operação foi concluída enquanto outra parte está pendente ou falhou. Não representa uma avaliação de qualidade.

Resultado mediano/abaixo da meta é tratado como `NEEDS_RESTRUCTURE`: o conteúdo retorna ao ciclo de melhoria, preservando o histórico e as métricas anteriores.

### Métricas e aprendizado
O WordDark deve aprender tanto com o mundo externo quanto com o próprio mundo:
```
PLATAFORMAS / PESQUISA / FONTES EXTERNAS
                 ↓
              ESCOLA
                 ↓
      CONHECIMENTO + SINAIS
                 ↓
             OPERAÇÕES
                 ↓
        MÉTRICAS / RESULTADOS
                 ↓
              ESCOLA
                 ↓
        MELHORIA / APRENDIZADO
```

A Memória Mundial preserva o conhecimento; a Escola interpreta e aprende; a Governança julga segundo as leis; a Central de Conexões conecta; a Dark Factory produz; a Central de Controle coordena.

## Circuito de Inteligência, Produção e Publicação — consolidação 2026-10

### Escola — inteligência híbrida do WordDark
A Escola é o setor de conhecimento e aprendizagem. Sua função é pesquisar e cruzar conhecimento interno e externo, incluindo bibliotecas locais, Memória Mundial, sinais de tendência, documentação pública e diretrizes/indicadores divulgados pelas plataformas quando as conexões estiverem disponíveis.

A Escola não publica e não transforma informação externa em verdade automaticamente. O ciclo é:

fonte → captura → análise → evidência → validação → memória/recomendação

Ela também pode preparar conteúdos candidatos e referências para a fábrica. A pesquisa externa fica desacoplada dos conectores: antes das conexões, a estrutura existe em modo preparado; depois, os provedores podem alimentar a Escola.

### Conselho — governança e julgamento
O Conselho é um setor de governança responsável por julgar situações do mundo segundo as leis já definidas pelo WordDark. Sua composição, cargos e autoridade detalhada ainda serão definidos.

Ele pode consultar memória, operações e evidências para analisar conformidade, conflitos, uso recorrente fora do setor adequado e outras situações que mereçam julgamento. Termos e contratos entram nessa camada quando as conexões externas forem criadas e as relações reais existirem.

Conselho julga; não executa nem publica.

### Dark Factory — produção modular
A fábrica recebe necessidades de produção e pode operar em quatro caminhos principais:

PRODUCE → EDIT → RESTRUCTURE → REDO

- EDIT: corrige um problema localizado, como áudio, roteiro, imagem ou direitos.
- RESTRUCTURE: resultado foi entregue, mas ficou abaixo do objetivo; a operação retorna para melhoria.
- REDO: a solução não foi encontrada ou a abordagem precisa ser refeita substancialmente.
- Cada caminho preserva histórico e permite reentrada modular.

### Marketing — estratégia e crescimento
Marketing deixa de ser apenas um receptor de pedidos. Ele pesquisa sinais, transforma conhecimento em estratégias/candidatos de conteúdo, interpreta desempenho e devolve recomendações para a fábrica e para a Escola.

Marketing não possui conectores externos próprios. Dados externos entram pela Central de Conexões/Escola e resultados das operações retornam pela camada de métricas.

### Linha de postagem e autorização humana
O WordDark separa claramente produção de publicação:

Escola/Marketing → candidato → Dark Factory → validação → Linha de Postagem → autorização humana → agendamento/publicação

Qualquer ação que altere o mundo externo, especialmente postagem e definição de quando publicar, permanece protegida por confirmação humana.

### Aprendizado pelo resultado
Depois da operação externa, métricas e eventos retornam para a Escola/Marketing. Um resultado parcial significa execução incompleta — por exemplo, uma rede publicou e outra falhou. Resultado mediano é tratado como RESTRUCTURE, porque a operação terminou mas não atingiu o objetivo definido.

O ciclo completo passa a ser:

MUNDO → ESCOLA → MARKETING → FÁBRICA → REVISÃO → HUMANO → POSTAGEM → MÉTRICAS → ESCOLA/MARKETING

Esse circuito permite automação em tarefas repetitivas e aceleráveis sem conceder à automação a autorização final para colocar algo no mundo.
