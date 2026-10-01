# WordDark — Security MVP

A primeira camada global de segurança do WordDark.

## Separação
- Identity = quem é.
- Access = o que pode fazer.
- Security Manager = verifica e audita.
- Operation = informa o trabalho.
- Routing = transporta.
- Dark Factory = executa; não cria a autorização global.

## Regra
A autorização exige identityId, capability, action, environment e scope.

## Estado atual
Identidades, regras e auditoria ficam em memória. É um núcleo funcional de teste, não segurança de produção.