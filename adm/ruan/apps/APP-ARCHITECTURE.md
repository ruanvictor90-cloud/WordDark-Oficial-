# Arquitetura padrão dos aplicativos do Ruan

Todo aplicativo novo criado dentro de `adm/ruan/apps/` deve partir de `_template/` e manter a mesma experiência-base.

## Contrato visual e funcional
1. **Cabeçalho:** identidade do aplicativo, retorno à central superior quando apropriado e sino de notificações.
2. **Central de notificações:** o sino mostra a quantidade de alertas e abre uma lista que leva diretamente ao setor relacionado. O componente visual é padrão em todos os apps; a origem de dados deve ser ligada por um adaptador explícito.
3. **Widget(s) de informação:** resumo curto e útil, sem transformar a página inicial num painel poluído.
4. **Central de apps/setores:** a tela inicial lista módulos/setores como cartões. Cada cartão abre uma área independente.
5. **Setores independentes:** cada setor pode evoluir sem obrigar o usuário a percorrer um fluxo completo.
6. **Arquivos próprios:** cada app tem HTML, CSS, JavaScript, manifesto e documentação próprios; compartilhar estilos/utilitários é permitido, acoplamento de dados não é presumido.
7. **Dados e permissões:** armazenamento local por padrão; conexões externas, sincronização e permissões devem ser declaradas e aprovadas, nunca presumidas.
8. **Instalação:** o manifesto e o service worker preparam a versão web instalável. Isso não significa que o app já seja um APK Android ou aplicativo nativo iOS.

## Notificações
O sino visual é comum, mas a origem de cada alerta deve ser explícita. Nesta fase, Ruan, Pessoal e Shadow consultam localmente tarefas e contas do Pessoal na mesma origem. Não existem notificações push do sistema nem execução em segundo plano garantida.

## Limites de segurança
- Um app não recebe acesso à raiz do Ruan por existir na central.
- Shadow é somente uma base visual nesta etapa; nenhuma IA ou credencial foi conectada.
- A separação por pastas não é, sozinha, uma sandbox de segurança. Isolamento real e autorização no servidor precisam ser implementados antes de executar código de terceiros.

## Como criar um app novo
1. Copie os arquivos de `_template/` para uma nova pasta com nome próprio.
2. Mantenha o cabeçalho, sino, widgets e central de setores.
3. Troque os cartões de exemplo pelos setores que o app realmente terá.
4. Implemente as funções apenas dentro dos setores necessários.
5. Conecte os alertas com um adaptador declarado e adicione testes.
6. Registre o novo app na central do Ruan após validar seus links e permissões.