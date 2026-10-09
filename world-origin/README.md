# WORLD DARK — Origem 01

Nova linha de desenvolvimento para o WORLD DARK, isolada da versão publicada na branch `world-origin-v1`.

## Protótipo disponível

- `world-origin/index.html`: painel responsivo e interativo.
- Fila de operações com estados e detalhes por tarefa.
- Registro de histórico por tarefa e eventos globais.
- Cadastro de planos com frequência, objetivo, setor, limite e versão.
- Pausar/ativar planos; novos planos começam pausados por segurança.
- Visão financeira conceitual separando orçamento, compromissos e gasto realizado.
- Páginas de setores e regras de segurança.

## Limites atuais

Este é um protótipo de interface executado no navegador. Os dados são mantidos apenas em memória e desaparecem ao recarregar a página. Ainda não existe banco de dados, autenticação, execução em segundo plano, agendador real, integração financeira, publicação em redes sociais ou conexão externa. Os números demonstrativos não representam operações reais.

## Arquitetura-alvo

1. **Planos**: definição versionada de intenção, frequência, janela, orçamento, critérios e permissões.
2. **Scheduler**: cria uma ocorrência única por plano e período; tolera reinícios e impede duplicidades.
3. **Fila**: tarefas com estados explícitos, dependências, tentativas e bloqueios.
4. **Executores modulares**: cada etapa tem entradas/saídas e pode ser repetida isoladamente quando seguro.
5. **Histórico append-only**: eventos imutáveis com ator, horário, versão, motivo e resultado.
6. **Financeiro**: separa previsão, compromisso, despesa incorrida e liquidação; não presume pagamento.
7. **Governança**: autorização mínima, limites de recursos, aprovação humana para ações externas e separação da área administrativa superior.

## Estados iniciais

- `queued`: criada e aguardando recursos/execução.
- `running`: executando.
- `blocked`: não pode prosseguir; exige condição ou correção.
- `review`: aguarda aprovação ou decisão.
- `done`: concluída e validada.
- `failed`: falha terminal após política de tentativas.
- `cancelled`: cancelada por ator autorizado.

Mudanças de estado devem passar por validação; o histórico não pode ser sobrescrito.

## Próxima etapa

Construir o motor de domínio e persistência antes de ligar automações externas: modelo de dados, transições de estado, identificadores idempotentes, registro de eventos e testes de recuperação.
