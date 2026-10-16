# Shadoweb — arquitetura independente 0.1

## Objetivo

Shadoweb é um aplicativo próprio, inicialmente para uso pessoal, que combina uma interface de navegação com uma camada contextual chamada **darkEye**. O código fica isolado em `shadoweb/` e esta branch não altera os aplicativos existentes nem integra o projeto ao código principal.

## Princípios

- Aplicativo e futuro APK independentes.
- Mobile-first, visual escuro roxo/preto e interface enxuta.
- Recursos desligados por padrão quando exigirem serviços, permissões ou credenciais.
- Conectores com escopo mínimo, identidade verificada, autorização e auditoria.
- Preferências e favoritos locais nesta primeira versão.
- Nenhuma conexão é considerada ativa apenas por aparecer na interface.
- Ações sensíveis devem solicitar confirmação explícita.

## Camadas

1. **Shell / Browser** — interface, pesquisa, atalhos, favoritos e histórico. Nesta fundação web, a navegação entrega links HTTPS ao navegador do sistema; ainda não é um motor de navegador embutido.
2. **darkEye** — painel contextual de demonstração. A sobreposição sobre outros aplicativos requer implementação nativa Android e permissão explícita; não é fornecida por uma página web comum.
3. **Gate** — futura camada de identidade, permissões, escopos e confirmações.
4. **Connect** — catálogo de conectores e seus estados.
5. **Bridge** — contratos de comunicação entre Shadoweb e apps externos; sem confiar em mensagens não autenticadas.
6. **Knowledge** — futura aquisição/organização de conteúdo de fontes permitidas, com proveniência, direitos e revisão.
7. **Audit** — eventos de segurança e ações importantes. Registro persistente remoto depende de serviço autenticado.
8. **Native / APK** — empacotamento Android independente, com navegação, armazenamento e permissões nativas avaliadas separadamente.

## Estado desta fundação

- Implementado: interface responsiva, navegação por seções, escolha do mecanismo de pesquisa, abertura de HTTPS, favoritos e histórico locais, seletor de perfil e painel demonstrativo darkEye.
- Apenas planejado: motor de navegação interno completo, isolamento real de sessões, overlay nativo, leitura de páginas, IA contextual, autenticação, conectores operacionais, sincronização, auditoria remota e distribuição de APK.
- O cartão de Ruan/darkHub e WordDark é informativo; não há conexão de rede ativa entre esses sistemas nesta versão.

## Próximas etapas

1. Revisar a arquitetura e o fluxo de interface com o usuário.
2. Criar testes automatizados para validação de endereços, armazenamento e permissões.
3. Decidir o modelo de navegação Android (WebView nativa ou componente equivalente) e a política de sessões/downloads.
4. Definir o contrato de darkEye e os limites de acesso ao conteúdo.
5. Implementar Gate, Connect, Bridge e Audit antes de habilitar conectores reais.
6. Gerar um APK de teste independente; assinatura de produção será uma etapa separada.

## Segurança da fundação

- Bloqueia esquemas `javascript:`, `data:`, `file:` e `intent:` no campo de navegação.
- Endereços digitados devem usar HTTPS; texto livre vira pesquisa pelo mecanismo escolhido.
- Favoritos e histórico são guardados localmente no navegador, sem sincronização ou servidor.
- Não inserir tokens, senhas ou segredos no armazenamento local.
- O modo de perfil é apenas uma preferência de interface; não oferece isolamento de cookies ou sessões.
