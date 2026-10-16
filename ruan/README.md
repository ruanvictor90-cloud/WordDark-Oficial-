# Ruan — Central de Operação

Ruan é o aplicativo privado de operação pessoal, inicialmente pensado para um único usuário. A tela principal contém saudação rotativa, quatro atalhos de aplicativos, dois widgets de resumo (saldo registrado e tarefas em aberto), notificações discretas e uma gaveta global de aplicativos acessível somente pela central. A gaveta global permanece fora desta versão da interface. **A Área ADM foi retirada da estrutura atual.**

## Estrutura atual

- `index.html`: central do Ruan, com atalhos de aplicativos, widgets de saldo/tarefas e notificações locais.
- `app.css` / `app.js`: identidade visual, saudação rotativa, gaveta global da central, atualização dos widgets, notificações e registro do service worker.
- `engine/central-engine.js`: adaptador entre as telas e os dados pessoais.
- `engine/personal-core.js`: regras de dados, cálculos, busca, resumos, recorrência e contrato de backup.
- `engine/personal-store.js`: armazenamento pessoal local, migração das chaves antigas e validação de registros.
- `apps/pessoal/`: área pessoal com Financeiro, Tarefas e Vida (organização, registros e backup).
- `apps/shadow/`: aplicativo Shadow.
- `apps/shadow/darkeye/`: protótipo de interface de navegação.
- `apps/entretenimento/`: catálogo experimental de entretenimento.
- `../hub/`: destino do atalho explícito para o Hub; o runtime do Hub não é importado pelo Ruan.

## Fronteira estrutural

- A central do Ruan é o único lugar permitido para a gaveta global de aplicativos; telas internas não devem duplicar essa navegação.
- Rotas, scripts e estilos internos devem permanecer dentro de `ruan/`, exceto o atalho explícito para `../hub/index.html`.
- Os dados pessoais permanecem no armazenamento local deste navegador/dispositivo. Não existe sincronização entre aparelhos nesta versão.
- O widget financeiro soma entradas e saídas registradas localmente. Não representa saldo bancário nem movimenta dinheiro real.
- As notificações mostradas na central são lembretes locais derivados de registros do app; não são notificações garantidas em segundo plano.

## Motor central

O motor central oferece uma base de dados pessoal única para os módulos existentes e futuros. Os registros são locais no dispositivo, com histórico de alterações, resumos para widgets, busca local e exportação/importação de backup JSON. A migração mantém compatibilidade com as chaves antigas de tarefas e financeiro. Os dados não sincronizam entre aparelhos nesta versão; não há autenticação, conexão bancária nem notificações garantidas em segundo plano.

## Testes

Execute a partir da raiz do repositório, com Node.js instalado:

```bash
node ruan/apps/pessoal/vida.test.js
node ruan/engine/personal-core.test.js
node ruan/engine/personal-store.test.js
node ruan/engine/sovereign-core.test.js
node ruan/engine/ruan-central.test.js
node ruan/engine/central-engine.test.js
node ruan/apps/shadow/darkeye/darkeye-core.test.js
node ruan/app.test.js
node ruan/structure-boundary.test.js
node ruan/engine/darknet-client.test.js
```

A workflow `.github/workflows/ruan-validation.yml` executa essa mesma bateria para a branch de finalização. O resultado deve ser conferido no GitHub Actions antes de considerar a validação concluída.

## Limites atuais

- Não há autenticação nem sincronização; a premissa atual é uso privado e individual no dispositivo.
- Os registros financeiros são anotações, não movimentam dinheiro e não conectam a bancos.
- DarkEye tem uma interface experimental e tenta mostrar uma prévia em iframe. Alguns sites bloqueiam incorporação. Não é ainda um motor de navegador nativo; links podem ser abertos no navegador externo.
- O modo Privado do DarkEye evita gravar novas entradas de histórico local; não torna a navegação anônima na internet.
