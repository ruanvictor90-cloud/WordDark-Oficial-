# 09 — Mapa-mestre de mundos, domínios, setores e aplicativos

**Estado:** planta arquitetural em consolidação. Itens definidos refletem decisões registradas; propostas e pendências não são implementação aprovada.

## 1. Objetivo

Este é o inventário de referência para responder, antes de qualquer implementação: quais sistemas existem no desenho, por que existem, o que controlam, de quem dependem, como se comunicam e o que ainda precisa de decisão.

O ecossistema é uma rede de sistemas delimitados, não um aplicativo monolítico. Nenhum item implica que o sistema já exista ou funcione.

## 2. Estados de definição

- **Definido:** responsabilidade já acordada.
- **Proposta:** estrutura recomendada, sujeita à revisão.
- **Pendente:** decisão específica ainda necessária.
- **Futuro:** só entra após existir necessidade, capacidade, responsável e critério de aceite.

## 3. Mapa superior

~~~text
ECOSSISTEMA
├── darkHub — central pessoal, catálogo, supervisão e ciclo de desenvolvimento
│   └── WordDark Hub — experiência de gestão do mundo empresarial
├── Camada de contratos e comunicação — contratos, identidade, eventos e compatibilidade
├── Shadow — inteligência, planejamento e preparação de soluções
├── Shadoweb — navegação, pesquisa e conectores permitidos
├── WordDark — mundo empresarial independente
│   ├── Núcleo WordDark — governança, coordenação, permissões, auditoria e roteamento
│   ├── Céu — domínio de produção e desenvolvimento de soluções
│   │   └── Dark Factory — conceito de fábrica de soluções
│   └── Terra — domínio de demanda, clientes, canais e empresas por nicho
└── Aplicativos especializados — entram quando uma necessidade justificar sua existência
~~~

A Central de Conexão pertence ao domínio WordDark, não a Céu. WordDark Hub é acessível dentro de darkHub, mas mantém limites de código, dados e permissão próprios.

## 4. Inventário de sistemas

| Sistema/domínio | Responsabilidade primária | Entradas | Saídas | Limites e dependências |
|---|---|---|---|---|
| darkHub | Central pessoal, catálogo de apps, supervisão, alertas, aprovações e ciclo de versões | Estado declarado dos apps, eventos, solicitações do usuário | Visão consolidada, navegação, solicitações autorizadas, alertas | Não é dono irrestrito dos dados nem executor universal |
| WordDark Hub | Experiência de gestão do WordDark dentro de darkHub | Consultas e comandos autorizados | Painéis e solicitações empresariais | Não substitui o núcleo WordDark |
| Shadow | Interpretar objetivos, investigar, planejar, decompor tarefas e preparar entregáveis | Objetivos, contexto autorizado, resultados de pesquisa e capacidades | Planos, análises, propostas, tarefas e relatórios | Não inventa execução, permissão ou evidência |
| Shadoweb | Navegar, pesquisar, conectar-se a fontes e operar conectores permitidos | Consultas, escopo, permissões e credenciais via mecanismo seguro | Fontes, dados recuperados, resultados e erros | Não contorna autenticação, controles ou falta de API |
| WordDark — núcleo | Governança, catálogo, necessidades, análise de lacunas, coordenação, aprovação, auditoria e recuperação | Contratos, necessidades, eventos e capacidades declaradas | Planos encaminhados, decisões, estados e evidências | Não presume capacidade nem cria operação real sem validação |
| Central de Conexão | Catálogo e controle de integrações do mundo WordDark | Solicitações de conexão, política e declaração do provedor | Conectores registrados, status, limites e resultados | Cada conector tem escopo, credenciais, custo e política próprios |
| Céu | Produção e desenvolvimento de soluções | Necessidades aprovadas, especificações, recursos e critérios | Soluções, módulos, artefatos e evidências | Capacidade produtora só existe após registro, teste e autorização |
| Dark Factory | Organizar criação e alteração de capacidades e artefatos | Lacuna aprovada, especificação, dependências e ambiente isolado | Protótipo, módulo, testes, documentação e pacote de mudança | Conceito futuro; sem acesso livre à produção |
| Terra | Demanda, atendimento, clientes, canais e empresas por nicho | Necessidades, contratos, solicitações e dados permitidos | Demandas organizadas, entregáveis solicitados, aceite e feedback | Isolamento de clientes e limites contratuais obrigatórios |
| Aplicativos especializados | Resolver um problema delimitado | Contrato próprio e entradas autorizadas | Resultado verificável | Sem acesso direto irrestrito a bancos de dados alheios |

## 5. Setores e aplicativos de negócio conhecidos

