# Shadoweb — base de segurança

## Proteções implementadas

- Navegação HTTPS; bloqueio de esquemas `javascript:`, `data:`, `file:`, `blob:` e `intent:`, além de destinos locais/privados conhecidos.
- Política CSP que limita scripts e estilos aos recursos locais e permite apenas a chamada pública necessária à Wikipedia.
- Contrato versionado e lista permitida de conectores e ações.
- Verificação de ativação e escopo de permissão antes de executar um conector.
- Timeout do Bridge: a chamada falha quando excede o limite, mesmo que o executor ignore o sinal de cancelamento.
- Importação de manifestos JSON; nenhum JavaScript importado é avaliado.
- Conteúdo fornecido pelo usuário é renderizado como texto, evitando inserção de HTML arbitrário.
- Auditoria local com redação de valores que aparentam ser segredos e limite de 300 registros.
- Service worker limitado a requisições GET do mesmo domínio.

## Limitações conhecidas

- O armazenamento local não é um cofre seguro e pode ser alterado ou apagado no dispositivo.
- Não há login, sincronização em nuvem, auditoria remota, autorização no servidor, credenciais externas ou API HTTP pública.
- Wikipedia é um conector público de leitura e começa desativado.
- Plugins de terceiros não são executados.
- darkEye é demonstrativo e não inspeciona automaticamente outras páginas nem outros aplicativos.
- O APK de depuração não é assinado para distribuição de produção.

## Critérios antes de lançar publicamente

- Revisão manual em Android de navegação, permissões, modo offline, importação/exportação e abertura de links.
- Implementar autenticação no servidor, autorização por usuário/aplicativo, limites de uso, gestão de segredos, monitoramento e auditoria remota antes de publicar endpoints HTTP.
- Revisar segurança de cada conector e manifesto de plugin.
- Definir aviso de privacidade, retenção e exclusão de dados, política de atualização de dependências e processo de resposta a incidentes.
- Assinar o APK de produção e verificar instalação e atualização em dispositivos reais.

## Vocabulário de segurança

- **Conector:** integração registrada com ações delimitadas.
- **Escopo:** permissão mínima exigida para uma ação.
- **Bridge:** ponto obrigatório de validação e encaminhamento.
- **Auditoria:** registro local nesta versão; não é um registro remoto inviolável.
- **Pendente:** integração planejada, ainda sem conexão funcional verificada.
