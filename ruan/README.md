# Ruan — Central de Operação

Ruan é o aplicativo privado de operação pessoal, inicialmente pensado para um único usuário. A tela principal contém somente widgets informativos e a gaveta de aplicativos. **A Área ADM foi retirada da estrutura atual.**

## Estrutura atual

- `index.html`: Central de Operação.
- `app.css` / `app.js`: identidade visual atual, widgets, notificações locais e gaveta de aplicativos.
- `engine/central-engine.js`: adaptador compartilhado pelos widgets e módulos pessoais.
- `engine/personal-core.js`: regras de dados, cálculos, busca, resumo diário, recorrência e backup.
- `engine/personal-store.js`: armazenamento único para tarefas, compras, lembretes, finanças, metas, projetos, calendário, hábitos, notas e documentos; migra os registros legados de tarefas e financeiro sem descartar os dados existentes.
- `apps/pessoal/`: app Pessoal com os módulos Financeiro e Tarefas.
- `apps/shadow/`: app Shadow.
- `apps/shadow/darkeye/`: protótipo de interface para o navegador DarkEye.

## Fronteira estrutural\n\n- A Central Ruan é a única tela que possui a gaveta global de aplicativos.\n- Cada aplicativo mantém sua navegação interna própria, sem duplicar a gaveta global.\n- Rotas, scripts, estilos e ícones locais devem permanecer dentro de `ruan/`; o runtime não importa módulos de outros projetos.\n- A estrutura continua local ao dispositivo nesta fase, sem autenticação ou sincronização entre aparelhos.\n\n## Motor central

O motor central oferece uma base de dados pessoal única para os módulos existentes e futuros. Os registros são locais no dispositivo, com histórico de alterações, resumos para widgets, busca local e exportação/importação de backup JSON. A migração mantém compatibilidade com as chaves antigas de tarefas e financeiro. Os dados não sincronizam entre aparelhos nesta versão; não há autenticação, conexão bancária nem notificações garantidas em segundo plano.

## Testes

```bash
node ruan/engine/personal-core.test.js
node ruan/engine/personal-store.test.js
node ruan/engine/central-engine.test.js
node ruan/apps/shadow/darkeye/darkeye-core.test.js
node ruan/app.test.js
```

## Limites atuais

- Não há autenticação nem sincronização; a premissa atual é uso privado e individual no dispositivo.
- Os registros financeiros são anotações, não movimentam dinheiro e não conectam a bancos.
- DarkEye tem uma interface experimental e tenta mostrar uma prévia em iframe. Alguns sites bloqueiam incorporação. Não é ainda um motor de navegador nativo; links podem ser abertos no navegador externo.
- O modo Privado do DarkEye evita gravar novas entradas de histórico local; não torna a navegação anônima na internet.
