# Ruan — Central pessoal (interface v0.1)

Interface web mobile-first da Área ADM/Ruan, separada do motor Node.js e dos módulos que serão construídos depois.

## Abrir localmente
Sirva esta pasta por HTTP, por exemplo:
`python -m http.server 8080`
Depois abra `http://localhost:8080` dentro desta pasta. O service worker/PWA exige localhost ou HTTPS.

## O que já funciona nesta versão
- Navegação entre painel, biblioteca de aplicativos, fábrica de registros, tarefas, notas e acesso.
- Cadastro local de aplicativos com ID, nome, descrição e capacidades solicitadas.
- Autorização de capacidades como etapa separada; novos apps começam sem permissões concedidas.
- Exportação individual de manifesto de aplicativo em JSON e exportação do catálogo local.
- Tarefas e notas persistidas no armazenamento local do navegador.
- Layout responsivo e manifesto PWA com cache básico para abertura offline.

## Limites importantes
- Esta interface é um primeiro MVP visual/funcional. Ela ainda não chama diretamente `RuanEngine`; a persistência do navegador é separada da memória do motor Node.js.
- A lista de permissões é uma interface de política, não um sandbox de segurança. Não instale código de terceiros nem interprete um manifesto como prova de isolamento.
- Não há ainda gerador de código executável, empacotamento Android/iOS, sincronização, login, servidor ou conexão ativa com WordDark.
- A raiz pessoal não expõe endpoint de entrada. Qualquer futura integração WordDark deve continuar sendo uma solicitação iniciada pelo Ruan, limitada e aprovada explicitamente.
- Os dados desta versão ficam no navegador/dispositivo atual. Limpar os dados do site pode apagá-los.

## Próximas etapas sugeridas
1. Testar a interface em celular e validar o fluxo de registro/exportação.
2. Criar um adaptador de aplicação entre a interface e o motor, com validação e testes.
3. Construir a fábrica de código a partir de modelos seguros e testáveis, começando por módulos simples.
4. Implementar empacotamento e distribuição independentes somente depois de definir o runtime e os limites de isolamento.
5. Conectar WordDark por uma ponte de saída explícita, sem permissões administrativas sobre Ruan.