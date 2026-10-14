# Ruan — aplicativo pessoal

Ruan é o aplicativo privado e independente de operação pessoal. Ele mantém os dados pessoais e serve como raiz de navegação para o Hub, que pertence ao Ruan e oferece a gestão superior do mundo WordDark.

## Estrutura atual

- `index.html`: Central pessoal.
- `app.css` / `app.js`: identidade visual, widgets e notificações locais.
- `engine/central-engine.js`: motor local usado pelos módulos pessoais.
- `apps/pessoal/`: app Pessoal, com Financeiro e Tarefas.
- `apps/shadow/`: app Shadow.
- `apps/shadow/darkeye/`: protótipo de interface do navegador DarkEye.
- O Hub fica em `hub/` por conveniência de estrutura e publicação, mas sua função é o painel de gestão pertencente ao Ruan. Essa separação de pastas não transforma o Hub em um setor do WordDark.

## Fronteira estrutural

- A Central Ruan é a única tela que possui a gaveta global de aplicativos.
- Cada aplicativo mantém sua navegação interna própria, sem duplicar a gaveta global.
- Rotas, scripts, estilos e ícones do aplicativo pessoal permanecem dentro de `ruan/`, salvo o atalho explícito para o Hub.
- O WordDark não administra Ruan nem recebe seus dados automaticamente.
- A Área ADM não faz parte da interface atual.
- A estrutura continua local ao dispositivo nesta fase, sem autenticação ou sincronização entre aparelhos.

## Motor central

O motor oferece operações locais para tarefas, entradas, saídas e contas a pagar. Os widgets leem o estado usado pelos módulos pessoais. Os dados ficam no armazenamento do navegador/dispositivo e não sincronizam entre aparelhos nesta versão.

## Testes

```bash
node ruan/engine/central-engine.test.js
node ruan/apps/shadow/darkeye/darkeye-core.test.js
node ruan/app.test.js
node ruan/structure-boundary.test.js
```

## Limites atuais

- Não há autenticação nem sincronização; a premissa atual é uso privado e individual no dispositivo.
- Os registros financeiros são anotações pessoais, não movimentam dinheiro e não conectam a bancos.
- DarkEye é experimental; sites podem bloquear a prévia em iframe e links podem abrir no navegador externo.
- O modo Privado do DarkEye evita gravar novas entradas no histórico local; não torna a navegação anônima na internet.
