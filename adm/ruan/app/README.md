# Ruan — Núcleo pessoal

Página inicial mobile-first da Área ADM/Ruan. A tela inicial foi reduzida ao essencial: alertas e acesso ao aplicativo independente Organize.

## Abrir
Publicação web: `/adm/ruan/app/`
Organize: `/adm/ruan/apps/organize/`

## O que funciona nesta etapa
- Painel inicial limpo e adaptado para celular.
- Widget de alertas que lê tarefas urgentes e tarefas com prazo de hoje/atrasado no armazenamento local compartilhado com Organize.
- Link para abrir Organize como um módulo separado, com seus próprios arquivos HTML, CSS, JavaScript e manifesto PWA.
- O app Organize terá um lançador de setores e quadro de tarefas no estilo kanban.

## Limites
- Dados guardados no armazenamento local do navegador deste dispositivo e desta origem.
- Os widgets atualizam ao abrir/voltar para a página e quando outra aba atualiza o armazenamento. Não são notificações push do sistema.
- A arquitetura de instalação e isolamento está preservada como direção, mas não implementada aqui: ainda não há APK/iOS, login, sincronização ou sandbox de execução.
- Ruan não expõe endpoint de entrada nem permite que WordDark administre a raiz pessoal. Nenhuma conexão externa está ativa.