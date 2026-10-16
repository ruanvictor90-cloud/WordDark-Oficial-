# WordDark — Plano de finalização isolada

**Data de abertura:** 2026-10-15  
**Branch de trabalho:** `finalize/worddark-2026-10-15`  
**Base:** `main` no início do trabalho  
**Regra de publicação:** nenhuma alteração é integrada a `main` sem autorização explícita.

## Objetivo

Revisar e finalizar o WordDark como mundo operacional separado do aplicativo pessoal Ruan. Esta branch é uma área de trabalho isolada; não representa publicação nem integração concluída.

## Arquitetura canônica

- **WordDark:** coordenação, governança, segurança, biblioteca, contratos e conexões centrais.
- **Céu:** execução especializada, incluindo Dark Factory e Central Social.
- **Terra:** origens de demanda, empresas e operações voltadas a clientes/entidades externas.
- **Darkbank:** registros financeiros internos do WordDark; não equivale a banco real nem se conecta às finanças do Ruan.
- **Central de conexão:** fronteira única para conectores externos.
- **Hub:** entrada e acompanhamento de pedidos/testes.
- **Ruan:** aplicação pessoal privada e independente, fora do domínio WordDark.
- **SucoCast, SucoGeek, SucoComed e SucoFactor:** canais/clientes externos, não setores internos do mundo.

## Regras invioláveis

1. Não criar um segundo Core. A fonte canônica é `worddark/runtime/world/core/`.
2. Não importar automaticamente o legado `worddark/core-central/` para o fluxo ativo.
3. Não mudar interfaces existentes nesta etapa sem necessidade funcional comprovada.
4. TEST deve usar simulações; nenhuma chamada externa, publicação, compra, cobrança ou transferência real por padrão.
5. PROD exige autorização explícita, credenciais no servidor, auditoria e parada emergencial.
6. Não misturar dados, autoridade ou finanças do Ruan com WordDark.
7. Não afirmar que uma conexão funciona apenas porque há uma tela ou adaptador no repositório.
8. Não publicar nem mesclar esta branch sem aprovação explícita.

## Trilhas de finalização

### A. Inventário e integridade
- Mapear interfaces, motores, contratos, adaptadores, armazenamento e testes.
- Identificar rotas duplicadas, arquivos órfãos, importações quebradas e módulos não conectados.
- Confirmar o que é funcional localmente e o que é apenas protótipo.

### B. Core e contratos
- Validar identificadores, estados, validação de entradas, contratos de solicitação/resultado e registro de operações.
- Garantir autorização antes de encaminhar operações.
- Garantir que aprovação e roteamento não executem efeitos externos por si sós.
- Verificar idempotência, erros, retomada e limites entre domínios.

### C. Céu e Dark Factory
- Verificar o fluxo solicitação → recebimento → execução → resposta.
- Validar tipos de tarefa, regras por plataforma, biblioteca de materiais e saídas de execução.
- Manter publicação externa bloqueada até haver integração e confirmação real do provedor.

### D. Terra e ciclo comercial
- Validar captação/entrada de demanda, identificação de origem, encaminhamento e resposta.
- Manter clientes e canais externos fora da hierarquia interna permanente.
- Distinguir simulação de operação comercial realmente executada.

### E. Central de conexão e segurança
- Verificar contratos, registro de provedores/contas, permissões por capacidade, ambiente e escopo.
- Bloquear segredos no cliente e chamadas reais em TEST.
- Testar falhas, revogação, repetição, timeout e parada emergencial.
- Não considerar OAuth ou API conectados sem evidência de ponta a ponta.

### F. Darkbank e governança
- Validar registros, saldos derivados, histórico, cofre e investimentos como gestão interna simulada/local.
- Identificar limites de persistência e ausência de backend sincronizado.
- Manter impostos como estimativas e não realizar transações bancárias reais.

### G. Biblioteca, Escola do Mundo e aplicativos centrais
- Verificar navegação, permissões, consistência de dados e limites de cada módulo.
- Evitar duplicar responsabilidades entre aplicativos.
- Preservar identidade visual existente, corrigindo apenas regressões funcionais necessárias.

### H. Testes e aceite
- Executar a suíte `npm test` em ambiente de execução disponível.
- Executar testes específicos dos contratos, Core, Dark Factory, conexões e fronteiras de segurança.
- Revisar navegação e persistência no navegador.
- Registrar resultados reais, falhas e limitações; não declarar testes executados sem execução observável.

## Critérios de conclusão

- Nenhum Core duplicado no fluxo ativo.
- Fluxo de operação rastreável, validado e com autorização explícita.
- Nenhum efeito externo real disparado por simulação.
- Limites Ruan/WordDark preservados.
- Testes executados e resultados documentados.
- Lista clara de recursos locais, protótipos e integrações realmente verificadas.
- Revisão final antes de qualquer integração; `main` permanece intacta durante esta etapa.

## Estado inicial da revisão

- O README de `main` define `worddark/runtime/world/core/` como Core canônico e alerta que coexistência de arquivos não prova integração.
- A suíte declarada em `package.json` cobre testes de Ruan, Hub, Core, Terra, Céu, Dark Factory, conexões e segurança.
- A inspeção inicial de `worddark-engine.js` mostra que a coordenação propõe rotas com aprovação requerida e execução desativada; ainda é necessário validar o fluxo integrado e as garantias dos demais módulos.
- O gateway de conexões contém validação de contrato e autorização via registro; a revisão deve confirmar o comportamento completo de falhas, ambiente e execução.
- A suíte não foi executada nesta revisão inicial; não há resultado de execução a declarar ainda.
