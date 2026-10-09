# Ruan — Núcleo Pessoal Alfa 0.1

O Ruan é o ambiente pessoal independente. WordDark é um aplicativo acessado a partir dele, não o proprietário do Ruan.

## O que existe nesta alfa
- Tela inicial mobile-first com atalhos de aplicativos.
- Atalho para a Central do WordDark.
- Agenda pessoal com criação, conclusão e exclusão de compromissos.
- Cofre de laboratório com lançamentos locais ilustrativos.
- Biblioteca pessoal de notas.
- Manifesto PWA e cache básico para instalação/abertura como app.
- Módulos em áreas independentes para facilitar a futura extração de cada aplicativo.

## Limites atuais
- Dados salvos no armazenamento local do navegador, sem sincronização entre dispositivos, login ou backup.
- Cofre é apenas um registro local; não é banco, não movimenta dinheiro e não substitui contabilidade.
- O atalho WordDark abre a interface disponível no repositório pai; isso não significa que o runtime do WordDark esteja concluído.
- Não há integração com IA, calendário do sistema, notificações garantidas ou ações externas autorizadas nesta versão.
- O cache offline pode servir a interface, mas não substitui sincronização nem recuperação de dados.

## Regra de arquitetura
Ruan é o contêiner pessoal. Aplicativos são módulos independentes registrados no launcher. WordDark pode solicitar acesso a recursos específicos por meio de contratos e autorizações explícitas; não recebe controle da raiz pessoal, dos dados ou das permissões de Ruan.

## Publicação
A partir da raiz publicada do repositório, a área fica em /ruan/. A instalação PWA depende de HTTPS e suporte do navegador. O caminho de produção deve ser validado após a publicação.
