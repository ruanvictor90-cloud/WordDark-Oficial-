# 03 — Segurança, permissões e evolução controlada

**Status:** especificação inicial v1.0.

## 1. Princípio de menor privilégio

Cada sistema recebe somente as permissões necessárias para suas funções. O darkHub pode coordenar uma alteração sem receber acesso irrestrito ao código, credenciais ou dados do sistema-alvo.

Permissões devem ser específicas por sistema, ação, recurso e ambiente. Acesso de leitura não significa permissão de escrita ou execução.

## 2. Classificação de risco

- **Baixo:** consulta de status, leitura autorizada e criação de rascunhos.
- **Moderado:** edição reversível em ambiente de desenvolvimento, com testes.
- **Alto:** alteração em produção, publicação externa, envio a terceiros ou mudança com impacto financeiro/reputacional.
- **Crítico:** operação financeira real, ação irreversível, acesso privilegiado ou alteração de segurança.

Ações de alto risco exigem aprovação explícita e controles adicionais. Ações críticas devem exigir confirmação humana, autenticação forte e registro de auditoria quando forem habilitadas. A disponibilidade de uma função não implica autorização para usá-la.

## 3. Pipeline de mudança

1. **Detectar:** registrar solicitação ou problema com evidências.
2. **Diagnosticar:** identificar o domínio responsável e a causa provável.
3. **Preparar:** criar alteração isolada, com escopo e plano de retorno.
4. **Validar:** executar testes automatizados e verificações pertinentes.
5. **Revisar:** apresentar diferenças, impactos, riscos e resultados.
6. **Autorizar:** obter a aprovação exigida pela política.
7. **Aplicar:** executar apenas no ambiente e escopo aprovados.
8. **Confirmar:** verificar o resultado real.
9. **Recuperar:** se necessário, interromper, reverter ou orientar restauração.
10. **Auditar:** registrar decisão, versão, executor, evidências e desfecho.

## 4. Ambientes

Separar desenvolvimento, teste e produção. Credenciais de produção não devem ser copiadas para testes. Conectores devem oferecer modo simulado quando possível. Testes não podem publicar conteúdo, enviar pedidos reais ou movimentar dinheiro por acidente.

## 5. Dados e privacidade

- Dados pessoais e empresariais devem ter separação de domínio.
- Guardar apenas o necessário para cada finalidade.
- Segredos ficam em armazenamento apropriado, nunca em código público ou logs.
- Toda consulta ou transferência entre domínios respeita permissão explícita.
- Logs devem ser úteis para auditoria sem registrar segredos.
- A remoção de dados precisa considerar cópias, backups e requisitos aplicáveis.

## 6. Integridade e recuperação

Toda versão publicada deve identificar a versão anterior e os artefatos usados. Atualizações precisam ter critérios de saúde e plano de rollback quando tecnicamente possível. Uma falha deve gerar estado explícito, não ser mascarada como sucesso.

## 7. Limite de autonomia

A Shadow pode planejar e preparar trabalho; os conectores podem executar apenas as ações permitidas; o darkHub coordena e registra. Nenhum componente pode inventar evidências, contornar permissões, elevar os próprios privilégios ou afirmar que concluiu uma operação sem confirmação.