| Item | Domínio recomendado | Estado | Observação |
|---|---|---|---|
| Aprovações | Núcleo WordDark / experiência WordDark Hub | Função definida; app separado pendente | Motor de decisão é do núcleo; interface pode ser módulo próprio |
| Banco / finanças operacionais | WordDark, conforme escopo a definir | Pendente | Não confundir com banco regulado nem habilitar movimentação por padrão |
| Darkbank pessoal | Domínio financeiro pessoal em darkHub | Futuro; planta funcional pendente | Movimento bruto, gastos, lucro mensal e cofre dividido em capital de giro, investimentos e salário; sem custódia de dinheiro de terceiros |
| Central de Conexão | WordDark | Definido | Catálogo, permissões e ciclo de vida de conectores |
| Dark Factory | Céu | Conceito definido; implementação futura | Criação de soluções e módulos com testes e aprovação |
| Captação | Terra | Proposta de nome/escopo a confirmar | Entrada de oportunidades e necessidades; confirmar grafia e limites |
| Darkcommerce | Terra | Conceito registrado; escopo detalhado pendente | Operação comercial e atendimento de pedidos |
| DarkAccount | Terra | Conceito registrado; escopo detalhado pendente | Gestão de conta/identidade; limites a definir |
| Empresa social | Terra | Categoria definida | Canal/empresa social separado da operação comercial |
| Empresa comercial | Terra | Categoria definida | Pode gerar demanda, vender e encaminhar pedidos; não pertence ao núcleo WordDark |
| Entretenimento/animes | App especializado ligado à experiência pessoal | Futuro | Catálogo conforme disponibilidade e direitos; não é dependência empresarial |

Nomes e limites ainda não especificados ficam pendentes; não serão preenchidos por suposição.

## 6. Tipos de entidade

- **Sistema/app:** software com identidade, versão e limite de dados.
- **Entidade operacional:** empresa, equipe, fábrica, parceiro ou canal cadastrado.
- **Capacidade:** habilidade específica com entradas, saídas, permissões, testes e estado.
- **Necessidade:** problema ou objetivo a resolver.
- **Contrato:** escopo, obrigações, restrições, entregáveis e critérios de aceite.
- **Plano:** decomposição proposta em entregáveis e tarefas.
- **Tarefa:** unidade de trabalho atribuível a uma capacidade elegível.
- **Operação:** tentativa autorizada de produzir um efeito.
- **Evidência:** prova verificável de teste, execução, entrega ou aceite.

Uma entidade pode oferecer várias capacidades; uma capacidade pode ser substituída por outra compatível. Nenhuma relação concede permissão automaticamente.

## 7. Relações essenciais

1. O usuário define objetivos e concede permissões.
2. darkHub apresenta estado e encaminha solicitações autorizadas.
3. WordDark governa o ciclo empresarial e organiza necessidades.
4. Shadow analisa e propõe; Shadoweb fornece pesquisa e conectividade permitida.
5. Céu desenvolve ou produz soluções por capacidades aprovadas.
6. Terra origina e organiza demandas, clientes e operações de negócio.
7. Central de Conexão controla integrações dentro do WordDark.
8. Apps especializados entregam capacidades delimitadas por contratos.
9. Auditoria registra decisões e evidências sem se tornar canal de execução.

## 8. Dados e comunicação

- Cada domínio é responsável pelos seus dados de origem.
- Consultas e alterações entre domínios usam contratos versionados.
- Mensagens carregam identificadores de correlação, escopo, versão e estado.
- Dados de clientes ficam isolados por tenant no lado confiável.
- Eventos informam mudanças; não são autorização.
- Integração local, manual ou simulada é preferida no começo; infraestrutura paga só após necessidade demonstrada.

## 9. Lacunas explícitas

- Escopo exato do módulo Banco empresarial e sua relação com finanças operacionais.
- Escopo e nomenclatura final de Captação, Darkcommerce e DarkAccount.
- Lista definitiva dos apps pessoais de darkHub e seus contratos.
- Identidade, autenticação e gestão de segredos na primeira implantação.
- Persistência inicial de dados/evidências, backup e recuperação.
- Critérios técnicos para aprovar um módulo como capacidade permanente.
- Requisitos legais conforme os serviços comerciais forem definidos.

## 10. Critério de conclusão

O mapa estará revisado quando cada item tiver domínio proprietário, responsabilidade exclusiva, entradas, saídas, dados, permissões, dependências, ciclo de vida, interfaces contratuais, critérios de aceite e classificação entre primeira versão e futuro. Pendências podem continuar existindo se estiverem explícitas e não bloquearem indevidamente a planta geral.
