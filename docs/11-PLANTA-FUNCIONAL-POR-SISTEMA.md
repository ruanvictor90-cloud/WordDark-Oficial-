# 11 — Planta funcional por sistema

**Estado:** primeira matriz funcional. Os itens sem escopo suficiente estão explicitamente marcados como pendentes; esta planta não autoriza começar a implementar todos eles.

## 1. Modelo obrigatório de ficha

Antes de implementar qualquer sistema ou módulo, preencher e revisar:
1. Identidade, domínio proprietário e responsável.
2. Problema que resolve e usuários autorizados.
3. Escopo incluído e exclusões.
4. Entradas, validações e fontes de dados.
5. Saídas, efeitos e evidências.
6. Dados sob propriedade do domínio, retenção e isolamento.
7. Permissões necessárias e riscos.
8. Contratos, eventos e dependências.
9. Estados e tratamento de falhas.
10. Testes, critérios de aceite, manutenção e retirada.
11. Dependências de interface, sem desenhar a interface antes da definição funcional.
12. Estado da decisão: definido, proposta ou pendente.

## 2. Fichas funcionais iniciais

### 2.1 darkHub
**Estado:** responsabilidade central definida; inventário completo de módulos pessoais pendente.

- **Objetivo:** ponto de entrada pessoal, catálogo/launcher, supervisão, informações, notificações e coordenação de solicitações autorizadas.
- **Entradas:** estado declarado dos apps, eventos, alertas, decisões do usuário e solicitações de desenvolvimento.
- **Saídas:** navegação, resumo de estado, fila de aprovações, encaminhamento de comandos permitidos e histórico de versões.
- **Dados próprios:** preferências pessoais, catálogo de apps, configurações do Hub e referências de eventos autorizadas.
- **Não faz:** acessar irrestritamente todos os dados; substituir regras de negócio de cada app; declarar sucesso sem evidência.
- **Dependências:** contratos comuns, identidade/permissões e interfaces declaradas dos apps.
- **Aceite inicial:** apresentar somente sistemas registrados; diferenciar status real, desconhecido e desatualizado; negar comando sem permissão; não inventar métricas.

### 2.2 WordDark Hub
**Estado:** papel e localização definidos; casos de uso detalhados pendentes.

- **Objetivo:** oferecer a experiência de gestão do mundo WordDark dentro do darkHub.
- **Entradas:** consultas, eventos e comandos com escopo empresarial.
- **Saídas:** vistas de operação, fila de aprovações, estado de contratos e solicitações encaminhadas.
- **Dados próprios:** preferências da experiência e estado de interface; dados empresariais continuam pertencendo ao WordDark.
- **Não faz:** manter uma segunda regra empresarial paralela nem acessar diretamente armazenamento interno do núcleo.
- **Aceite inicial:** toda ação empresarial é identificável, autorizada e rastreável até o WordDark.

### 2.3 WordDark — núcleo
**Estado:** responsabilidades base definidas; detalhes técnicos finais dependem de testes de contrato.

- **Objetivo:** governar o mundo empresarial, manter catálogo de capacidades, necessidades, contratos, permissões, planejamento, roteamento, aprovações, auditoria e recuperação.
- **Entradas:** contrato, necessidade, cadastro de entidade/capacidade, comando, evento e resultado.
- **Saídas:** validações, planos, lacunas, decisões de roteamento, solicitações de aprovação e estado verificável.
- **Dados próprios:** registro de necessidades, contratos operacionais, catálogo de entidades/capacidades, políticas e trilha de auditoria.
- **Não faz:** fingir capacidade, misturar dados de clientes, executar operação sem autorização ou construir toda solução dentro do próprio núcleo.
- **Aceite inicial:** necessidade sem capacidade gera lacuna; entidade inativa não recebe tarefa; operação sem permissão é bloqueada; falha não vira sucesso.

### 2.4 Central de Conexão
**Estado:** pertence ao WordDark; contrato completo de conector precisa ser finalizado.

- **Objetivo:** registrar e governar conectores internos/externos e suas capacidades.
- **Entradas:** declaração do provedor, finalidade, autenticação, permissões, dados, limites, custo, ambiente e modo de teste.
- **Saídas:** ficha do conector, estado de conexão, capacidades disponíveis, erro e evidência de teste.
- **Não faz:** contornar autenticação, inventar API, guardar segredo em código ou conceder acesso genérico.
- **Aceite inicial:** conector sem permissões e limites declarados permanece inativo; falha e custo são visíveis.

### 2.5 Shadow
**Estado:** papel conceitual definido; modelo de execução e tecnologia ainda pendentes.

- **Objetivo:** transformar objetivos em investigação, raciocínio, planos, especificações, tarefas e relatórios.
- **Entradas:** objetivo, contexto autorizado, política, resultados de pesquisa e capacidades conhecidas.
- **Saídas:** plano com dependências, alternativas, incertezas, proposta de solução e perguntas de decisão.
- **Não faz:** elevar privilégios, aprovar sua própria ação crítica, afirmar execução sem evidência ou ignorar restrições.
- **Aceite inicial:** plano identifica dados ausentes, capacidade inexistente, risco, custo e etapa que exige aprovação.

### 2.6 Shadoweb
**Estado:** finalidade definida; detalhes de navegador, armazenamento e conectores pendentes.

