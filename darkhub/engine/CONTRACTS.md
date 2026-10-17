# darkHub — contratos e plano de coordenação

## Papel do Hub
darkHub é o plano de controle do ecossistema: registra apps e módulos, mantém seus metadados e versões, organiza a fila de trabalho, cataloga capacidades, acompanha eventos e controla o estado de conectores. É o ponto de coordenação e inventário, não um processo mágico capaz de executar qualquer código por nome.

## Componentes
- `runtime.js`: catálogo local de apps, alterações, releases e conexões futuras.
- `orchestrator.js`: registro de capacidades, fila de tarefas, transições de estado, mensagens e indicadores.
- `app.js`: interface; deve chamar os motores em vez de duplicar regras de negócio.
- `runtime.test.js` e `orchestrator.test.js`: testes automatizados.
- `manifest.webmanifest` e `sw.js`: shell instalável/cache local.
- `capacitor.config.json`: configuração inicial do wrapper Android.

## Manifesto mínimo de uma capacidade
Cada capacidade precisa de `appId`, ID técnico estável, nome, descrição, versão, esquema de entrada/saída e classificação de permissão. A capacidade só pode ser registrada para um app existente. Capacidade externa exige aprovação explícita antes de ser habilitada.

## Tarefas e execução
Estados aceitos: queued → assigned → running → done; assigned/running podem virar blocked ou cancelled; blocked pode voltar a queued ou ser cancelled. Transições ilegais são recusadas. Registrar uma tarefa ou marcá-la como concluída não executa trabalho externo automaticamente. Um executor futuro deve ser explicitamente registrado, autorizado, limitado por timeout e testado.

## Mensageria e informações
O barramento atual é um registro local de eventos/mensagens para acompanhamento dentro do perfil/dispositivo. Não é mensageria de rede nem sincronização entre aparelhos. Conectores futuros precisam de protocolo autenticado, esquema versionado, autorização por escopo, idempotência, limites de taxa e logs sem segredos.

## Regra WordDark
WordDark Hub é um módulo interno do darkHub. O futuro APK WordDark é separado. Nenhum endpoint, token, sessão ou canal remoto é considerado existente até ser implementado e testado de ponta a ponta.

## Segurança por padrão
- Negar capacidades não registradas.
- Não executar código recebido de plugin ou servidor.
- Não embutir segredos no APK.
- Pedir autorização explícita para capacidades externas.
- Registrar estado e eventos sem gravar tokens ou dados sensíveis nos logs.
- Tratar o backup JSON como dado privado.
- Distinguir sempre “planejado”, “registrado”, “habilitado”, “testado” e “publicado”.

## Próximos incrementos
1. Integrar indicadores e fila na UI do darkHub.
2. Definir manifestos de Shadoweb e WordDark Hub.
3. Adicionar armazenamento e migração de esquema testados.
4. Empacotar em Android, instalar e testar em aparelho.
5. Implementar backend/conectores somente quando os apps locais estiverem estabilizados.
