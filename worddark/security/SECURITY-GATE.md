# PORTÃO DE SEGURANÇA PARA CONEXÕES REAIS

Antes de uma conexão real ser considerada OPERACIONAL:

- provedor identificado;
- conta identificada;
- escopo mínimo definido;
- capacidades aprovadas;
- callback OAuth protegido;
- armazenamento de segredo fora do repositório;
- identidade de execução definida;
- auditoria ativa;
- revogação testada;
- recuperação definida;
- ambiente separado;
- teste de sanitização aprovado;
- teste de autorização aprovado;
- teste de falha aprovado;
- publicação/destruição protegidas por aprovação quando aplicável.

## Estado
ARCHITECTURE_READY = a estrutura do WordDark está preparada.

CONNECTION_READY = gateway seguro + provedor configurado + credenciais armazenadas + testes aprovados.

OPERATIONAL = conexão testada ponta a ponta e liberada pela política.

Nenhum desses estados deve ser confundido.
