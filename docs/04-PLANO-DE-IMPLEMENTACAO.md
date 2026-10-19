# 04 — Plano de implementação

**Status:** plano oficial inicial; etapas não iniciadas até que cada uma seja implementada e verificada.

## Fase 0 — Preservação e linha limpa

- Preservar o estado antigo em uma referência identificada como legado.
- Manter a branch `ecossistema` separada e sem interfaces/motores antigos.
- Registrar decisões arquiteturais antes de escrever código de aplicação.
- Manter a branch principal sincronizada com a linha limpa somente por avanço controlado; não publicar a nova linha automaticamente.

**Conclusão:** legado recuperável; main e ecossistema devem conter a linha limpa documentada, sem publicar automaticamente.

## Fase 1 — Especificação e inventário

- Confirmar responsabilidades, limites, dependências e fluxos.
- Definir identificadores, contratos, eventos, permissões e estados.
- Fazer inventário técnico dos artefatos antigos somente para consulta.
- Classificar cada artefato como referência, reaproveitamento candidato ou não reaproveitar.
- Não copiar nada automaticamente para a nova linha.

**Conclusão:** decisões registradas e dúvidas de arquitetura identificadas.

## Fase 2 — Fundação mínima do darkHub

Implementar primeiro um núcleo pequeno:
- catálogo de sistemas e versões;
- estado de saúde declarado com evidência;
- registro de eventos e solicitações;
- controle de permissões;
- trilha de auditoria;
- validação dos contratos.

Não começar por IA própria, automação ampla, publicação externa ou um grande painel visual.

**Conclusão:** testes comprovam registro, autorização, rejeição de operação não permitida e retorno de resultado.

## Fase 3 — Experiência do darkHub

Redesenhar a navegação com base nos casos de uso confirmados. A interface contém o acesso ao WordDark Hub, mas cada área mantém implementação e limites próprios. A interface não deve simular funções ainda inexistentes.

**Conclusão:** fluxos principais testados em dispositivo móvel e estados reais conectados ao núcleo.

## Fase 4 — Integração por prioridade

Integrar um domínio por vez, começando pelo que for mais útil e viável. Para cada integração, definir contrato, permissões, testes, falhas e critérios de aceitação antes de ligar o próximo sistema.

Sequência de referência:
1. darkHub e registro/monitoramento;
2. WordDark Hub e WordDark;
3. Shadow;
4. Shadoweb e conectores;
5. apps e empresas adicionais.

A ordem pode mudar somente por decisão documentada baseada em dependências ou valor demonstrado.

## Fase 5 — Operação assistida

- Preparar planos e entregáveis.
- Usar simulação ou modo manual antes de executar operações externas.
- Exigir aprovação conforme risco.
- Medir custo, confiabilidade e valor antes de contratar APIs pagas.
- Habilitar automação gradualmente, com evidência e recuperação.

## Regra de conclusão de fase

Uma fase só é considerada concluída quando houver: escopo definido, código identificado, testes executados, limitações conhecidas, evidência do resultado e registro de versão. Documentação ou interface visual sozinha não comprova funcionamento.
