# WordDark — Nucleo preparado para estruturas dinamicas

Estado: especificacao arquitetural inicial. Nenhuma fabrica, empresa ou cliente vem pre-cadastrado.

## Objetivo
Permitir que o WordDark receba uma necessidade, descubra capacidades disponiveis, identifique lacunas e coordene uma solucao auditavel. O nucleo nao deve precisar ser refeito para cada cliente. Novas estruturas sao adicionadas como entidades/modulos que cumprem contratos comuns.

## Principio de nascimento zero
O sistema inicia sem operacoes empresariais reais. Ja inclui catalogo, contratos, permissao, validacao, roteamento, aprovacao, auditoria, estados, simulacao e recuperacao. Dados de teste ficam isolados e identificados.

## Dominios
- WordDark: governanca, registro de necessidades, coordenacao, politicas, auditoria e roteamento.
- Ceu: dominio de producao de solucoes. Fabrica e capacidade produtora so existem apos cadastro e aprovacao.
- Terra: dominio de demanda e atendimento. Empresas, clientes e canais so existem apos cadastro e aprovacao.
- WordDark Hub: interface de gestao dentro do darkHub, com dominio e codigo separados do nucleo. A interface usa contratos e nao contem a regra central.

## Contrato de entidade
Cada entidade declara: id estavel, tipo, finalidade, dominio, versao do contrato, capacidades, entradas, saidas, dependencias, recursos solicitados, permissoes, riscos, custos conhecidos, responsavel, estado, testes e historico.

Cadastro nao concede acesso. O ciclo e: draft -> submitted -> validating -> testing -> pending_approval -> active. Estados alternativos: suspended, failed, retiring, retired. So entidades ativas e autorizadas recebem operacoes compativeis.

## Fluxo de necessidade
1. Registrar objetivo, contexto, restricoes e criterios de sucesso.
2. Validar completude e classificar risco.
3. Procurar capacidades ativas e autorizadas.
4. Se nao houver capacidade, registrar a lacuna e propor uma estrutura a criar; nunca fingir que resolveu.
5. Preparar plano com dependencias, custos, efeitos e permissoes.
6. Simular ou pedir aprovacao conforme o risco.
7. Executar apenas atraves de entidades autorizadas.
8. Verificar resultado, registrar evidencias e auditar.
9. Em falha, bloquear, diagnosticar, tentar recuperacao limitada ou encaminhar para humano.

## Contrato de operacao
Cada mensagem tem message_id, correlation_id, schema_version, origem, destino, tipo, objetivo, payload tipado, escopo de permissao, instante, chave de idempotencia, risco, modo (simulacao/execucao), estado e evidencias.

Estados de operacao: draft, pending_approval, approved, running, succeeded, rejected, blocked, failed, cancelled, rolled_back.

## Seguranca
- Privilegio minimo; permissoes por entidade, acao, recurso e ambiente.
- Entidade nao aprova sua propria ativacao nem amplia as proprias permissoes.
- Operacoes externas, financeiras, irreversiveis ou de alto impacto exigem aprovacao explicita.
- Segredos fora do codigo e dos logs.
- Idempotencia ou bloqueio contra duplicacao.
- Auditoria de solicitante, aprovador, escopo, horario, resultado e evidencia.
- Coordenacao central nao significa acesso irrestrito a dados privados dos outros apps.

## Modulos iniciais
1. Catalogo e registro vazio de capacidades.
2. Contratos e validacao de compatibilidade.
3. Registro de necessidades e resultados.
4. Roteador para capacidades ativas.
5. Permissoes e aprovacao.
6. Auditoria e historico.
7. Simulacao, falhas e recuperacao.
8. Testes automatizados do nucleo.

## Criterios de aceite
- Inicio sem empresas, fabricas ou clientes reais.
- Entidade de teste pode ser cadastrada, validada, testada, aprovada, suspensa e encerrada.
- Necessidade sem capacidade retorna lacuna clara.
- Necessidade compativel e encaminhada somente a entidade autorizada.
- Sem aprovacao, nenhum efeito real e executado.
- Contratos incompativeis, permissao insuficiente e duplicacao sao detectados.
- O fluxo inteiro e auditavel e testavel em ambiente isolado.

## Fora do escopo inicial
Nao implementar ainda fabricas concretas, empresas, integracoes pagas, automacao financeira, execucao autonoma externa ou interface final. Cada capacidade futura tera modulo, contrato, testes, permissoes e criterios proprios.
