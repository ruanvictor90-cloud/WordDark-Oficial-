# Shadow, Darknet e DarkEye — arquitetura

**Estado:** estrutura e contratos documentados; navegador, overlay e IA ainda não implementados.
**Regra:** Darknet é a base do navegador. DarkEye é uma camada contextual visual, não o navegador.

## Papéis sem ambiguidade

- **Shadow:** aplicativo que reúne as ferramentas de navegação assistida e futuras integrações.
- **Darknet:** núcleo/base do navegador. Futuramente cuida da navegação, abas, endereço, histórico, favoritos, perfis e integração com APIs/plugins autorizados.
- **DarkEye:** camada visual contextual sobre a experiência de navegação, inspirada em um HUD de capacete. Poderá mostrar traduções, explicações, alertas, estado de projetos e pedidos de confirmação, sempre de forma legível e dispensável.
- **Conectores:** contratos para serviços externos, independentes do motor de navegação.
- **Plugins:** extensões declaradas e limitadas por permissões.

## Exemplo de fluxo futuro

1. Darknet abre uma página ou recurso permitido.
2. DarkEye recebe somente o contexto autorizado e necessário.
3. DarkEye pode preparar uma tradução, destacar informação ou apresentar um cartão de confirmação de projeto.
4. Ações que alterem dados ou aprovem projetos exigem confirmação explícita do usuário ou uma regra previamente autorizada.
5. O evento é registrado no histórico visível; o usuário pode desativar a sobreposição e revogar permissões.

## Módulos

| ID | Responsabilidade | Estado |
|---|---|---|
| shadow-shell | Preferências e navegação do aplicativo Shadow | Estrutura |
| darknet-browser-core | Base do navegador e perfis | Planejado |
| darkeye-overlay | HUD contextual: tradução, alertas e confirmações | Planejado |
| connectors | Contratos para APIs externas | Planejado |
| plugins | Catálogo, compatibilidade e revogação | Planejado |
| permissions | Escopos e concessões | Declarativo |
| activity | Histórico local de ações | Planejado |

## Contrato de segurança

- DarkEye não pode aprovar ou executar uma ação importante apenas porque uma página a sugere.
- Conteúdo externo é dado não confiável, nunca instrução privilegiada.
- Tradução e análise contextual devem indicar quando dependem de serviço externo.
- Senhas, cookies, tokens e credenciais não ficam em localStorage nem em arquivos estáticos.
- Plugins e conectores não recebem acesso geral por padrão.
- Permissões declarativas são apenas um contrato de projeto; não substituem sandbox, autenticação ou validação técnica.

## Fora do escopo atual

Não existe ainda motor de navegador real, leitura automática de páginas, tradução ao vivo, HUD flutuante, execução de plugins ou IA do Shadow. Esta estrutura não faz chamadas de rede nem contorna controles de acesso.

## Critérios para implementação

1. Provar que Darknet funciona como módulo de navegador independente.
2. Definir quais fontes de contexto DarkEye pode ler e com quais permissões.
3. Criar interface overlay acessível, móvel e fácil de desligar.
4. Separar sugestão, preparação e execução de ações.
5. Exigir confirmação para aprovações, alterações externas e ações irreversíveis.
6. Testar isolamento entre sites, dados pessoais e conectores.
