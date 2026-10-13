# WordDark — mapa de aplicativos e requisitos de interface futura

**Estado deste documento:** especificação funcional, sem implementação visual.  
**Regra:** não criar telas, componentes, rotas visuais nem recuperar interfaces legadas enquanto os setores e contratos operacionais ainda estão sendo consolidados.

Este documento serve como guia para criar as interfaces depois, app por app. A existência de um módulo ou contrato no repositório não significa que a função esteja pronta para produção ou conectada a serviços externos.

## Regras de arquitetura

- **WordDark coordena** pedidos, prioridades, políticas, aprovações, comunicação, segurança, auditoria e encaminhamento.
- **Céu executa** capacidades especializadas. A Dark Factory pertence ao Céu.
- **Terra origina e organiza necessidades** de clientes, entidades, empresas, canais, pedidos e entregas.
- **Central de Conexões** é infraestrutura compartilhada do WordDark; não é um setor de marketing nem deve ser duplicada dentro de cada app.
- **Ruan permanece separado e privado.** Não criar dependência do Ruan dentro do mundo WordDark.
- O GitHub Pages é interface pública/cliente. Segredos, tokens e ações privilegiadas ficam no backend.
- TEST nunca pode executar operações reais. PROD exige autenticação, autorização por operação, registro de auditoria e aprovação explícita.
- Publicar, despublicar ou agendar conteúdo permanece manual por padrão. Uma futura ativação automática deve ser explícita, revogável e validada no backend.
- Cada app deve consumir contratos e serviços do Core ativo; não criar um segundo Core ou duplicar a autoridade operacional.

## Especificações por app

### 1. WordDark — coordenação do mundo
**Responsabilidade:** receber e classificar necessidades, organizar o trabalho, encaminhar para o setor correto e acompanhar o ciclo de vida.

**A interface futura precisará de:**
- resumo de operações por estado (entrada, análise, aprovado, em execução, aguardando, concluído, falhou);
- fila de pedidos com origem, prioridade, responsável/setor, prazo e histórico;
- detalhe de operação com entrada, decisão, dependências, resultado e trilha de auditoria;
- área de aprovações e bloqueios com motivo claro;
- alertas de falhas, limites, permissões e dependências externas;
- pesquisa e filtros por setor, cliente, operação, data e estado.

**Não deve:** produzir mídia no lugar da Dark Factory, guardar segredos, publicar sem autorização ou expor dados privados do Ruan.

### 2. Céu — catálogo de capacidades executoras
**Responsabilidade:** receber trabalhos encaminhados e fornecer serviços executores disponíveis.

**A interface futura precisará de:**
- catálogo de capacidades e serviços disponíveis;
- estado de cada executor, dependências, limites e versão;
- fila de execução e trabalhos aguardando;
- detalhes de entrada, validação, artefatos gerados, erros e resultado;
- histórico de execução e relação com a operação de origem.

**Não deve:** assumir a propriedade das necessidades da Terra nem escolher sozinho o destino comercial ou de publicação.

### 3. Terra — necessidades, entidades e empresas
**Responsabilidade:** registrar necessidades externas e organizar clientes, entidades, canais, pedidos e entregas.

**A interface futura precisará de:**
- lista de entidades/clientes e respectivos contextos;
- pedidos e necessidades com prioridade, estado, anexos e destino pretendido;
- acompanhamento do encaminhamento ao WordDark e dos resultados recebidos;
- histórico de solicitações e entregas por entidade;
- indicação explícita do que é dado local, validado externamente ou ainda pendente.

**Não deve:** apresentar uma pesquisa externa como validação de fornecedor nem indicar compra, pagamento ou entrega como concluídos sem confirmação real.

### 4. Dark Factory — produção de conteúdo (Céu)
**Responsabilidade:** receber requerimentos autorizados, produzir/processar/validar materiais e devolver artefatos rastreáveis.

**A interface futura precisará de:**
- entrada do pedido e escolha do tipo de serviço;
- opções pertinentes ao serviço: texto/roteiro, idioma, formato, proporção, duração, voz, legendas, identidade e arquivos de referência;
- estado de produção, etapas, progresso, bloqueios e erros;
- prévia e validação dos artefatos, versões e metadados;
- biblioteca de resultados por tipo (áudio, vídeo, voz, imagem e outros arquivos);
- ações de aprovar, pedir alteração, devolver ao solicitante ou arquivar;
- destino de distribuição como informação fornecida pelo solicitante, sem transformar a Fábrica em gestora do canal.

