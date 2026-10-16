# Ecossistema WordDark — política de segurança

## Autoridade e confiança
- WordDark coordena apenas as operações dentro do escopo autorizado do mundo.
- darkHub é um centro de análise e criação, não uma autoridade de produção nem um servidor de autenticação.
- A interface web e o código publicado devem ser considerados visíveis e modificáveis pelo operador do dispositivo.
- Nenhum aplicativo pode elevar a própria autoridade nem aprovar uma ação sensível que ele mesmo iniciou.

## Regras obrigatórias
1. Nunca versionar senhas, chaves de API, segredos OAuth, refresh tokens ou certificados privados.
2. Não colocar credenciais de produção em GitHub Pages, JavaScript ou assets de APK.
3. Manter TEST, STAGING e PROD separados.
4. Exigir autorização explícita para publicar, conectar, excluir, empacotar ou executar ações irreversíveis.
5. Usar validação e autorização no servidor antes de encaminhar operações para sistemas externos.
6. Registrar eventos importantes sem armazenar segredos.
7. Preservar backups externos e um procedimento de recuperação testado.
8. Validar origem, direitos, versão e proveniência dos assets usados nos apps.
9. Desconectar um conector deve revogar credenciais e metadados remotos.
10. Não tratar armazenamento local como sincronização, autenticação de servidor ou auditoria inviolável.

## darkHub — proteção local
A versão reescrita criptografa os registros locais com PBKDF2-SHA-256 e AES-256-GCM. A frase secreta não é armazenada em texto puro. O bloqueio por inatividade e a limitação local de tentativas reduzem exposição casual.

Essas medidas não defendem contra sistema operacional comprometido, malware, código cliente adulterado, extensões privilegiadas ou força bruta contra frases fracas. Para produção, adicionar autenticação de servidor, permissões por app, Android Keystore, gestão segura de chaves de assinatura, logs remotos e testes de recuperação.

## Antes de integrar serviços externos
- Definir contrato e esquema de dados.
- Autenticar a identidade do app remetente.
- Autorizar escopos mínimos no servidor.
- Validar todos os campos e bloquear replay quando relevante.
- Implementar desconexão e revogação.
- Cobrir fluxos positivos e negativos com testes.
- Manter segredos fora do repositório e dos artefatos públicos.
