# VÉU — Camada de Privacidade e Fronteira

O Véu é a camada externa de proteção entre o mundo operacional do WordDark e os ambientes externos.

## Princípio

O Véu guarda o que **não pertence ao Mundo** e também não deve ficar exposto diretamente no ambiente externo:

- credenciais;
- secrets;
- tokens;
- sessões;
- códigos OAuth;
- chaves de API;
- dados privados de contas;
- identificadores sensíveis;
- material bruto de autenticação;
- configurações privadas de conexão;
- registros necessários para recuperação/revogação.

O Mundo recebe somente a informação operacional necessária.

## Regra de autoridade

`Área ADM/Ruan → Véu → Mundo WordDark`

O Mundo não administra a raiz do Véu.

O Véu não substitui a Área ADM. Ele é uma fronteira técnica de privacidade e segurança.

## Regra de exposição

Nunca transportar para o Mundo:
- client_secret;
- refresh_token;
- access_token bruto;
- authorization_code;
- senha;
- chave privada;
- cookie/sessão;
- segredo de integração.

O Mundo recebe:
- estado da conexão;
- identidade operacional não sensível;
- capacidades autorizadas;
- resultados;
- eventos sanitizados;
- metadados mínimos necessários.

## Regra de saída

Quando um setor precisa executar algo externo, ele solicita uma **capacidade** ao Véu.

O setor não recebe a credencial.

`Mundo → capacidade → Véu → provedor externo`

## Regra de entrada

Quando um provedor externo envia informação:

`provedor → Véu → validação → sanitização → Mundo`

## Subsetores

1. Identidade e acesso
2. OAuth
3. Cofre de credenciais
4. Sessões e tokens
5. Conexões
6. Capacidades
7. Entrada externa
8. Saída externa
9. Revogação
10. Rotação
11. Auditoria
12. Privacidade
13. Recuperação
14. Emergência
15. Integridade
16. Ponte com o Mundo

O Véu deve permanecer modular. Cada engrenagem pode evoluir sem transformar o Mundo em uma porta de acesso às credenciais.