- **Objetivo:** fornecer navegação e pesquisa, além de acesso a conectores permitidos, para uso pessoal e operações do ecossistema.
- **Entradas:** consulta, URL/fonte, escopo de permissão e instruções de conector.
- **Saídas:** fontes, dados recuperados, referências, estado de conexão, resultados e erros.
- **Não faz:** tratar todo site como API, contornar controles de acesso ou executar ação externa fora do escopo.
- **Aceite inicial:** cada ação de conector registra origem, permissão, destino, resultado e falha; leitura e escrita são permissões distintas.

### 2.7 Céu
**Estado:** domínio de produção definido; organograma interno futuro.

- **Objetivo:** produzir soluções, artefatos e capacidades a partir de necessidades e especificações aprovadas.
- **Entradas:** lacuna validada, requisitos, dependências, recursos e ambiente de desenvolvimento.
- **Saídas:** protótipos, módulos, documentação, testes e pacote de mudança.
- **Não faz:** ativar diretamente em produção por padrão ou declarar um protótipo como capacidade ativa.
- **Aceite inicial:** todo artefato entregue tem versão, testes, dependências, limitações e plano de retorno.

### 2.8 Dark Factory
**Estado:** conceito de produção dentro de Céu; desenho interno pendente.

- **Objetivo:** organizar o ciclo repetível de descoberta, especificação, desenvolvimento, teste e preparação de novas capacidades.
- **Entradas:** lacuna aprovada, proposta de solução, critérios e permissões.
- **Saídas:** pacote de solução testado e evidências para revisão.
- **Não faz:** modificar os próprios controles, acessar segredos sem necessidade ou publicar mudanças críticas sem aprovação.
- **Aceite inicial:** consegue completar o ciclo simulado sem rede/produção; alteração fora do escopo é bloqueada.

### 2.9 Terra
**Estado:** domínio de demanda definido; empresas e canais começam vazios.

- **Objetivo:** registrar e organizar clientes, necessidades, contratos, empresas por nicho e canais de atendimento.
- **Entradas:** solicitações, dados de cliente autorizados, contratos e feedback.
- **Saídas:** demandas qualificadas, entregáveis solicitados, estados de atendimento e aceite.
- **Não faz:** assumir obrigações fora do contrato ou expor dados entre clientes.
- **Aceite inicial:** cada demanda rastreia origem, escopo, responsável, consentimentos/autorizações pertinentes e critérios de aceite.

### 2.10 Darkcommerce
**Estado:** conceito comercial registrado; ficha funcional pendente.

- **Objetivo proposto:** organizar operação comercial, catálogo/oferta, pedidos e fluxo de atendimento conforme modelo de negócio aprovado.
- **Entradas/saídas detalhadas:** pendentes da definição do primeiro serviço/produto real.
- **Limites provisórios:** não enviar pedido a fornecedor, cobrar, comprar, publicar ou assumir compromisso externo sem autorização adequada.
- **Aceite para iniciar especificação:** modelo comercial, origem de estoque/entrega, preço, cancelamento, devolução, responsável e critérios de conclusão definidos.

### 2.11 DarkAccount
**Estado:** conceito registrado; escopo pendente.

- **Questão a resolver:** determinar se representa conta de cliente, perfil de empresa, identidade de acesso ou uma combinação separada por submódulos.
- **Regra:** não misturar identidade/autenticação, perfil comercial e carteira financeira sem decisões explícitas de dados e segurança.
- **Aceite para iniciar especificação:** tipos de conta, proprietário dos dados, permissões, recuperação, encerramento e relação com outros domínios definidos.

### 2.12 Captação
**Estado:** nome e escopo a confirmar.

- **Objetivo proposto:** organizar entrada de oportunidades, potenciais clientes e necessidades.
- **Limite:** captar contato não equivale a consentimento para marketing, contrato ou execução.
- **Aceite para iniciar especificação:** fontes, campos mínimos, consentimentos, qualificação, retenção e passagem para contrato definidos.

### 2.13 Darkbank pessoal
**Estado:** intenção funcional registrada; arquitetura e conformidade pendentes.

- **Objetivo proposto:** acompanhar movimento bruto, gastos, lucro mensal e cofre com divisões de capital de giro, investimentos e salário pessoal.
- **Limite:** ferramenta privada de controle e registro; não é banco regulado nem custodia dinheiro de clientes.
- **Aceite para iniciar especificação:** definir fórmulas, categorias, períodos, moeda, importação manual, correções, conciliação e exportação; não simular dados como reais.

### 2.14 Aplicativos pessoais futuros
**Estado:** catálogo definitivo pendente.

Cada app especializado deve ter uma ficha própria e não pode ser criado apenas para preencher a gaveta. Entretenimento/animes, tarefas, lembretes, compras e outros recursos só entram quando seu caso de uso, fonte de dados, direitos, dependências e critérios forem definidos.

## 3. Regras para itens ainda não especificados

- Não inventar função para nome que ainda não foi definido.
- Não criar interface como substituto de requisito funcional.
- Não criar motor antes de saber entradas, saídas, proprietário e critério de aceite.
- Não declarar módulo “pronto” apenas por ter código ou tela.
- Quando houver sobreposição, escolher um único proprietário da regra e expor contrato para os demais.
- Uma decisão pendente pode bloquear o módulo correspondente sem bloquear todo o inventário.

## 4. Critério de aceite desta planta

Cada sistema em escopo inicial terá ficha revisada e aprovada; os sistemas futuros terão ficha mínima e condição clara de entrada. Nenhum módulo começa a ser implementado enquanto suas responsabilidades se sobrepuserem de forma não resolvida ou faltarem decisões críticas de segurança.
