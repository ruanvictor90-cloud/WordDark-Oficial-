# 13 — Portão de validação da planta antes da implementação

**Estado:** checklist de revisão obrigatório.  
**Finalidade:** impedir que a implementação comece enquanto decisões essenciais estiverem espalhadas, contraditórias ou implícitas.

## 1. Regra de entrada

A implementação de motores e aplicativos só começa depois de uma revisão consolidada da planta e da decisão explícita do usuário de iniciar a fase de construção. A existência deste checklist ou de documentação publicada não significa que o portão já foi aprovado.

## 2. Critérios de arquitetura geral

- [ ] Todos os mundos e domínios estão listados.
- [ ] Cada sistema tem um único proprietário para cada regra de negócio.
- [ ] Limites entre darkHub, WordDark Hub e núcleo WordDark estão claros.
- [ ] Céu, Terra e Central de Conexão têm fronteiras sem sobreposição indevida.
- [ ] Shadow e Shadoweb têm papéis complementares e limites de permissão.
- [ ] Apps futuros estão separados de escopo da primeira versão.
- [ ] Termos duplicados ou nomes indefinidos estão resolvidos ou marcados como pendência.

## 3. Critérios por sistema

- [ ] Objetivo e não objetivos definidos.
- [ ] Entradas, saídas e fontes de dados definidas.
- [ ] Proprietário de dados e regras de isolamento definidos.
- [ ] Permissões e classe de risco definidas.
- [ ] Estados e transições permitidas definidos.
- [ ] Contratos, eventos e versões definidos.
- [ ] Dependências e comportamento de falha definidos.
- [ ] Testes e critérios de aceite definidos.
- [ ] Estratégia de atualização, retirada e recuperação definida.
- [ ] Decisões pendentes registradas sem serem mascaradas.

## 4. Critérios de autonomia e criação de soluções

- [ ] O processo detecta capacidade ausente e gera lacuna explícita.
- [ ] Shadow e Shadoweb podem pesquisar apenas dentro de permissões declaradas.
- [ ] Pesquisa, proposta, protótipo, piloto e capacidade permanente têm estados diferentes.
- [ ] Alterações são testadas em ambiente isolado.
- [ ] Promoção para uso real depende de critérios, evidências e autorização adequada.
- [ ] Ações financeiras, externas, críticas ou irreversíveis exigem confirmação humana.
- [ ] Há expiração/retirada para soluções temporárias e rollback quando viável.
- [ ] O sistema mede custo, uso, falha, retrabalho e valor sem inventar resultados.

## 5. Critérios de segurança e operação

- [ ] Identidade e autorização não dependem apenas de campos enviados pelo cliente.
- [ ] Dados de clientes são isolados em consultas, arquivos, logs e caches.
- [ ] Segredos não aparecem em código, mensagens ou logs.
- [ ] Idempotência e limites de repetição foram definidos.
- [ ] Falhas parciais e timeouts têm estados claros.
- [ ] Auditoria registra decisões e evidências.
- [ ] Existe estratégia de backup e recuperação compatível com a persistência escolhida.
- [ ] O modo simulado não alcança contas ou serviços reais.
- [ ] Nenhum componente pode elevar seus próprios privilégios ou contornar a política.

## 6. Critérios de viabilidade e custo

- [ ] A primeira versão pode ser testada sem API paga.
- [ ] Infraestrutura paga tem justificativa baseada em necessidade e retorno esperado.
- [ ] Operações manuais são declaradas onde não existe integração.
- [ ] O primeiro caso de uso é pequeno, verificável e reversível.
- [ ] O custo de manutenção e a dependência de provedores são visíveis.
- [ ] A implementação pode ser feita e testada com os recursos realmente disponíveis.

## 7. Pendências que podem continuar abertas

Nem toda função futura precisa estar completamente detalhada para a planta ser aprovada. Podem continuar abertas decisões específicas de produto futuro, desde que:
- estejam registradas;
- não alterem a arquitetura central;
- não criem conflito de propriedade;
- não sejam necessárias para o primeiro caso de teste;
- tenham condição clara de resolução antes de sua própria implementação.

Pendências críticas de identidade, dados, autorização, execução e recuperação não podem ser ignoradas no caminho que as utiliza.

## 8. Resultado da revisão

O resultado deve ser registrado como um dos estados:
- **Reprovada:** conflito arquitetural ou risco essencial não resolvido.
- **Aprovada com pendências delimitadas:** a planta geral pode seguir para detalhamento adicional, mas módulos afetados permanecem bloqueados.
- **Aprovada para implementação de escopo definido:** somente o escopo nomeado pode entrar na fase de construção.
- **Revisão necessária:** novas informações alteraram premissas ou limites.

A aprovação precisa identificar versão da planta, escopo, pendências, riscos aceitos, aprovador e data.

## 9. O que significa “planta concluída”

A planta concluída significa que o ecossistema está suficientemente especificado para decidir o que construir, em qual ordem, com quais limites e como verificar a conclusão. Não significa que todos os aplicativos, motores, integrações, modelos de IA ou empresas já estejam construídos.

A implementação é uma fase posterior, com evidências próprias e critérios de aceite por etapa.
