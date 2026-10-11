# WordDark — Base Unificada por Apps (prévia v0.1)

Esta pasta apresenta uma nova camada de interface e catálogo de setores. A versão atual do portal e os módulos anteriores foram mantidos sem substituição.

## Abrir a prévia

`adm/ruan/apps/worddark/alinhamento/index.html` é a entrada da base visual. O primeiro ecrã funciona como lançador; o app WordDark abre o Portão. No Portão, cada setor aparece como um app e os widgets ficam reservados para informações de acompanhamento.

## Identidade consolidada

- **WordDark:** coordena, valida e encaminha.
- **Aprovações:** ponto central para decisões que exigem autorização humana.
- **Banco:** gestão financeira; não é uma instituição bancária nem executa movimentações reais.
- **Céu:** soluções, marketing, localização e produção.
- **Terra:** captação e operações comerciais, canais, clientes, produtos e pedidos.
- **Biblioteca:** conhecimento, histórico, versões e aprendizados validados.
- **Segurança:** identidade, autorização, auditoria, ambientes e emergência.
- **Rodovia:** transporte/roteamento interno; permanece infraestrutura invisível.
- **Véu:** fronteira de segurança e privacidade; permanece infraestrutura invisível.

## Auditoria resumida

| Área | Encontrado no código | Alinhamento proposto |
|---|---|---|
| Motor central | Contratos, operação, coordenador, registro, comunicação, ambiente e segurança | Um único caminho comum; não criar um segundo motor na interface |
| Aprovações | Regras de aprovação humana e bloqueios em produção | Criar um app central e depois conectar todos os emissores de aprovação |
| Banco/financeiro | DarkBank visual e visão financeira no app operacional | Unificar sob Banco, separar valores previstos/declarados/confirmados e planos |
| Dark Factory | Interface, pipeline e componentes de produção | Manter como executor do Céu; não decidir o destino da publicação |
| Marketing | Visão existente no app operacional | Separar estratégia e briefing da produção executada pela fábrica |
| Localização | Campos e validações de trabalhos de localização | Organizar tradução/legendas/áudio como setor; não declarar dublagem integrada sem validação |
| Captação | Cadastro, triagem, estados e declaração manual de receita | Encaminhar pedidos com origem e requisitos; oportunidade não é receita |
| Canais/conexões | Visões de canais, checklist e políticas de conexão | Mostrar estado e capacidades; não expor credenciais nem presumir OAuth conectado |
| Comercial | Telas de catálogo, fornecedores, pedidos, clientes, custos e comércio | Apps separados que compartilham contratos e identificadores |
| Biblioteca | Visão de biblioteca e estruturas de memória/aprendizado | Diferenciar conhecimento candidato de regra validada |
| Segurança | Regras de permissão, auditoria, ambientes e parada de emergência | Revalidar cada operação; a interface estática não é autoridade de segurança |
| Testes | Testes estruturais e documentação de circuito validado | Consolidar testes de setor e ponta a ponta antes de produção |

## Limites desta prévia

- A tela e o catálogo são uma **base visual funcional**, não uma integração completa.
- Os widgets indicam estado estrutural; não inventam contagens, saldos ou aprovações.
- Os links “Abrir interface atual” levam a telas preexistentes. A presença de uma tela não confirma persistência, autenticação ou integração externa.
- GitHub Pages é uma camada pública/estática; não deve guardar segredos nem ser a autoridade final para permissões ou ações irreversíveis.
- A Área ADM/Ruan permanece separada e fora do controle do WordDark.
- A Rodovia e o Véu não viram apps visíveis só para preencher a tela.

## Próximos passos depois da revisão visual

1. Validar identidade, nomes e agrupamento dos apps.
2. Consolidar os contratos de navegação e os identificadores compartilhados.
3. Definir o modelo único de pedidos de aprovação e ligar os setores emissores.
4. Unificar a gestão financeira sob Banco.
5. Auditar e conectar um setor por vez, com testes e distinção explícita entre TEST e PROD.
