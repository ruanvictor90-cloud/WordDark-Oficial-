# Contrato de identidade mínima e caixa de diálogo de requisitos

Este contrato foi autorizado para novas categorias/apps em 14/10/2026. **Não autoriza construir a interface funcional.** As interfaces existentes devem ser preservadas.

## Identidade padrão permitida

Uma nova área pode receber somente:
- cabeçalho consistente com a identidade visual atual do sistema proprietário;
- logo/identificador e nome do app/categoria;
- botão de retorno com navegação funcional;
- indicação discreta do sistema/setor proprietário, quando útil;
- área de conteúdo vazia ou marcador neutro;
- caixa de diálogo/modal informativa com requisitos da futura interface.

Não adicionar nesta etapa painéis, métricas, formulários de operação, listas funcionais, filtros, gráficos, botões de execução, fluxos comerciais ou integrações visuais inventadas. Não copiar um layout antigo só para preencher espaço.

## Caixa de diálogo obrigatória

Título: **“O que esta interface precisa ter?”**

A caixa deve explicar, em linguagem clara:
1. **Finalidade do app:** o que resolve e para quem.
2. **Informações de entrada:** quais dados a pessoa fornecerá e quais são opcionais/obrigatórios.
3. **Informações de saída:** o que será devolvido, em que formato e com quais estados.
4. **Ações possíveis:** o que a pessoa poderá fazer; diferenciar leitura, preparação, aprovação e ação externa.
5. **Permissões e segurança:** quem pode acessar, aprovar, alterar ou executar; dados/segredos que nunca devem aparecer.
6. **Estados e falhas:** carregando, vazio, rascunho, aguardando revisão/aprovação, em execução, concluído, erro, cancelado e resultado incerto quando aplicável.
7. **Fontes e integrações:** indicar o que já existe, o que está simulado e o que depende de backend/API.
8. **Histórico e confirmação:** quais eventos precisam ser rastreados e quais ações exigem confirmação.
9. **Preferências de design pendentes:** pedir ao usuário para decidir disposição, densidade, navegação, componentes e comportamento visual antes de implementar a tela funcional.

A caixa é uma especificação de trabalho, não um mecanismo de autorização. Ela não deve declarar que uma integração está ativa quando ela está apenas planejada.

## Modelo de requisitos por app

- **App/categoria:** nome canônico.
- **Responsável e setor:** quem é dono da responsabilidade.
- **Objetivo:** problema que resolve.
- **Entradas:** dados e validações.
- **Saídas:** artefatos, resultados e estados.
- **Ações:** leitura, preparação, aprovação ou execução externa.
- **Permissões:** papéis/capacidades e aprovações.
- **Dependências:** serviços, backend, provedores e persistência.
- **Dados sensíveis:** campos proibidos no frontend/log.
- **Erros e recuperação:** repetição segura, cancelamento, reconciliação.
- **Critérios de aceite:** testes que comprovam o comportamento.
- **Decisões visuais em aberto:** a definir pelo usuário.

## Regra de implementação

Criar primeiro a identidade mínima e a caixa de diálogo de requisitos. A interface operacional só será construída depois que o usuário definir como deseja que ela seja e os contratos necessários estiverem estáveis. Toda ação real deve continuar governada pelo backend do WordDark, nunca pela caixa de diálogo ou pela interface.