**Limite:** a produção de mídia e a publicação são etapas separadas. A Fábrica não publica diretamente.

### 5. Gestor de redes sociais — Central Social
**Responsabilidade:** organizar perfis, canais, calendário e estado de conteúdo por canal.

**A interface futura precisará de:**
- lista de contas e estado de autorização/capacidades;
- calendário e fila de conteúdo por canal;
- detalhe da publicação com mídia, texto, destino, horário e validações da plataforma;
- fila separada de ações manuais e operações elegíveis à automação;
- histórico de tentativas, recibos externos, erros e links de conteúdo publicado;
- indicadores de resultado apenas quando vierem de fonte real.

**Limite:** não guardar tokens no navegador; a ação automática fica bloqueada sem política de backend e autorização operacional.

### 6. Gestor de marketing digital — Central Social
**Responsabilidade:** planejar aquisição, campanhas, posicionamento e análise comercial.

**A interface futura precisará de:**
- objetivos e público-alvo;
- campanhas, canais, orçamento e período;
- criativos vinculados à biblioteca da Dark Factory;
- estado de aprovação, execução e resultados;
- origem, data e confiabilidade de cada métrica;
- alertas de orçamento, política da plataforma e campanha pausada.

**Limite:** não presumir que anúncios ou campanhas estão conectados a plataformas externas até haver integração real e autorização.

### 7. Gestor de projetos — Central Social
**Responsabilidade:** acompanhar demandas, prazos, responsáveis, custos e entregas.

**A interface futura precisará de:**
- quadro/lista de projetos e tarefas;
- responsável, prazo, prioridade, dependências e estado;
- entregáveis e ligações com operações do WordDark;
- registro de mudanças, bloqueios e aprovações;
- custos previstos e realizados, identificados como estimativa ou valor confirmado.

### 8. Empresa comercial — Terra
**Responsabilidade:** organizar catálogo, clientes, fornecedores, lojas e pedidos.

**A interface futura precisará de:**
- catálogo e disponibilidade com origem e data da informação;
- carrinho/pedido separado por fornecedor;
- dados de cliente e endereço somente quando necessários;
- etapas de pedido: rascunho, aguardando confirmação, confirmado, em processamento, enviado, entregue ou cancelado;
- comprovantes e histórico de comunicação;
- indicação clara de quando pagamento, estoque, logística ou compra externa ainda não estão conectados.

**Limite:** encaminhar um pedido não equivale a comprar, pagar ou concluir a entrega.

### 9. Central de Conexões Externas — infraestrutura WordDark
**Responsabilidade:** administrar autorizações de provedores, contas, capacidades e saúde das integrações.

**A interface futura precisará de:**
- catálogo de provedores com estados separados: não configurado, aguardando autorização, autorização persistida, operacional, revogado ou erro;
- lista de contas autorizadas e capacidades concedidas;
- ações de conectar, renovar, testar e desconectar com confirmação;
- status de backend, armazenamento e última verificação;
- histórico de autorização e operações, sem exibir tokens ou segredos;
- avisos de escopo ausente, aprovação necessária, limites e indisponibilidade.

**Estado conhecido:** o bridge Google/YouTube e o armazenamento criptografado estão preparados. A conexão persistida ainda não ativa capacidades operacionais por si só. O adaptador de upload YouTube permanece desligado e sem rota HTTP.

### 10. Biblioteca central — conhecimento e artefatos
**Responsabilidade:** catalogar conhecimento, documentos, arquivos produzidos, versões e relações com operações.

**A interface futura precisará de:**
- pesquisa por título, tipo, setor, origem, etiquetas e operação;
- pastas/categorias e metadados;
- visualização de versões, autoria/origem e data;
- vínculo entre artefato, pedido e resultado;
- permissões de leitura/alteração e histórico;
- estados de rascunho, validado, aprovado, arquivado e substituído.

### 11. Segurança e governança — WordDark
**Responsabilidade:** aplicar permissões, autoridade, limites, auditoria, resposta a incidentes e recuperação.

