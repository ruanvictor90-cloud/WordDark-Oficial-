# Ruan — desenvolvimento isolado

**Branch de trabalho:** `feature/ruan-independent-core-20261015`  
**Base inicial:** `staging`  
**Objetivo:** evoluir o Ruan como sistema pessoal independente antes de propor qualquer integração ao conjunto principal.

## Limites preservados

- Ruan continua dono dos próprios dados e da navegação pessoal.
- WordDark não administra Ruan e não recebe seus dados automaticamente.
- O Hub continua sendo um atalho explícito e uma fronteira separada; não é incorporado ao núcleo pessoal.
- Não criar Área ADM nem duplicar a gaveta global dentro dos aplicativos.
- Esta etapa é de código e contratos; mudanças visuais ficam para uma fase posterior.
- Nenhuma alteração desta branch é publicada na `main` automaticamente.

## Primeiro ajuste técnico

A central de notificações agora restringe destinos a páginas HTML internas do Ruan, rejeita destinos externos ou esquemas executáveis e corrige caminhos antigos para Tarefas e Financeiro. Isso evita que um valor gravado no armazenamento local seja usado diretamente como destino arbitrário e corrige links de notificação que apontavam para arquivos inexistentes na raiz.

## Próximas frentes de revisão

1. **Núcleo pessoal:** validar datas reais, centavos, estados financeiros e tratamento de armazenamento inválido/indisponível.
2. **Fronteiras:** testar que apps pessoais não importem módulos do WordDark/Darknet e que o Hub só apareça como entrada explícita.
3. **Persistência:** documentar claramente o que é local, o que pode ser apagado pelo navegador e o que não sincroniza.
4. **PWA/offline:** revisar cache, atualizações e fallback sem alterar a interface.
5. **Contratos de integração futura:** definir um envelope de pedido mínimo, sem conectar ainda Ruan a um backend ou dar acesso de escrita a sistemas externos.

## Testes desta etapa

Executar no ambiente do repositório:

```bash
node ruan/engine/notifications.test.js
node ruan/engine/central-engine.test.js
node ruan/engine/ruan-central.test.js
node ruan/apps/shadow/darkeye/darkeye-core.test.js
node ruan/app.test.js
node ruan/structure-boundary.test.js
```

A conclusão de testes locais não comprova autenticação, sincronização entre dispositivos, backup ou segurança de backend; esses recursos ainda exigem implementação própria.
