# Ruan — Central de Operação

Ruan é o aplicativo privado de operação pessoal, inicialmente pensado para um único usuário. A tela principal contém somente widgets informativos e a gaveta de aplicativos. **A Área ADM foi retirada da estrutura atual.**

## Estrutura atual

- `index.html`: Central de Operação.
- `app.css` / `app.js`: identidade visual atual, widgets, notificações locais e gaveta de aplicativos.
- `engine/central-engine.js`: motor compartilhado por widgets, Financeiro e Tarefas.
- `apps/pessoal/`: app Pessoal com os módulos Financeiro e Tarefas.
- `apps/shadow/`: app Shadow.
- `apps/shadow/darkeye/`: protótipo de interface para o navegador DarkEye.

## Motor central

O motor oferece operações locais para tarefas, entradas, saídas e contas a pagar. Os widgets leem o mesmo estado usado pelos módulos pessoais. Os dados ficam no armazenamento do navegador/dispositivo e não sincronizam entre aparelhos nesta versão.

## Testes

```bash
node ruan/engine/central-engine.test.js
node ruan/apps/shadow/darkeye/darkeye-core.test.js
node ruan/app.test.js
```

## Limites atuais

- Não há autenticação nem sincronização; a premissa atual é uso privado e individual no dispositivo.
- Os registros financeiros são anotações, não movimentam dinheiro e não conectam a bancos.
- DarkEye tem uma interface experimental e tenta mostrar uma prévia em iframe. Alguns sites bloqueiam incorporação. Não é ainda um motor de navegador nativo; links podem ser abertos no navegador externo.
- O modo Privado do DarkEye evita gravar novas entradas de histórico local; não torna a navegação anônima na internet.
