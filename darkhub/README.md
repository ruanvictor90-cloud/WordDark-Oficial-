# darkHub — Central do Ecossistema

**Aplicativo independente. Código reescrito.** O darkHub reúne duas áreas de análise e uma fábrica de aplicativos, além do painel central de acompanhamento.

## Áreas
- **Painel central:** métricas derivadas dos registros existentes e atividade local.
- **Análise do ecossistema:** responsabilidades, arquitetura, conexões e governança.
- **Análise técnica:** revisões de código, verificações, riscos e critérios de liberação.
- **Criador de aplicativos:** cria especificações e exporta um manifesto JSON, uma página inicial e uma folha de estilos independentes.
- **Registro de projetos:** acompanha projetos e estados.
- **Segurança e acesso:** estado do cofre, limites de confiança e políticas.
- **Registro de atividade:** trilha local de ações relevantes.

## Segurança implementada nesta base
- Frase secreta de 8–128 caracteres; nunca armazenada em texto puro.
- Derivação PBKDF2-SHA-256 (310.000 iterações) e chave AES-256-GCM.
- Registros criptografados antes de persistir no armazenamento local.
- Bloqueio por inatividade após cinco minutos e ao sair da aba.
- Limitação simples de tentativas repetidas de desbloqueio.
- Content Security Policy; sem execução de scripts arbitrários ou HTML inserido de registros.
- Nenhuma conexão externa ou credencial de serviço ativa.

## Limites importantes
O cofre criptográfico protege dados locais em repouso, mas o navegador e o dispositivo ainda são parte do ambiente de confiança. Um aplicativo web público não consegue garantir que o código não seja alterado por alguém com controle do dispositivo, nem oferece autenticação de servidor, sincronização entre aparelhos, armazenamento Android Keystore ou logs remotos invioláveis. Esses controles precisam de backend autenticado e, no APK, integração nativa segura. Perder a frase secreta significa perder o acesso aos dados criptografados; mantenha exportações de backup em local seguro.

## Desenvolvimento e publicação
A pasta `darkhub/` é a origem canônica desta versão. O aplicativo é publicado por workflow separado e empacotado em APK de teste via Capacitor. Builds debug não são releases assinadas para distribuição pública. A integração com WordDark e outros aplicativos permanece desativada até haver contratos de API, autenticação, autorização, revogação e testes específicos.
