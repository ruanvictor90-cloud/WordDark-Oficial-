# Shadow — estrutura do aplicativo

**Estado:** estrutura documental inicial; ainda não é um navegador funcional.
**Localização:** app independente sob a plataforma Ruan.
**Limite atual:** não implementar lógica de IA/Shadow nesta etapa.

## Missão

Shadow será um aplicativo próprio de navegação e ferramentas. A ideia DarkEye começa como uma camada de navegador/visualização com permissões explícitas, podendo evoluir depois para integrações por APIs e plugins. Shadow não é uma cópia da central Ruan e não deve aparecer duplicado dentro de Pessoal.

## Camadas propostas

1. **Shell Shadow:** configurações e navegação interna do próprio Shadow. Não possui a gaveta global de aplicativos do Ruan.
2. **DarkEye (planejado):** espaço de navegação; no futuro poderá ter barra de endereço/pesquisa, abas, histórico local, favoritos, perfis e permissões por site. Nenhuma navegação real está implementada por este documento.
3. **Gateway de integrações:** catálogo de APIs/conectores, credenciais protegidas fora de arquivos estáticos e permissões por integração. Não executar chamadas externas até existir um conector real, autorizado e testado.
4. **Registro de plugins:** nome, versão, origem, permissões declaradas, compatibilidade, estado e ação de revogação. Plugins não recebem acesso irrestrito por padrão.
5. **Dados locais:** preferências, favoritos e metadados de navegação quando implementados. Não guardar senhas, tokens, cookies de sessão ou dados sensíveis em armazenamento local simples.
6. **Segurança e privacidade:** permissões explícitas, isolamento por origem quando tecnicamente disponível, indicação de conexões externas e revogação de acesso.

## Módulos

| ID | Responsabilidade | Estado |
|---|---|---|
| shadow-shell | Configuração e navegação interna do app | Estrutura |
| darkeye | Conceito de navegador/overlay e navegação | Planejado |
| connectors | Contratos de APIs e integrações externas | Planejado |
| plugins | Registro e ciclo de vida de plugins | Planejado |
| permissions | Declaração e concessão de escopos | Estrutura declarativa |
| activity | Eventos locais legíveis pelo usuário | Planejado |

## Contrato de plugin/conector

Cada extensão futura deverá declarar id, name, version, kind, requestedScopes, entrypoint, status e publisher. Permissões precisam ser mínimas e revogáveis. Uma declaração de permissões não é, por si só, isolamento técnico: a execução deve ocorrer em ambiente apropriado e ser validada antes de habilitar plugins.

## Não fazer nesta fase

- Não implementar IA, agente autônomo ou raciocínio do Shadow.
- Não tratar DarkEye como navegador pronto nem afirmar suporte a sites reais.
- Não criar funções de invasão, ocultação de atividade ou contorno de permissões.
- Não compartilhar automaticamente dados do Pessoal com Shadow.
- Não armazenar segredos em arquivos do repositório ou em armazenamento local simples.
- Não conectar APIs externas sem autorização, contrato, tratamento de erros e testes.

## Critérios para a próxima fase

- App Shadow abre separadamente do Pessoal.
- Não existe gaveta global duplicada dentro do Shadow.
- DarkEye tem interface e comportamento claramente identificados como protótipo até existir navegação real.
- Toda integração declara escopos e pode ser desativada.
- Falhas de conexão não apagam dados locais.
- Testes verificam limites de acesso entre Shadow e Pessoal.
