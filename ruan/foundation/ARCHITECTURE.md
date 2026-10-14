# Ruan — arquitetura geral da plataforma pessoal

**Estado:** fundação isolada em feature/ruan-personal-foundation. Não substituir a interface oficial até validação.
**Objetivo:** evoluir para um sistema pessoal modular, com uma única fonte de dados por domínio e integrações seguras.

## Estrutura fixa

### Ruan — plataforma e central
- Única área que possui a gaveta global de aplicativos.
- Navegação global, captura rápida, busca pessoal e widgets.
- Mostra resumos autorizados sem copiar registros para outras áreas.
- Não exibe uma área ADM.

### Pessoal — gestão da vida
- Tarefas, rotinas, compras e lembretes.
- Financeiro manual, orçamento, reservas e investimentos registrados.
- Contas futuras, vencimentos e compromissos.
- Objetivos, projetos, notas, calendário, hábitos, documentos e bem-estar.
- Captura rápida e busca transversal para localizar ou encaminhar informações.

### Shadow
Aplicativo separado, sem gaveta global duplicada. Darknet será a base do navegador; DarkEye será a camada contextual/HUD para traduções, alertas, informações de projeto e confirmações. Veja shadow/ARCHITECTURE.md.

## Modelo de dados

O núcleo versionado mantém coleções separadas: tarefas, compras, lembretes, transações, ativos, orçamentos, objetivos, notas, eventos, projetos, calendário, hábitos, registros de rotina, documentos, bem-estar, capturas rápidas, contas futuras e preferências.

A migração de esquema acrescenta coleções ausentes sem descartar as coleções existentes. Busca e resumos são derivados dos registros; não viram uma segunda fonte de verdade. O núcleo inclui cálculos financeiros, recorrência, eventos limitados, validação de importação/exportação, resumo para widgets e busca local.

## Princípios

- **Uma informação, uma fonte:** cada domínio é dono dos seus registros.
- **Captura rápida:** ideias e pedidos podem ser encaminhados depois para o módulo certo.
- **Mobile-first:** interfaces claras e adaptáveis.
- **Privacidade por padrão:** apps não recebem todos os dados automaticamente.
- **Falha segura:** importações inválidas não substituem dados.
- **Transparência:** saldos e investimentos são manuais; sem conexão bancária real nesta fase.
- **Extensibilidade:** novos módulos devem declarar propriedade dos dados, ações e leituras.
- **Controle do usuário:** exportar, recuperar e apagar dados com clareza.

## Estado por domínio

| Domínio | Estado |
|---|---|
| Tarefas, compras, lembretes, financeiro | Protótipo de interface |
| Captura rápida e busca | Serviços locais de captura/encaminhamento e busca no núcleo; interface planejada |
| Contas e vencimentos | Modelo, validação de datas, criação e baixa de pagamento no serviço de domínio |
| Objetivos, projetos, calendário, hábitos | Serviços de progresso de objetivos, projetos/etapas, compromissos e registros de hábitos; interfaces planejadas |
| Documentos e bem-estar | Coleções e catálogo; interface planejada |
| Shadow/Darknet/DarkEye | Contratos de arquitetura; não funcionais ainda |
| Sincronização, autenticação e notificações de sistema | Não implementadas |

## Persistência e segurança

O protótipo atual usa armazenamento local do navegador, sem sincronização, autenticação ou proteção de cofre. O registro de permissões não oferece sozinho isolamento técnico. Não armazenar senhas, tokens, dados bancários de acesso ou documentos sensíveis até existir um modelo de segurança adequado.

## Marcos

1. Fundação de domínio e migração de esquema.
2. Interface de captura rápida, busca e contas futuras.
3. Interfaces dos módulos pessoais e calendário.
4. Backup com cópia prévia automática e recuperação testada.
5. Persistência segura e sincronização multiaparelho.
6. Notificações, integrações e permissões técnicas.
7. Integração gradual com a versão oficial após testes de regressão.

## Aceite

- Somente Ruan renderiza a gaveta global.
- Módulos não duplicam a fonte dos dados.
- A migração de esquema preserva os registros anteriores.
- Datas e vencimentos usam calendário local.
- Importação inválida não apaga dados.
- Recursos planejados não são apresentados como funcionais.
