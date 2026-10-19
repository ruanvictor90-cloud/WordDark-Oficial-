# 10 — Ciclo de descoberta, criação e evolução de soluções

**Estado:** especificação arquitetural proposta para revisão.  
**Objetivo:** permitir que o ecossistema desenvolva capacidades quando uma necessidade exceder o que já existe, sem conceder autonomia irrestrita a agentes ou módulos.

## 1. Princípio

O ecossistema deve poder descobrir uma lacuna, pesquisar alternativas, especificar uma solução, desenvolver ou encomendar um módulo, testá-lo e propor sua incorporação. Não deve presumir que consegue resolver qualquer problema: falta de dados, ferramenta, competência, recurso, permissão ou autorização vira bloqueio explícito.

A criação de soluções é um fluxo governado, não um privilégio ilimitado de Shadow, Shadoweb ou Dark Factory.

## 2. Papéis

### WordDark — governança do ciclo
- Registra a necessidade e sua origem.
- Verifica escopo, risco, capacidade existente e dependências.
- Abre uma lacuna formal quando não há capacidade adequada.
- Mantém estados, responsáveis, aprovações, versões e evidências.
- Encaminha propostas de desenvolvimento segundo a política.
- Não afirma que a solução funciona sem testes e resultados.

### Shadow — análise e planejamento
- Interpreta o objetivo e identifica ambiguidades.
- Formula perguntas, requisitos e critérios de sucesso.
- Decompõe pesquisa e desenvolvimento em tarefas.
- Compara alternativas e registra incertezas.
- Prepara especificações, testes, documentação e proposta de incorporação.
- Não aprova a própria mudança quando a política exige revisão humana.

### Shadoweb — pesquisa e conectividade
- Pesquisa fontes externas e internas permitidas.
- Recupera documentação, padrões, ferramentas e alternativas.
- Usa conectores autorizados com escopo e limites explícitos.
- Registra fontes, datas, limitações e resultados relevantes.
- Não contorna login, controles, restrições de uso ou ausência de API.

### Céu / Dark Factory — produção
- Recebe especificação aprovada.
- Trabalha em ambiente isolado.
- Produz protótipo, módulo, documentação, testes e pacote de mudança.
- Declara dependências, recursos e riscos.
- Entrega evidências para revisão; não publica diretamente em produção por padrão.

### darkHub / usuário — supervisão
- Mostra proposta, diferenças, riscos, custos, testes e impacto.
- Recolhe a autorização exigida para a ação e o ambiente específicos.
- Permite rejeitar, adiar, pedir revisão ou aprovar com limites.
- Mantém a decisão rastreável.

## 3. Fluxo oficial

~~~text
Necessidade
  -> validar objetivo e critérios
  -> buscar capacidades existentes
      -> capacidade suficiente: planejar execução
      -> capacidade parcial: planejar com bloqueios
      -> sem capacidade: abrir lacuna
  -> pesquisar alternativas
  -> propor solução e analisar risco/custo
  -> decidir entre desenvolver, adaptar, integrar, contratar ou não prosseguir
  -> aprovar especificação
  -> desenvolver em ambiente isolado
  -> testar função, segurança, compatibilidade e regressão
  -> revisar evidências
  -> obter aprovação conforme risco
  -> piloto ou uso limitado
  -> avaliar resultado
  -> solução temporária, capacidade permanente, rejeição ou retirada
~~~

Cada transição deve ser validada por uma máquina de estados. Pular etapas exige exceção formal e autorizada.

## 4. Modos de solução

### A. Temporária — escopo limitado
Usada para demanda específica, experimento ou contrato. Deve ter proprietário, escopo, prazo ou condição de expiração, permissões mínimas, critérios de sucesso e plano de desativação. Não pode virar dependência permanente silenciosamente.

### B. Piloto — avaliação limitada
Disponibilizada para ambiente, grupo, contrato ou volume controlado. Tem métricas, limites, monitoramento e critérios para continuar ou interromper. Piloto não equivale a aprovação para uso amplo.

### C. Permanente — capacidade oficial
Só pode ser promovida após testes repetíveis, documentação, compatibilidade, responsável, política de atualização, suporte/recuperação e revisão de risco. Recebe identificador e versão estáveis e entra no catálogo de capacidades.

