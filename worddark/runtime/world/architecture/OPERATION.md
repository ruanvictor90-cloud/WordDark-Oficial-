# WordDark — Conceito de Operação

## 1. O que é uma operação

Uma **Operação** é uma unidade rastreável de trabalho dentro do WordDark.

Ela não é apenas uma ação de código. É o registro do que o mundo está tentando fazer, quem solicitou, quem autorizou, por onde passou, o que foi executado e qual resultado voltou.

~~~
ACESSO + IDENTIDADE
        ↓
TESTE / PROD
        ↓
COMUNICAÇÃO
        ↓
EXECUÇÃO
        ↓
RESULTADO
        ↓
REGISTRO / BIBLIOTECA
~~~

## 2. Lugar da operação no mundo

~~~
🌑 WORD DARK
     │
     ├── 🔐 ACESSO
     └── 🪪 IDENTIDADE
             ↓
        🧪 TESTE / PROD
             ↓
        📡 COMUNICAÇÃO
             ↓
        🏭 DARK FACTORY
             ↓
        📚 BIBLIOTECA
             ↓
          🌎 TERRA
             ↓
        🧃 PAÍS / ESTADO
             ↓
          🏙️ CIDADES
~~~

Esse desenho representa o caminho de uma operação entre as camadas. Ele não significa que toda operação precise passar pela Dark Factory: a fábrica é usada quando a operação exige um serviço de execução fornecido pelo Céu.

## 3. Ciclo de vida

Uma operação deve possuir estados claros:

~~~
CREATED
  ↓
IDENTIFIED
  ↓
AUTHORIZED
  ↓
ROUTED
  ↓
EXECUTING
  ↓
VALIDATING
  ↓
COMPLETED
~~~

Possíveis encerramentos:

- REJECTED — recusada antes da execução.
- BLOCKED — bloqueada por segurança, rota ou ambiente.
- FAILED — execução iniciada, mas não concluída.
- CANCELLED — cancelada por uma parte autorizada.

## 4. Identidade da operação

Cada operação precisa de um identificador próprio, por exemplo:

`OP-MUM-000001`

Além do ID, deve registrar:

- requesterId — quem solicitou;
- originId — onde nasceu;
- destinationId — para onde deve ir;
- operationType — o que pretende fazer;
- environment — TEST ou PROD;
- status — estado atual;
- createdAt / updatedAt — histórico temporal;
- parentOperationId — operação que originou esta, quando houver.

## 5. Acesso não é identidade

São conceitos diferentes.

**Identidade:** quem é a unidade ou ator.

**Acesso:** o que essa identidade pode fazer.

Uma identidade pode existir sem possuir autorização para determinada operação.

Fluxo mínimo:

~~~
IDENTIDADE → VERIFICAÇÃO DE ACESSO → OPERAÇÃO
~~~

## 6. Teste e produção

Uma operação deve declarar seu ambiente:

- `TEST` — ambiente de desenvolvimento, simulação ou validação;
- `PROD` — operação reconhecida como operacional.

Regra:

> Uma alteração testada não se torna automaticamente uma alteração de produção.

O mecanismo de promoção deve ser controlado e registrado.

## 7. Comunicação

A operação é transportada por mensagens e rotas.

~~~
OPERAÇÃO
   ↓
MENSAGEM
   ↓
ROTA
   ↓
DESTINO
~~~

A mensagem transporta a operação; a rota define por onde ela pode passar.

Routing não decide se a operação é autorizada.

## 8. Dark Factory

Quando uma operação solicitar produção ao Céu:

~~~
TERRA
  ↓ requerimento
RODOVIA
  ↓
DARK FACTORY
  ↓ execução
RESULTADO
  ↓
RODOVIA
  ↓
TERRA
~~~

A Dark Factory executa o serviço autorizado. Ela não assume a identidade do solicitante e não passa a ser dona da operação de negócio da Terra.

## 9. Biblioteca

A Biblioteca é o histórico organizado do mundo.

Ela pode receber:

- operações concluídas;
- resultados;
- versões;
- documentos;
- aprendizados;
- registros históricos;
- evidências necessárias para rastreabilidade.

Importante: a Biblioteca registra e preserva. Ela não deve decidir a execução de uma operação.

## 10. Terra, País e Cidade

A operação pode retornar para a unidade que solicitou o serviço:

~~~
TERRA
 ↓
PAÍS
 ↓
ESTADO
 ↓
CIDADE / UNIDADE
~~~

A unidade territorial continua responsável pela decisão de negócio.

Exemplo:

Uma cidade precisa de um material de comunicação → solicita produção → Dark Factory produz → resultado retorna → cidade ou Estado decide como utilizar.

## 11. Regra de propriedade

Quem cria uma necessidade continua sendo responsável pela decisão sobre ela.

Quem executa um serviço é responsável pela execução daquele serviço.

Isso evita que infraestrutura compartilhada passe a controlar o negócio das unidades da Terra.

## 12. Registro mínimo

Uma operação importante deve permitir reconstruir sua história:

~~~
CRIADA
→ IDENTIFICADA
→ AUTORIZADA
→ ENVIADA
→ RECEBIDA
→ EXECUTADA
→ VALIDADA
→ DEVOLVIDA
→ REGISTRADA
~~~

Se uma etapa não aconteceu, o registro deve indicar isso.

## 13. Operação como unidade básica

A partir do Marco Zero, novas automações devem preferir trabalhar sobre operações rastreáveis em vez de ações soltas.

Isso permite que uma futura cidade, país, fábrica ou sistema utilize o mesmo modelo sem precisar criar um mecanismo totalmente diferente.

### Regra final

> **Identidade define quem. Acesso define pode. Operação define o quê. Comunicação define como chega. Execução define como é feito. Resultado define o que aconteceu. Biblioteca preserva a história.**