**A interface futura precisará de:**
- visão de permissões e capacidades por setor/conta;
- aprovações pendentes e motivo da política aplicada;
- trilha de auditoria com ator, ação, operação, horário e resultado;
- alertas de incidentes, bloqueios e parada de emergência;
- estado de recuperação e verificações de integridade;
- ferramentas administrativas protegidas por autenticação e autorização fortes.

**Limite:** não mostrar segredos, tokens ou conteúdo sensível completo nos registros.

### 12. Operações e diagnósticos — Core WordDark
**Responsabilidade:** registrar, acompanhar, diagnosticar e recuperar operações sem se tornar um segundo orquestrador.

**A interface futura precisará de:**
- fila de operações e estados padronizados;
- linha do tempo de eventos e dependências;
- motivo de falha, diagnóstico e próxima ação segura;
- tentativas e reentrada com proteção contra duplicidade;
- estado de serviços, testes e integridade;
- ações de recuperação com confirmação, escopo e registro de auditoria.

**Limite:** não apresentar snapshots em memória como backup durável nem prometer rollback persistente sem infraestrutura confirmada.

### 13. Escola do Mundo e aprendizado
**Responsabilidade:** organizar documentação operacional, aprendizados validados, padrões e materiais de capacitação.

**A interface futura precisará de:**
- catálogo de guias e lições;
- relação entre material, setor, versão e evidência;
- estado de rascunho, revisão, aprovado e obsoleto;
- pesquisa e trilha de atualização;
- separação entre hipótese, orientação validada e regra obrigatória.

### 14. WordDark Hub e CreationDark
**Responsabilidade do Hub:** ponto de entrada para os apps disponíveis, pedidos rápidos e alertas operacionais.

**A interface futura do Hub precisará de:**
- acesso aos apps e áreas permitidas;
- campo de pedido rápido com estado e confirmação antes de ações externas;
- resumo de alertas, aprovações e operações que exigem atenção;
- links de navegação sem duplicar o conteúdo interno de cada app.

**Responsabilidade do CreationDark:** inventário de módulos, regras, testes e integrações que precisam ser auditados e encaminhados.

**A interface atual deve ser preservada.** O inventário local do navegador não deve ser confundido com sincronização no backend, execução de código ou promoção automática.

### 15. Apps privados Ruan (fora do WordDark)
Estes requisitos são referência de fronteira, não autorização para conectar Ruan ao mundo:
- **Pessoal:** áreas Financeiro e Tarefas; futuramente resumo de saldo/movimentos, contas, vencimentos, tarefas, prazos e notificações.
- **Shadow / darkEye:** área própria para a ideia de navegador/overlay e seus controles; não duplicar Shadow em outros apps nem implementar lógica futura ainda não aprovada.

Os dados pessoais permanecem no Ruan. O WordDark não pode consultar ou administrar essa área por iniciativa própria.

## Contrato comum esperado de cada app

Antes de criar uma interface, cada app deve declarar:
1. responsabilidade e limites;
2. entradas aceitas e validação;
3. saídas/resultados e seus estados;
4. serviços do Core que pode chamar;
5. permissões/capacidades necessárias;
6. dependências externas e modo TEST;
7. erros, repetição segura e cancelamento;
8. dados que podem ser exibidos e dados que devem ser ocultados;
9. testes que comprovam os comportamentos;
10. requisitos da interface futura, sem implementar a interface nesta fase.

## Ordem de consolidação recomendada

1. **Central de Conexões e publicação:** fechar autorização de backend, estado de conexão e controles antes de expor qualquer rota de publicação.
2. **Dark Factory:** confirmar o contrato produção → validação → resultado, sem acoplar publicação.
3. **Gestor de redes sociais:** separar planejamento/fila manual de execução externa.
4. **Terra / Empresa social e comercial:** formalizar pedidos, entidades, destinos e confirmação de resultado.
5. **Core de operações, auditoria e recuperação:** garantir rastreabilidade, idempotência e permissões.
6. **Biblioteca e demais apps:** integrar aos contratos estabilizados.

**Critério para iniciar uma interface:** o contrato do app, seus estados, permissões e testes estão definidos; a interface só apresenta esses contratos e não implementa autoridade paralela.
