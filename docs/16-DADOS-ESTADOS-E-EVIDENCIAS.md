# 16 — Dados, estados e evidências

**Estado:** modelo lógico proposto para revisão. Não define ainda uma tecnologia de banco ou armazenamento.

## 1. Objetivo

Definir como o ecossistema representa fatos, estados e provas sem depender de um banco de dados específico. A tecnologia de armazenamento será escolhida depois de considerar o ambiente real, segurança, backup, capacidade de teste e custo.

## 2. Propriedade dos dados

| Dado | Domínio proprietário recomendado | Consumidores por contrato |
|---|---|---|
| Preferências e catálogo pessoal | darkHub | Apps autorizados recebem apenas as preferências necessárias |
| Preferências da experiência empresarial | WordDark Hub | Núcleo WordDark quando necessário |
| Contratos, necessidades e planos empresariais | WordDark | WordDark Hub, Shadow e módulos autorizados |
| Identidade e permissões empresariais | Domínio de identidade definido para WordDark | Serviços que precisam validar uma ação |
| Credenciais de conectores | Cofre/armazenamento seguro a definir | Conector autorizado, somente no momento de uso |
| Pesquisa e fontes | Shadow/Shadoweb ou registro de pesquisa definido | Consumidores autorizados com referência à fonte |
| Código, pacotes e artefatos de solução | Céu/Dark Factory ou repositório versionado designado | Validador, testes, revisão e promoção |
| Dados de clientes | Tenant e domínio contratual correspondentes | Somente processos autorizados para aquele tenant |
| Resultados, auditoria e evidências | Registro de auditoria/evidências definido | Revisores e módulos com permissão |
| Registros financeiros pessoais | Domínio financeiro pessoal, se aprovado | darkHub e usuários autorizados |
| Registros financeiros de negócio | Domínio empresarial financeiro a definir | WordDark e módulos autorizados, separados do financeiro pessoal |

A tabela define propriedade lógica, não a localização física dos arquivos. A tecnologia de armazenamento e as chaves de acesso continuam pendentes.

## 3. Tipos de registro

- **Fonte:** origem de uma afirmação ou dado recuperado.
- **Necessidade:** objetivo com restrições e critérios de sucesso.
- **Contrato:** compromisso delimitado com escopo e aceite.
- **Plano:** versão proposta de trabalho.
- **Tarefa:** unidade de trabalho com dependências e saída esperada.
- **Capacidade:** declaração validada de algo que uma entidade sabe executar.
- **Operação:** tentativa autorizada de produzir efeito.
- **Aprovação:** decisão vinculada a ação, versão, ambiente e escopo.
- **Evidência:** artefato ou registro que suporta uma conclusão.
- **Evento:** relato imutável ou corrigido por novo evento sobre mudança ocorrida.
- **Incidente:** falha ou risco que exige resposta, bloqueio ou revisão.

## 4. Estados lógicos

Estados abaixo são nomes conceituais; cada entidade terá uma máquina de estados específica e transições validadas.

### Necessidade
draft → submitted → validating → ready_for_planning → planned → in_progress → awaiting_acceptance → accepted

Alternativas: needs_information, blocked, rejected, cancelled, closed.

### Capacidade
draft → submitted → validating → testing → pending_approval → active

Alternativas: rejected, suspended, deprecated, retiring, retired.

### Solução
discovery → proposed → approved_for_development → developing → testing → review → pilot → promoted

Alternativas: blocked, rejected, temporary_active, suspended, rollback_pending, retired. O estado temporary_active exige escopo e expiração definidos.

### Operação
draft → validated → pending_approval → approved → queued → running → verifying → succeeded

Alternativas: rejected, blocked, failed, cancelled, partial, unknown, rollback_pending, rolled_back.

### Contrato
draft → under_review → approved → active → paused → completed

Alternativas: change_requested, blocked, terminated.

Não se deve usar texto livre como única fonte de estado. Estados finais e transições precisam ser definidos e testados por tipo de registro.

## 5. Evidência e afirmações

Toda afirmação operacional importante deve ter origem e grau de verificação. Exemplos:
- “pesquisa concluída” exige referências e registro do escopo consultado;
- “teste passou” exige resultado de teste vinculado à versão do artefato;
- “operação executada” exige confirmação do destino ou evidência equivalente;
- “entrega aceita” exige critério cumprido e registro de aceite;
- “capacidade ativa” exige versão, permissões, testes e aprovação aplicável.

Plano, intenção, mensagem enviada e resposta não confirmada não são equivalentes a sucesso.

## 6. Auditoria

Registrar, conforme aplicável:
- identificador do evento e da correlação;
- sistema e identidade de origem;
- ação, recurso e ambiente;
- versão do contrato e do plano;
- decisão de autorização e motivo;
- referência de aprovação;
- estado anterior e novo estado;
- resultado, erro e referências de evidência;
- horário e versão do componente envolvido.

Segredos e dados pessoais desnecessários não entram em logs. A política de retenção e eventual imutabilidade física dependem da tecnologia e dos requisitos aplicáveis.

## 7. Isolamento de clientes

- O tenant deve ser resolvido/validado no lado confiável.
- Cada consulta e operação verifica a autorização do tenant.
- Arquivos, caches, índices de pesquisa, logs e evidências seguem a mesma política de isolamento.
- IDs não previsíveis não substituem autorização.
- Acesso excepcional de suporte exige motivo, escopo, validade, aprovador e auditoria.
- Testes negativos tentam acessar dados de outro tenant e precisam falhar.

## 8. Consistência e concorrência

Quando dois processos tentarem alterar o mesmo registro:
- verificar versão/estado atual antes da transição;
- rejeitar atualização obsoleta ou conflitante;
- não sobrescrever decisão/aprovação mais recente;
- registrar o conflito e solicitar nova avaliação quando necessário;
- usar chave de idempotência para operações com efeitos.

## 9. Retenção, expiração e retirada

Dados e artefatos devem ter finalidade, proprietário e política de retenção definidos. Soluções temporárias, credenciais e acessos devem expirar ou ser revisados por condição explícita. Retirar uma capacidade não apaga o histórico necessário à auditoria, mas bloqueia novas operações e aciona plano de migração para dependentes.

## 10. Critério de aceite

Antes de escolher armazenamento para produção, validar propriedade de dados, isolamento, autorização, backup, restauração, retenção, concorrência, auditoria e remoção. Um protótipo local pode usar persistência simples para testes, mas não deve ser apresentado como armazenamento seguro de produção sem essa validação.
