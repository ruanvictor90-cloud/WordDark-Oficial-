# darkHub — estado de alinhamento geral

## Escopo desta etapa

O trabalho atual está restrito ao darkHub. Não iniciar a implementação do WordDark Hub, não alterar o aplicativo WordDark independente e não gerar APK sem solicitação explícita. O próximo produto só começa depois da revisão visual e da validação desta base.

## Camadas revisadas

1. **Interface e navegação:** início minimalista, identidade roxo/preto, logo central, saudação e busca; ações principais Criar e Painel; navegação inferior Apps e WordDark Hub; Shadow fica no menu para não competir com as ações principais.
2. **Criar e finalizar:** cadastro de aplicativos, workspace, edição de arquivos, snapshots, importação/exportação de projetos, validação estrutural, preparação de pacote e fila de alterações.
3. **Painel informativo:** catálogo, métricas, capacidades, tarefas, requerimentos e estado das conexões. Os formulários de escrita são movidos para Criar; listas e métricas permanecem no Painel.
4. **Runtime:** catálogo local, versões, alterações e releases locais. Uma release registrada não significa compilação, assinatura ou publicação.
5. **Orquestrador:** catálogo de capacidades, fila de tarefas, estados controlados e política de negar por padrão. Uma tarefa não é executada automaticamente.
6. **Shadow:** planejamento local, solicitações e aprovação humana; não há modelo de IA conectado, execução de código ou rede externa nesta implementação.
7. **Workspace:** arquivos locais por aplicativo, limites, snapshots, restauração e pacotes JSON. A validação é estrutural, não substitui compilação nem testes de execução.
8. **Rodovia:** transporte local no processo, rotas explícitas, envelopes validados, prevenção de duplicidade e trilha de eventos. Ainda não é mensageria remota ou sincronização entre dispositivos.
9. **Exportação de dados:** o pacote JSON reúne o estado exportável do runtime, orquestrador, Shadow, workspace e Rodovia. A restauração integral desse pacote ainda não está disponível na interface; a importação de projetos JSON permanece separada.
10. **PWA/cache:** versão do shell atualizada para incluir o módulo de exportação; o cache não é fonte de verdade para os dados do aplicativo.

## Limites importantes

- WordDark Hub continua sendo um módulo interno planejado do darkHub; não é o APK WordDark.
- Shadoweb continua um aplicativo independente e não será desenvolvido nesta etapa.
- Persistência é local ao perfil/dispositivo; não há sincronização remota, fila distribuída nem backup remoto.
- Rotas e endpoints executáveis não são recriados pela exportação. Credenciais nunca devem ser armazenadas no JavaScript do cliente.
- Não gerar APK durante esta revisão.

## Validação

- Testes automatizados de runtime, orquestrador, Shadow, workspace e Rodovia.
- Teste dedicado para o pacote de exportação local.
- CI e verificação de segurança devem passar no commit final desta revisão.
- Ainda é necessária revisão visual no aparelho/navegador para confirmar navegação, acessibilidade, teclado e persistência.

## Critérios para encerrar

- [ ] CI e verificação de segurança do commit final aprovados.
- [ ] Revisar o início, Criar, Painel, gaveta Apps, menu, notificações, Shadow e prévia de HTML.
- [ ] Confirmar que Painel é informativo e os formulários de escrita ficam em Criar.
- [ ] Confirmar limites da exportação e evitar afirmar que existe restauração integral.
- [ ] Não iniciar WordDark Hub nem gerar APK até nova solicitação.
