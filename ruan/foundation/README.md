# Ruan — Fundação pessoal

**Branch:** feature/ruan-personal-foundation  
**Status:** protótipo isolado; não integrado à interface oficial.

Ruan é a plataforma pessoal; Pessoal organiza a vida diária; Shadow é independente. Darknet será a base do navegador e DarkEye será a camada contextual/HUD sobreposta.

## Núcleo incluído

- Esquema de dados versão 3 com migração não destrutiva de coleções ausentes.
- Tarefas, compras, lembretes, financeiro, ativos, orçamentos, objetivos, notas e eventos.
- Estruturas para projetos, calendário, hábitos, rotina, documentos, bem-estar, capturas rápidas, contas futuras e preferências.
- Serviços de domínio para contas futuras, baixa de pagamento, progresso de objetivos, captura rápida e encaminhamento local, conclusão de tarefas recorrentes.
- Cálculos financeiros, vencimentos atrasados, resumos de widgets, busca local, recorrência e backup JSON com rejeição de esquemas futuros e datas inválidas.
- Catálogo de módulos e contratos declarativos de escopo.
- Arquitetura de Shadow/Darknet/DarkEye.

## Testes

O workflow dedicado executa os testes do núcleo, registro pessoal, registro da plataforma e registro Shadow. A existência do workflow não significa que passou; conferir uma execução real no GitHub Actions.

## Limites

A interface atual salva localmente no navegador. Não há autenticação, sincronização, notificação em segundo plano, conexão bancária, navegador Darknet funcional, overlay DarkEye ou IA do Shadow. Os registros de permissões são contratos de arquitetura, não barreiras de segurança reais.

Não inserir credenciais, senhas, tokens, dados bancários de acesso ou documentos sensíveis no protótipo.
