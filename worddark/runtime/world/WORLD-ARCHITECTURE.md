# WordDark — Arquitetura Geral do Mundo v1

## Princípio

WordDark é um sistema de coordenação de operações e empresas, não apenas um gerador de conteúdo ou um conjunto de planos financeiros. Cada setor tem responsabilidade delimitada, interface própria e contrato de comunicação comum. A implementação cresce por módulos sem duplicar o runtime central.

## Hierarquia de autoridade

1. **ADM Dono (externo e soberano):** camada de confiança externa ao WordDark. Autoriza acesso e limites; pode interromper ou revogar a operação do mundo. Não é uma conta/role interna que o WordDark possa criar, promover ou administrar.
2. **ADM (administração interna):** governa configurações e operações internas dentro do limite autorizado pelo topo.
3. **DEV (desenvolvimento):** constrói, testa e mantém módulos autorizados. Não recebe autoridade administrativa por escrever código.
4. **Público:** acessa somente interfaces e serviços publicados.

A ordem não é uma cadeia de promoção de cargos. Nenhuma camada inferior pode criar permissões para uma camada superior. ADM, DEV e Público têm zonas e permissões separadas; por padrão, a decisão é negar.

## Portão de autorização interno

O módulo `core/world-gateway.mjs` funciona como uma camada de entrada para comandos autorizados. Ele usa uma lista fixa de comandos, resolve a identidade por um resolvedor confiável fornecido pela aplicação e consulta a fronteira de autoridade antes de chamar o executor. A decisão é negar quando a identidade não pode ser resolvida, o comando não existe, a permissão falta ou o executor não foi configurado.

**Limite atual:** o gateway é uma camada pronta para integração, não um sistema completo de login. A aplicação hospedeira ainda precisa fornecer autenticação real, sessões seguras, armazenamento de identidades, registro de auditoria persistente e handlers conectados ao runtime. Não se deve confiar em cargos enviados diretamente pelo navegador nem publicar esse módulo como única proteção de uma API. ADM Dono permanece uma fronteira soberana externa e não pode ser criado por comandos internos.

## Trindade funcional

- **Mundo / WordDark:** coordenação, validação, segurança, biblioteca, roteamento, auditoria e supervisão.
- **Céu:** produção e soluções — Dark Factory, Marketing, seleção e execução de conteúdo.
- **Terra:** empresas, clientes, canais, comércio, serviços e operações do mundo real.
- **Rodovia:** transporte interno de mensagens e capacidades; sem painel público próprio.

Céu e Terra são domínios operacionais, não cargos hierárquicos nem autoridades superiores ao mundo. Toda solicitação atravessa contratos de autorização, roteamento, execução e resultado.

## Setores do mundo

### Administração e controle
- Central do Mundo e painel ADM.
- Identidade, sessões, permissões e fronteiras de confiança.
- Segurança, auditoria, parada de emergência e recuperação.
- Biblioteca Mundial, histórico e arquivos.
- Central de Testes e ambientes TEST / STAGING / PRODUCTION.
- Registro de operações, resultados e falhas.

### Céu — produção e soluções
- Dark Factory: execução modular de pedidos de conteúdo.
- Marketing: identidade, pesquisa de tendências, formatos, estratégia e distribuição.
- Motores especializados de texto, imagem, vídeo e áudio.
- Direitos autorais, revisão humana e políticas específicas por plataforma.
- Planejador, avaliação de qualidade e relatório de produção.

### Terra — negócios e operação externa
- Gestão de empresas, clientes, projetos, recursos e serviços.
- Central Comercial para catálogos, fornecedores, pedidos e lojas.
- Gestão de canais sociais conectados como clientes/operações externas.
- Operações digitais e automações comerciais.
- Adaptadores de plataformas com escopos mínimos e autorização revogável.

### Financeiro — setor transversal
- Livro financeiro, receitas, despesas, obrigações e conciliação.
- Orçamentos, custos de execução, pagamentos e relatórios.
- Planos e assinaturas comerciais como futura linha de receita, separada da administração e da produção.
- Nenhum plano é tratado como receita recebida antes da confirmação financeira.

### Infraestrutura
- Contratos de operação e produção.
- Linguagem universal para intenção, operação individual e produção completa.
- Registry de capacidades, roteador e adaptadores.
- Filas, reentrada controlada, idempotência e rastreabilidade.
- Interfaces públicas isoladas do blueprint interno.

## Contrato de uma operação

Toda operação deve identificar: solicitante, origem, destino, ação, ambiente, permissões, recursos, identificador idempotente e resultado. O ciclo é:

`REQUESTED → IDENTIFIED → AUTHORIZED → RECEIVED → ROUTED → EXECUTING → VALIDATING → COMPLETED`

Falhas podem resultar em `REJECTED`, `BLOCKED`, `FAILED` ou `WAITING`. Não há execução quando autorização, rota ou ambiente não são válidos.

## Ambientes

- **TEST:** dados e efeitos simulados; não publica nem movimenta dinheiro.
- **STAGING:** validação integrada, com contas e credenciais de teste.
- **PRODUCTION:** efeitos reais somente após autorização explícita, controles de segurança e testes aprovados.

## Estado de implementação

Este documento é o mapa-alvo; não significa que todos os setores já estejam implementados ou conectados. O limite de autoridade tem um primeiro módulo executável. Os demais setores serão integrados progressivamente aos contratos e testes existentes, sem declarar pronto o que ainda não foi executado ou validado.

## Ordem de construção

1. Fronteira de autoridade e identidade.
2. Runtime, contratos, registro de operações, roteamento e auditoria.
3. Biblioteca, segurança, parada de emergência e central de testes.
4. Integração de Céu e Dark Factory por capacidades modulares.
5. Integração de Terra: empresas, canais e comércio.
6. Financeiro central e, separadamente, monetização/planos.
7. Interfaces ADM, DEV e Público com dados e permissões segregados.
8. Validação ponta a ponta antes de promover qualquer mudança à produção.
