# WordDark — Guia de Arquitetura para Devs

Este documento transforma o mapa público do WordDark em regras de engenharia.

## 1. Regra de ouro

**Uma responsabilidade pertence a uma camada.**

Não resolver um problema de Routing dentro do Executor. Não resolver autorização dentro do Executor. Não fazer publicação dentro da Dark Factory. Não colocar regra territorial dentro da infraestrutura compartilhada.

Quando uma função parece pertencer a duas áreas, definir primeiro o contrato entre elas.

## 2. Separação de domínios

### Terra
- identidade das unidades territoriais;
- necessidades e requisitos;
- estratégia da unidade;
- operações locais;
- distribuição e publicação;
- decisões de negócio;
- análise dos resultados recebidos.

### Céu
- serviços compartilhados;
- infraestrutura;
- execução;
- segurança;
- roteamento;
- registro;
- armazenamento;
- contratos técnicos.

### Dark Factory
Responsável somente pelo ciclo de produção solicitado:

~~~
receber → validar requerimento → executar → validar resultado → registrar → devolver
~~~

Uma solicitação de produção deve conter o que é necessário para produzir, mas não precisa carregar uma decisão de publicação.

## 3. Contratos fundamentais

| Contrato | Pergunta |
|---|---|
| Identity | Quem é? |
| Request | O que está sendo solicitado? |
| Message | Como a solicitação foi transportada? |
| Route | Por onde pode passar? |
| Security | Pode executar? |
| Executor | Como executar? |
| Result | O que aconteceu? |
| Response | Como devolver o resultado? |

## 4. Regras de dependência

~~~
Terra → Request → Message/Route → Security → Factory → Executor → Validation → Result → Response → Terra
~~~

- Routing não autoriza.
- Registry não autoriza.
- Executor não cria sua própria permissão.
- Storage não decide execução.
- Contracts não executam.
- Security não executa.
- Dark Factory não escolhe destino de publicação.
- Uma unidade da Terra não deve depender de implementação interna de outra unidade.

## 5. Evolução sem quebrar o mundo

Antes de alterar uma interface:
1. identificar quem consome o contrato;
2. verificar compatibilidade;
3. criar ou ajustar teste;
4. testar fora do ambiente operacional;
5. registrar a mudança;
6. promover somente depois da validação.

## 6. Versionamento

Usar versões explícitas nos componentes e contratos quando houver mudança relevante.

Exemplos: DF-0.6, SC-0.3, CONTRACT-0.1, ROUTE-0.1.

Mudanças incompatíveis devem gerar nova versão ou migração planejada.

## 7. Produção x distribuição

Este é um limite arquitetural obrigatório.

### Dark Factory
~~~
content.produce
~~~

### Terra / Estado
~~~
content.publish
content.distribute
content.register
~~~

A fábrica pode devolver um material produzido e seus metadados. O Estado decide se vai usar, onde, quando, em qual canal e qual operação de distribuição executar.

## 8. Segurança

O caminho mínimo para uma operação sensível é:

~~~
IDENTIDADE → AUTORIZAÇÃO → EXECUÇÃO → REGISTRO
~~~

A autorização não deve ficar implícita em um botão, arquivo ou executor.

## 9. Testes

Cada camada deve poder ser testada isoladamente: contrato válido/inválido, identidade válida/inválida, rota permitida/bloqueada, autorização aprovada/rejeitada, executor aceitando/rejeitando e resposta retornando à origem.

O primeiro MVP deve provar o circuito completo antes de buscar automação avançada.

## 10. Regra para novos módulos

Antes de criar um módulo, responder:
1. Qual responsabilidade ele possui?
2. Em qual camada ele vive?
3. Quem pode chamá-lo?
4. Qual contrato ele recebe?
5. Qual resultado devolve?
6. O que ele explicitamente não faz?
7. Como será testado?

Se essas respostas não estiverem claras, o módulo ainda não está pronto para ser criado.

## 11. Estado do Marco Zero

~~~
MAPA OFICIAL → CONTRATOS → NÚCLEO → MVP → TESTES → SEGURANÇA → AUTOMAÇÃO → ESCALA
~~~

Não adicionar novas grandes estruturas apenas porque parecem úteis. A arquitetura deve crescer por necessidade comprovada, não por acumulação de módulos.