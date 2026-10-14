# Darknet — base do navegador

**Papel:** camada-base de navegação do conjunto Shadow.  
**Estado:** arquitetura planejada; nenhum motor de navegador foi implementado nesta fundação.

## Responsabilidade

Darknet será o núcleo responsável pela experiência de navegação: sessões/perfis, abas, endereço e pesquisa, histórico, favoritos, gestão de permissões por origem e integração controlada com conectores. A implementação concreta dependerá da plataforma escolhida (web, Android, desktop ou híbrida) e das capacidades reais de WebView/navegador.

## Relação com DarkEye

Darknet é o ambiente que abre e apresenta o conteúdo. DarkEye é uma camada contextual opcional que pode aparecer sobre ou ao lado do conteúdo. DarkEye não substitui o navegador nem ganha acesso irrestrito às páginas.

Fluxo esperado:
1. Darknet navega para um recurso permitido.
2. O usuário solicita ou autoriza o contexto necessário.
3. DarkEye pode exibir tradução, resumo, alerta ou cartão de confirmação.
4. Ações que alteram projetos, enviam dados ou afetam serviços externos exigem confirmação explícita.
5. O usuário pode fechar DarkEye, rever atividade e revogar permissões.

## Componentes futuros

- navigation: abertura de URLs e estado de navegação.
- tabs: gestão de abas e restauração de sessão.
- profiles: preferências separadas de navegação.
- bookmarks: favoritos e coleções.
- history: histórico local configurável, com opção de limpar.
- site-permissions: permissões por origem.
- connector-bridge: interface limitada para conectores autorizados.
- darkeye-context: fornece apenas o contexto mínimo autorizado ao HUD.

## Requisitos de segurança

- Não tratar conteúdo de páginas como instruções privilegiadas.
- Não extrair dados de páginas sem ação ou permissão válida.
- Não guardar senhas, cookies de sessão ou tokens em arquivos ou localStorage.
- Não executar plugins arbitrários no mesmo contexto privilegiado da aplicação.
- Mostrar quando tradução ou análise envia conteúdo para um serviço externo.
- Isolar permissões e permitir revogação.
- Exigir confirmação para operações importantes, envio externo e ações irreversíveis.

## Limites desta fase

Este documento não cria um navegador, proxy, túnel, mecanismo de anonimato ou acesso a páginas. Não há chamadas de rede, motor de renderização, leitura automática de tela nem overlay real. Essas partes só entram em desenvolvimento depois da decisão de plataforma, desenho de segurança e testes.
