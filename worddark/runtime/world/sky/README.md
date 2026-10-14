# Céu

O **Céu** é a área do WordDark que reúne capacidades especializadas para resolver necessidades encaminhadas pelo mundo. Não é uma empresa única.

## Aplicativos definidos nesta versão

### Dark Factory

Estrutura inicial de produção de conteúdo. A interface expõe Em criação e Biblioteca; a Biblioteca separa Áudio, Vídeos, Voz, Imagens e Outros arquivos. Os interiores serão detalhados por etapas.

### Central Social

Agrupa três aplicativos independentes:
- **Gestor de redes sociais:** perfis, calendário, publicações e resultados.
- **Gestor de marketing digital:** aquisição, campanhas, anúncios, posicionamento e resultados comerciais.
- **Gestor de projetos:** demandas, prazos, responsáveis, custos e entregas.

Esses aplicativos estão na fase de estrutura inicial; não se deve presumir que calendários, métricas, campanhas ou publicação estejam conectados a serviços externos.

## Infraestrutura de conexão

A Central de Conexões Externas é infraestrutura compartilhada, não um quarto aplicativo de marketing. Credenciais e tokens não ficam no frontend público. TEST usa simuladores; PROD exige autorização e controles de servidor.

## Princípio

O Céu executa capacidades que o WordDark encaminha. Novos detalhes devem ser adicionados dentro do aplicativo responsável, sem duplicar a infraestrutura central.
