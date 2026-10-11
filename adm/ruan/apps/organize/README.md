# Organize — app independente do Ruan

O Organize é um módulo separado do painel central do Ruan. Possui HTML, CSS, JavaScript, manifesto PWA e cache próprios, como primeira etapa da estrutura de aplicativos independentes.

## Funcionalidades desta versão
- Tela inicial com janela de setores: Entrada, Projetos, Rotina e Ideias.
- Quadro Kanban por setor com A fazer, Em andamento e Concluído.
- Cartões com título, detalhes, prioridade e prazo.
- Alertas para tarefas urgentes, com prazo hoje ou atrasado.
- Contadores de cartões por setor.
- Armazenamento local compartilhado com o painel Ruan pela chave `ruan.organize.v1`, na mesma origem do site.

## Limites atuais
- É uma aplicação web independente, não um APK nem um pacote nativo Android/iOS.
- Dados permanecem no navegador/dispositivo; não há sincronização entre aparelhos.
- O painel Ruan lê os alertas do mesmo armazenamento local, mas notificações de sistema/push ainda não estão implementadas.
- A arquitetura de instalação, permissões e isolamento é mantida como direção futura, sem ser implementada nesta etapa.
- Não há conexão ativa com WordDark.