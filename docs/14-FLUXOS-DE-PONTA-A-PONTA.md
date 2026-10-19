# 14 — Fluxos de ponta a ponta do ECOSSISTEMA

**Estado:** fluxos de referência para validar a arquitetura. Ainda não são processos implementados.

## 1. Como ler os fluxos

Cada fluxo define origem, decisões, sistemas envolvidos, saídas e caminhos de falha. A interface final será desenhada depois, com base nesses fluxos e nas fichas funcionais. Nenhum fluxo concede permissão por si só.

## 2. Fluxo A — Solicitação que já existe capacidade para resolver

1. O usuário ou Terra registra a necessidade com objetivo, contexto, restrições e critérios de sucesso.
2. WordDark valida a completude, o contrato, o solicitante e o tenant.
3. O analisador consulta o catálogo de capacidades ativas e testadas.
4. O planejador cria uma proposta de tarefas, dependências, recursos e resultados esperados.
5. A política determina quais tarefas podem seguir automaticamente em ambiente permitido e quais exigem aprovação.
6. O roteador seleciona apenas capacidades compatíveis, ativas e autorizadas.
7. O executor envia cada operação com identificadores de rastreamento e proteção contra duplicação.
8. O verificador compara resultados com critérios de aceite.
9. A auditoria registra decisões, versões, evidências e falhas.
10. O resultado é apresentado para revisão e aceite quando necessário.

**Bloqueios:** contrato incompleto, tenant não validado, permissão ausente, capacidade inativa, aprovação inválida, destino indisponível ou evidência insuficiente.

## 3. Fluxo B — Necessidade sem capacidade disponível

1. WordDark registra a necessidade e conclui que não existe capacidade suficiente.
2. Abre uma lacuna vinculada à necessidade; não roteia para uma capacidade apenas parecida sem declarar limitações.
3. Shadow prepara perguntas, critérios e alternativas de resolução.
4. Shadoweb pesquisa documentação e alternativas em fontes e conectores permitidos.
5. A proposta compara reutilização, adaptação, integração externa, trabalho manual, desenvolvimento próprio ou recusa.
6. O usuário ou responsável autorizado decide se vale prosseguir, considerando custo, risco, tempo e valor.
7. Se aprovada, Céu/Dark Factory recebe especificação e escopo limitados.
8. O trabalho ocorre em ambiente isolado com dados de teste.
9. Testes funcionais, segurança, compatibilidade e regressão produzem evidências.
10. A revisão determina se o resultado é insuficiente, temporário, piloto ou candidato a capacidade permanente.
11. A aprovação apropriada autoriza apenas o escopo especificado.
12. O catálogo é atualizado com versão, estado, limites e responsável; a necessidade original retoma o planejamento.

**Bloqueios:** pesquisa inconclusiva, dependência indisponível, custo sem autorização, requisito crítico ausente, teste reprovado ou risco inaceitável.

## 4. Fluxo C — Solução temporária para um cliente

1. O contrato define escopo, prazo ou condição de expiração, dados permitidos, entregável e aceite.
2. WordDark liga a solução ao contrato e ao tenant correto.
3. A solução temporária recebe permissões mínimas e não é exposta como capacidade geral.
4. O sistema registra versão, dependências, monitoramento e plano de desativação.
5. O cliente ou responsável avalia o entregável segundo critérios definidos.
6. Ao expirar ou concluir, o módulo é desativado, ou sua permanência é revisada formalmente.
7. Se houver promoção a capacidade reutilizável, a solução passa pelo fluxo de promoção e revisão de dados/segredos para garantir que nenhum dado do cliente seja reutilizado indevidamente.

**Regra:** o término de um contrato não deve deixar acesso, credencial ou tarefa ativa sem proprietário.

## 5. Fluxo D — Promover solução a capacidade permanente

1. Reunir uso observado, testes, falhas, custos e evidências.
2. Verificar licença, origem, dependências, compatibilidade e manutenção.
3. Definir proprietário, versão, suporte, política de atualização e plano de retirada.
4. Testar em ambiente separado e verificar regressão.
5. Revisar riscos e impacto para todos os consumidores previstos.
6. Obter aprovação conforme a política.
7. Publicar a nova versão no catálogo como ativa para um escopo definido.
8. Manter versão anterior e estratégia de retorno quando tecnicamente viável.
9. Monitorar resultados e suspender roteamento caso critérios de saúde deixem de ser atendidos.

## 6. Fluxo E — Solicitação externa via Shadoweb/conector

1. O sistema identifica a finalidade e o provedor.
2. A Central de Conexão valida registro, credenciais disponíveis, escopo, custo, limite e ambiente.
3. A política verifica se leitura, escrita ou ação externa estão autorizadas.
4. O conector executa somente a operação contratada; no modo simulado, não alcança serviço real.
5. O resultado informa status, fonte, identificador de rastreamento e erro quando houver.
6. A auditoria registra a operação sem copiar segredos para logs.
7. Uma falha de autenticação, limite ou API inexistente vira bloqueio e instrução de recuperação; não deve acionar tentativa de contornar controles.

## 7. Fluxo F — Alteração em sistema já ativo

1. Registrar a versão atual, a mudança solicitada e a razão.
2. Calcular quais contratos, consumidores, dados e permissões são afetados.
3. Criar uma versão isolada e executar testes de contrato e regressão.
4. Mostrar diferenças, riscos, resultados e plano de retorno.
5. Obter aprovação específica para o ambiente de destino.
6. Aplicar mudança dentro do escopo aprovado.
7. Verificar saúde e resultados reais.
8. Se falhar, suspender novas operações e executar rollback/compensação aprovada ou solicitar intervenção humana.
9. Registrar o desfecho e atualizar a versão do catálogo.

Uma aprovação antiga não autoriza uma alteração materialmente diferente.

## 8. Fluxo G — Falha parcial ou resultado desconhecido

1. Marcar operação como falha, pendente de verificação ou parcialmente concluída; nunca como sucesso presumido.
2. Impedir repetição ilimitada.
3. Consultar o destino usando o identificador de correlação quando seguro.
4. Se idempotência garantir repetição sem duplicação, permitir nova tentativa dentro dos limites.
5. Se houver risco de duplicação, compromisso externo ou efeito irreversível, interromper e exigir revisão humana.
6. Registrar evidência, estado recuperado e ações pendentes.

## 9. Fluxo H — Comunicação entre apps

1. O app de origem cria mensagem compatível com schema e versão.
2. O mecanismo de integração autentica origem e destino.
3. O destinatário verifica escopo e permissão, não apenas o nome declarado no payload.
4. O validador rejeita versão ou conteúdo inválido.
5. O destino processa conforme a máquina de estados e retorna aceitação, rejeição ou resultado.
6. Eventos de mudança são publicados separadamente de comandos.
7. A auditoria mantém correlação entre solicitação, aprovação, operação e resultado.

Nenhum app deve ler arquivos internos de outro app como atalho de integração.

## 10. Critério de aceite dos fluxos

Antes da primeira operação real, cada fluxo usado deve passar por cenário positivo, permissão negada, dados incompletos, falha de dependência, repetição, cancelamento e evidência insuficiente. Os cenários não usados ficam documentados e bloqueados até serem implementados e testados.
