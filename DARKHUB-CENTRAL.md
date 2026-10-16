# darkHub — central independente

O darkHub é a central de criação e distribuição de aplicativos. Ele permanece independente do WordDark Hub.

## Responsabilidades
- Registrar e acompanhar projetos e seus estados.
- Receber informações de outros apps na caixa de entrada local.
- Exportar/importar os recebimentos em JSON.
- Preparar builds Android e disponibilizar APKs como artefatos do GitHub Actions.
- Manter o Painel como ponto de acompanhamento, sem inventar aplicativos ou widgets que ainda não existem.

## Recebimento entre apps
O contrato de dados é darkhub-information-v1. Os campos aceitos são sender, category, title, message, sourceId e, opcionalmente, id, receivedAt e read.

Apps hospedados no mesmo domínio podem importar o módulo publicado em /WordDark-Oficial-/darkhub/engine/information-inbox.js e chamar:

```js
import { createInformationInbox } from "/WordDark-Oficial-/darkhub/engine/information-inbox.js";
const inbox = createInformationInbox();
inbox.receiveInformation({
  sender: "Pessoal",
  category: "Alerta",
  title: "Conta vence hoje",
  message: "Conferir pagamento",
  sourceId: "bill-123"
});
```

A caixa de entrada usa localStorage, compartilhado entre caminhos da mesma origem no mesmo navegador/perfil. Isso é comunicação local entre apps, não um servidor: não sincroniza entre aparelhos, navegadores ou usuários. Para sincronização remota será necessária uma API/backend autenticado. Não coloque segredos ou dados sensíveis nesse armazenamento local.

## Gerar APK
A workflow .github/workflows/darkhub-apk.yml pode ser iniciada manualmente em GitHub Actions. Informe:
- source_path: pasta do app que contém index.html (padrão ruan).
- app_name: nome no Android.
- app_id: identificador Android único.

A build inicial gera um APK debug instalável como artefato por 14 dias. Ele não é uma release assinada para distribuição pública. Assinatura de release e publicação na Play Store são etapas posteriores que exigem configuração segura de assinatura.
