# Dark Factory

A Dark Factory é uma unidade de execução do **Céu** dentro do WordDark.

Ela existe como infraestrutura compartilhada para atender unidades da **Terra**. Sua função, no domínio de conteúdo, é equivalente a uma ferramenta de criação e edição: recebe um requerimento autorizado, produz/processa/valida o material e devolve o resultado.

## Regra fundamental

**A Fábrica produz. O País/Estado decide o que precisa e para onde vai.**

A Dark Factory não administra marcas, canais ou redes sociais; não escolhe publicação nem destino de distribuição.

## DF-0.7 — Fábrica modular

O núcleo agora está preparado para separar:

- registro de serviços;
- pipeline de produção;
- executores por tipo de serviço;
- validação do resultado;
- retorno rastreável.

O primeiro serviço permanece **content.produce**. Novos serviços podem ser adicionados sem transformar a fábrica em responsável pela Terra.

## Circuito

ENTRADA → IDENTIDADE → AUTORIZAÇÃO → SERVIÇO → EXECUTOR → VALIDAÇÃO → RESULTADO → RODOVIA → TERRA

## Limites atuais

GitHub Pages continua sendo ambiente de desenvolvimento/demonstração. Integrações externas reais, credenciais, banco persistente e workers privados dependem da infraestrutura própria futura.

## Evolução

DF-0.1 entrada e execução básica.
DF-0.2 comunicação.
DF-0.3 executores.
DF-0.4 contratos e segurança.
DF-0.5 automação.
DF-0.6 separação produção/distribuição.
DF-0.7 arquitetura modular de serviços.
