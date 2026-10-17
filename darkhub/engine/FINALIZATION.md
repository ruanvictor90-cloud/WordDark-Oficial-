# darkHub — estado de finalização da estrutura

## Papel do darkHub
O darkHub é a central independente para catalogar aplicativos, organizar alterações, preparar versões e acompanhar o ecossistema. O funcionamento básico de cada APK deve continuar independente do darkHub.

## Camadas

1. **Interface central** — tela inicial com gaveta dos apps, ação Criar, ação Painel e resumo informativo.
2. **Runtime do catálogo** — registro de apps/módulos, versão, estado, alterações, releases e exportação/importação local.
3. **Orquestrador** — catálogo de capacidades, fila de tarefas, transições explícitas e eventos locais.
4. **Contrato de ecossistema** — esquema versionado para manifestos e envelopes de mensagens.
5. **Empacotamento Android** — Capacitor e GitHub Actions para gerar APK de debug.
6. **Conectores futuros** — transporte, autenticação, autorização e sincronização; não são considerados ativos até existirem e serem testados.

## Limites que não podem ser confundidos

- **WordDark Hub** é um módulo interno do darkHub; não é o APK WordDark.
- O **APK WordDark** será independente e poderá conectar-se futuramente ao módulo WordDark Hub por contrato, autenticação, escopos de permissão e sincronização explícita.
- **Shadoweb** é um app independente e prioridade atual. A navegação básica não pode depender do darkHub.
- Registrar uma tarefa não executa código de outro APK. Registrar uma capacidade não significa que exista um executor.
- Estado local no navegador/WebView não é sincronização entre dispositivos nem backup remoto.
- APK de debug não é release de produção assinado.

## Resultado de compilação verificado

- Workflow: `darkHub Android APK`
- Run: [39013193879](https://github.com/ruanvictor90-cloud/WordDark-Oficial-/actions/runs/39013193879)
- Resultado: **success**
- Artefato: `darkhub-debug-apk` (ZIP contendo `app-debug.apk`)
- SHA-256 do ZIP: `e73b659d784204cbea65e3d8a587bf2c3e5b660680f7f317864cb52dab52321b`
- Artefato temporário do Actions: expira em 7 dias; guardar uma cópia local antes do vencimento.

## Checklist antes de considerar a etapa pronta para uso

- [x] Runtime e orquestrador com testes automatizados.
- [x] Política padrão de negar capacidades externas sem aprovação explícita.
- [x] Contrato versionado de manifestos e mensagens.
- [x] Build de APK Android debug concluído no GitHub Actions.
- [ ] Instalar no Android real e validar abertura, navegação, teclado, retorno e rotação.
- [ ] Validar persistência depois de fechar e reabrir o app; testar exportação e importação de backup.
- [ ] Conferir experiência mobile e acessibilidade de todos os fluxos.
- [ ] Implementar comunicação real somente quando houver contrato, transporte, autenticação, autorização e testes ponta a ponta.
- [ ] Preparar assinatura de release separadamente; nunca embutir chaves no repositório.

## Próxima ordem de trabalho

1. Validar o APK no dispositivo Android e corrigir apenas falhas reproduzíveis.
2. Fechar a separação entre **Criar** (ações de escrita) e **Painel** (visão informativa), sem espalhar controles de cadastro pelo painel.
3. Fortalecer testes de persistência, importação e exportação.
4. Seguir com Shadoweb como app independente.
5. Só depois desenhar e testar conectores reais entre APKs.