### D. Rejeitada ou retirada
Quando não atende aos critérios, excede risco/custo, não tem base legal/técnica ou perde utilidade, registra-se a razão e bloqueia-se o roteamento futuro. Dependências existentes devem ser migradas ou encerradas de forma controlada.

## 5. Decidir entre construir, adaptar, integrar ou não fazer

Antes de desenvolver código novo, comparar:
- capacidade já disponível no ecossistema;
- adaptação de módulo existente sem quebrar seu domínio;
- ferramenta ou serviço externo permitido;
- solução manual assistida;
- parceiro ou contratação;
- desenvolvimento próprio;
- recusa, redução de escopo ou espera por recurso ausente.

A opção recomendada deve considerar adequação, segurança, custo total, manutenção, licença, dependência externa, reversibilidade e tempo. API paga não é escolha padrão; precisa de justificativa de valor demonstrável.

## 6. Contrato da proposta de solução

Campos mínimos recomendados:

- solution_proposal_id e need_id;
- domínio proprietário;
- objetivo e problema que resolve;
- usuários/tenants afetados e escopo permitido;
- requisitos funcionais e não funcionais;
- entradas, saídas e schemas;
- capacidades existentes reutilizadas;
- lacunas e dependências;
- alternativas pesquisadas e referências;
- custos conhecidos e desconhecidos;
- permissões necessárias e classe de risco;
- ambiente, dados de teste e limites de isolamento;
- plano de desenvolvimento e plano de testes;
- critérios de aceite e evidências exigidas;
- estratégia de versão, implantação, monitoramento e rollback;
- modo pretendido: temporário, piloto ou permanente;
- data/condição de expiração, quando aplicável;
- decisão, aprovador, escopo aprovado e validade da autorização.

Campos ausentes que afetem segurança, legalidade, custo ou sucesso bloqueiam a aprovação até esclarecimento.

## 7. Segurança e autorização

A aprovação é vinculada a uma versão exata da proposta, ambiente, recursos, permissões e limite de impacto. Mudança material invalida a aprovação anterior.

Exigir aprovação humana explícita antes de:
- alterar produção ou segurança;
- instalar ou executar código com acesso sensível;
- publicar externamente ou representar usuário/empresa;
- enviar dados a terceiros;
- assumir compromisso, compra ou custo;
- mover dinheiro, criar obrigação financeira ou realizar ação irreversível;
- usar dados pessoais ou empresariais além do escopo autorizado.

Autonomia limitada pode ser habilitada para tarefas reversíveis de baixo risco, em ambientes e limites preaprovados. Isso exige política explícita, logs, limites e desligamento seguro. Não é autorização geral para agir.

## 8. Testes obrigatórios

- Testes funcionais e dos critérios de aceite.
- Testes de contrato e compatibilidade.
- Testes de permissão e acesso fora do escopo.
- Testes de isolamento de clientes e dados.
- Testes de falha, timeout, repetição e idempotência.
- Testes de regressão para capacidades existentes.
- Testes de dependências, licença e origem dos componentes.
- Testes de recuperação e desativação.
- Confirmação de que ambiente simulado não causa efeitos externos.
- Evidência reproduzível vinculada à versão testada.

## 9. Promoção para o catálogo

Uma solução só pode ser listada como capacidade ativa quando:
1. existe artefato ou integração identificável e versionado;
2. entradas, saídas e permissões estão declaradas;
3. testes exigidos passaram e evidências estão registradas;
4. há responsável e procedimento de manutenção;
5. riscos e limitações são conhecidos;
6. ambiente e escopo foram aprovados;
7. o catálogo foi atualizado sem sobrescrever silenciosamente versões anteriores.

Descrição, plano, protótipo e código não testado são estados distintos de capacidade ativa.

## 10. Medição e sustentabilidade

Registrar por solução: esforço, custo direto, custo externo, falhas, retrabalho, uso, valor entregue e manutenção. Comparar custo estimado e real. O sistema pode recomendar desativar soluções sem uso ou de custo excessivo, mas a retirada deve respeitar dependências, contratos e aprovações.

## 11. Critério de aceite do ciclo

Em modo simulado, deve ser possível percorrer uma necessidade sem capacidade, gerar lacuna, preparar proposta, simular desenvolvimento/testes, exigir aprovação, promover uma versão fictícia e reverter ou retirar essa capacidade — sem tocar em produção ou serviços reais. Esse fluxo deve ser testado antes de qualquer autonomia de desenvolvimento real.
