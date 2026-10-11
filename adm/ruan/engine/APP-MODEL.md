# Modelo de aplicativos do Ruan

## Regra de arquitetura

Cada app/widget é uma linha separada consumida pelo Ruan. O app não recebe o Ruan, a raiz ADM, a memória pessoal completa ou acesso administrativo. Recebe apenas um contexto limitado às permissões aprovadas para sua função.

## Ciclo de um app

1. Manifesto declara identidade, versão e capacidades necessárias.
2. Registro mantém o app isolado e sem permissões por padrão.
3. Ruan autoriza explicitamente somente capacidades solicitadas.
4. O app usa seu contexto restrito para pedir operações permitidas.
5. Permissões podem ser revogadas sem remover o motor central.

## Planos

Planos de uso, níveis de conta, limites comerciais e distribuição de recursos ficam para uma etapa futura. O registro de apps não implementa cobrança nem presume qualquer plano.

## Ecossistema WordDark

WordDark continua sendo o ecossistema próprio em que as operações giram. Ruan pode iniciar pedidos autorizados ao mundo; o mundo não ganha acesso de retorno à Área ADM/Ruan. Esta base não cria app WordDark, app público ou Shadow.

## Limite técnico atual

Este módulo é a camada de política e contexto, não uma sandbox de sistema operacional. Para apps externos não confiáveis, a implantação futura deverá usar processos/serviços isolados e autenticação real no servidor; não basta esconder propriedades JavaScript.
