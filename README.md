# WordDark Oficial — versão consolidada em construção

Este repositório contém a versão atual dos aplicativos **Ruan**, **WordDark Hub** e **WordDark**, além dos motores e setores que serão conectados progressivamente.

## Regra principal desta versão

**Manter o aplicativo simples e os setores brutos; não integrar módulos antigos só porque eles já existem no repositório.**

A interface atual é a fonte do que está exposto nesta versão. Os motores e módulos detalhados são reutilizáveis, mas só entram no fluxo ativo quando forem conectados e testados explicitamente.

## Aplicativos atuais

### Ruan — privado e independente
- Central pessoal com gaveta global de aplicativos.
- Pessoal: Financeiro e Tarefas.
- Shadow: área separada, com protótipo DarkEye.
- WordDark Hub: entrada para o ambiente WordDark.
- Ruan não faz parte do mundo interno do WordDark. Não há compartilhamento automático de dados nem autoridade do WordDark sobre Ruan.

### WordDark Hub
- Central do Hub: Pedidos e Em execução.
- Teste: entrada compacta para testar o mundo ou setores.
- CreationDark: oficina de preparação, inventário operacional e triagem de itens ainda sem destino consolidado; não publica nem ativa código automaticamente.
- WordDark: entrada para o aplicativo principal do mundo.

### WordDark — mundo operacional
- **WordDark:** coordenação, gerenciamento e infraestrutura.
- **Céu:** Dark Factory e Central Social.
- **Terra:** Empresa social e Empresa comercial.
- Aplicativos centrais visíveis nesta versão: Central, Darkbank, Central de conexão, Automação, Biblioteca, Escola do Mundo, Governança, Segurança e Teste.
- Dark Factory mantém as entradas Em criação e Biblioteca, com categorias de mídia.
- Central Social mantém Gestor de redes sociais, Gestor de marketing digital e Gestor de projetos.
- Darkbank mantém Financeiro, Cofre e Investimentos. Os fundos do Cofre pertencem ao WordDark; não existe uma área financeira do Ruan dentro dele.

SucoCast, SucoGeek, SucoComed e SucoFactor são perfis externos de canais de teste/operação, não setores internos nem a raiz da arquitetura.

## Fonte canônica do runtime

- Core: `worddark/runtime/world/core/`
- Céu: `worddark/runtime/world/sky/`
- Terra: `worddark/runtime/world/earth/`
- Interface WordDark: `worddark/app/`
- Hub: `hub/`
- Ruan: `ruan/`

O Core coordena contratos e operações; Céu e Terra mantêm responsabilidades próprias. A interface e os motores ainda não devem ser considerados totalmente integrados apenas porque coexistem no repositório.

## CreationDark — preparação antes da integração

- A tela fica em `hub/creationdark.html` e segue a identidade visual atual do Hub.
- O inventário inicial organiza módulos, regras, motores, conectores e testes; os registros do navegador são locais e não sincronizam entre dispositivos.
- Itens sem destino consolidado ficam na triagem do CreationDark. Itens com destino conhecido continuam associados ao setor/app indicado, sem reintroduzir interfaces antigas.
- A catalogação não equivale à integração: nenhuma entrada executa, publica, move ou ativa código. A promoção exige auditoria, testes, revisão e autorização.

## Código legado e módulos futuros

- `worddark/core-central/` é uma implementação anterior e está fora do caminho ativo e da suíte padrão de testes.
- Outras implementações detalhadas podem permanecer no repositório para reaproveitamento, mas não devem ser conectadas automaticamente à versão atual.
- Nenhum código legado deve criar um segundo Core, adicionar telas não definidas ou ligar integrações reais por conta própria.

## Limites atuais

- As interfaces usam armazenamento local do navegador em várias áreas.
- Não há sincronização central garantida entre dispositivos.
- Conectores, publicação automática, pagamentos e movimentações bancárias reais não são considerados ativos sem integração de backend e evidência de execução.
- TEST deve usar simulação. PROD exige autorização explícita, credenciais seguras, auditoria e possibilidade de interrupção.
- Os impostos no Darkbank são estimativas configuráveis, não apuração tributária.

## Desenvolvimento

- `main`: produção publicada.
- `develop`: criação.
- `staging`: integração e testes.

Antes de considerar uma mudança concluída, executar `npm test` e revisar o comportamento no navegador. A publicação do GitHub Pages deve ser verificada separadamente.

## Testes

```bash
npm test
```
