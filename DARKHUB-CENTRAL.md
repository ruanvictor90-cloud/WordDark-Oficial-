# darkHub — central de análise e criação

O darkHub é um aplicativo independente que atua como painel central do ecossistema. Ele reúne **dois hubs de análise** e uma **fábrica de aplicativos**, além de governança, registro de projetos e segurança local.

## Módulos
1. **Painel central:** indicadores derivados dos registros existentes e últimas ações locais.
2. **Análise do ecossistema:** funções, módulos, dependências, conexões e fluxos.
3. **Análise técnica:** código revisado, testes executados, riscos e critérios de liberação.
4. **Criador de aplicativos:** ficha de escopo, identidade e plataforma; exporta um manifesto JSON e uma página inicial independente.
5. **Registro de projetos:** estados e área responsável.
6. **Segurança e acesso:** cofre criptografado local, políticas e limites de confiança.
7. **Registro de atividade:** eventos relevantes guardados dentro do cofre.

## Segurança
- Frase secreta local de 8 a 128 caracteres.
- Derivação PBKDF2-SHA-256 e criptografia AES-256-GCM.
- Dados do cofre criptografados antes de serem gravados no armazenamento local.
- Bloqueio após cinco minutos de inatividade e ao ocultar a aba.
- Política CSP e validação de entradas; registros do usuário são renderizados como texto.
- Conexões externas desligadas por padrão.

## Limites
O cofre é uma proteção local e não uma autenticação de servidor. Os dados não sincronizam entre aparelhos. A frase secreta perdida não pode ser recuperada pelo aplicativo. Uma especificação exportada não é um APK pronto, e uma análise registrada não prova que testes foram executados. Builds de teste não são releases assinadas.

## Contratos futuros
Antes de conectar outro app, será necessário estabelecer identidade autenticada, escopos mínimos, validação do lado servidor, revogação, logs remotos e testes negativos. Nenhum token ou segredo de serviço deve ser incluído no frontend.
