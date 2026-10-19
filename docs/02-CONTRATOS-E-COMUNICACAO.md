# 02 — Contratos e comunicação

**Status:** especificação inicial v1.0.

## 1. Regra

Nenhum app deve depender de acessar diretamente estruturas internas, armazenamento privado ou arquivos mutáveis de outro app. A integração ocorre por interfaces documentadas, com versão e permissões.

No início, os contratos podem ser executados localmente. APIs remotas, filas ou infraestrutura adicional só serão adotadas quando houver necessidade comprovada.

## 2. Envelope mínimo de mensagem

Toda solicitação entre sistemas deverá carregar, conforme aplicável:

- `message_id`: identificador único.
- `correlation_id`: identificador para rastrear uma operação completa.
- `schema_version`: versão do contrato.
- `source` e `destination`: identificadores de sistemas.
- `type`: nome estável da operação/evento.
- `created_at`: horário de criação em formato definido.
- `permission_scope`: permissão necessária.
- `payload`: dados mínimos exigidos para o caso de uso.
- `status`: estado conhecido da solicitação.

Não colocar senhas, tokens secretos ou dados pessoais desnecessários dentro de logs ou mensagens.

## 3. Estados padronizados

`draft → pending_approval → approved → running → succeeded`

Estados alternativos: `rejected`, `blocked`, `failed`, `cancelled`, `rolled_back`.

A transição deve ser validada. Uma solicitação não pode se declarar `succeeded` sem retorno verificável do sistema executor.

## 4. Eventos e comandos

- **Comando:** pede que um sistema execute uma operação específica.
- **Evento:** relata algo que já ocorreu ou mudou.
- **Consulta:** solicita informação sem alterar estado.
- **Resultado:** registra saída, evidência, falha ou motivo de bloqueio.

Eventos informam; comandos solicitam. Receber um evento não concede automaticamente permissão para executar um comando.

## 5. Idempotência e falhas

Operações que podem ser repetidas devem aceitar uma chave de idempotência ou mecanismo equivalente para evitar duplicações. Erros devem informar código, descrição segura, possibilidade de nova tentativa e identificador de rastreamento. Retentativas precisam ter limites.

## 6. Compatibilidade

Mudanças incompatíveis exigem nova versão de contrato e plano de migração. Sistemas devem rejeitar versões desconhecidas de forma segura e registrar o motivo, sem executar parcialmente uma operação perigosa.

## 7. Primeiro caminho de comunicação

1. Definir identificadores estáveis para cada sistema.
2. Definir schemas e validação.
3. Implementar registro local de solicitações e eventos.
4. Testar origem, destino, permissão, estado, repetição e falha.
5. Conectar um sistema por vez.
6. Só depois avaliar transporte remoto ou serviço centralizado.

## 8. Conectores externos

A Shadoweb pode pesquisar recursos e usar integrações disponíveis, mas cada conector precisa declarar: provedor, finalidade, autenticação exigida, permissões, dados acessados, limites, custos, modo de teste e comportamento em caso de erro. Sites sem API ou conector autorizado podem exigir operação manual. Nunca presumir acesso universal.
