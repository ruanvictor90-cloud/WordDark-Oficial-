# Arquitetura dos motores — versão consolidada

## Fronteira entre Ruan e WordDark

- Ruan é um aplicativo pessoal privado e independente.
- WordDark não administra Ruan, não acessa seus dados e não recebe autoridade sobre sua raiz.
- Nenhum módulo do WordDark deve criar uma página, reserva financeira ou transferência para Ruan.
- Uma futura conexão, caso definida, terá de ser explícita, limitada e iniciada por Ruan; ela não faz parte da versão consolidada atual.

## Fonte canônica do Core

`worddark/runtime/world/core/` é o Core ativo e único. Ele reúne a infraestrutura operacional, incluindo identidade, permissões, portões, contratos, operações, comunicação, persistência, ambiente, recuperação e parada emergencial.

`worddark/core-central/` é uma implementação anterior. Está fora do caminho ativo e da suíte padrão. Seus detalhes podem ser consultados para reaproveitamento, mas não devem ser importados nem usados como segundo coordenador.

## Domínios

- **WordDark:** coordena, registra e encaminha operações.
- **Céu:** mantém capacidades especializadas, incluindo Dark Factory e Central Social.
- **Terra:** mantém empresas e operações voltadas a necessidades externas, incluindo Empresa social e Empresa comercial.
- **Darkbank:** acompanha registros financeiros do próprio mundo; não é uma integração bancária real.
- **Central de conexão:** concentra o desenho dos conectores. Uma tela de conexão não significa que uma conta externa esteja conectada.
- **Ruan:** fica fora desses domínios.

## Estado atual versus objetivo

O repositório possui motores de domínio e interfaces. A coexistência de arquivos não prova que todas as interfaces chamem os motores canônicos. A integração deve ocorrer por contratos explícitos e ser validada por testes.

Fluxo desejado:

`SOLICITAÇÃO → CONTRATO → AUTORIZAÇÃO → ROTEAMENTO → OPERAÇÃO → RESULTADO → REGISTRO`

Cada operação deve ter identificador, estado, origem e evidências. Falhas devem permitir retomada controlada. Aprovação não significa execução externa automática.

## Regras de segurança

1. Um domínio não escreve diretamente nos dados privados de outro.
2. TEST usa simuladores e não chama conectores reais.
3. PROD exige autorização explícita, credenciais protegidas no servidor e trilha de auditoria.
4. Nenhuma publicação, cobrança, compra ou alteração de conta é considerada concluída sem confirmação do serviço responsável.
5. Automação permanece desativada por padrão, com aprovação humana e parada emergencial.
6. Novos setores reutilizam contratos existentes; não criam um segundo Core.

## Testes

`npm test` valida a suíte ativa. Os testes do antigo `worddark/core-central/` ficam fora dessa suíte para não tratar a implementação anterior como fonte canônica.
