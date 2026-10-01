# WordDark — Estrutura Conectada

A primeira concretagem criou componentes independentes. Esta etapa cria o **Runtime**, responsável por conectar os componentes sem transformar tudo em um único módulo.

## Núcleo conectado

```
CONTA
  ↓
IDENTIDADE
  ↓
ACESSO / SEGURANÇA
  ↓
AMBIENTE
  ↓
OPERAÇÃO
  ↓
RODOVIA
  ↓
EXECUTOR
  ↓
REGISTRY
  ↓
BIBLIOTECA LOCAL / CENTRAL
```

### Regra de responsabilidade

- Conta: representa o acesso administrativo ao mundo.
- Identidade: representa quem atua.
- Segurança: decide se pode.
- Ambiente: define onde pode.
- Operação: registra o trabalho.
- Rodovia: transporta a mensagem.
- Executor: realiza o serviço.
- Registry: registra a operação e seus eventos.
- Biblioteca Local: mantém memória operacional.
- Biblioteca Central: preserva histórico/conhecimento.
- Terra: cria necessidades e decisões de negócio.
- Céu/Dark Factory: fornece serviços de execução.

O Runtime somente **orquestra** essas peças.

## Próxima fundação

A partir daqui, a evolução deve ocorrer em módulos:
1. persistência substituível;
2. sessão/autenticação real;
3. autorização administrativa DEV/PERSONAL;
4. retorno formal pela Rodovia;
5. promoção controlada para Biblioteca Central;
6. cidades autônomas;
7. integração real da Dark Factory.
