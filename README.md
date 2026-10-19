# ECOSSISTEMA — Linha oficial de planejamento

**Estado:** planta arquitetural em consolidação; nenhum aplicativo novo foi implementado nesta linha.  
**Início da linha:** 2026-10-19.

## Regra de origem

A branch `ecossistema` é a linha limpa de planejamento e desenvolvimento futuro. Ela contém documentação e schemas, sem interfaces ou motores legados.

O estado anterior foi preservado na branch `legado-arquivado-2026-10-19`. A branch `main` acompanha a linha limpa do ECOSSISTEMA. A documentação não comprova que a publicação web esteja desativada; a configuração de GitHub Pages precisa ser verificada separadamente.

## Visão

Construir sistemas independentes que se comuniquem por contratos, permissões e resultados verificáveis.

- **darkHub:** central pessoal, catálogo, supervisão e ciclo de desenvolvimento.
- **WordDark Hub:** experiência de gestão empresarial dentro de darkHub, com limites próprios.
- **Shadow:** inteligência, planejamento e preparação de soluções.
- **Shadoweb:** navegação, pesquisa e conectores permitidos.
- **WordDark:** mundo empresarial independente, com núcleo WordDark, Céu e Terra.
- **Central de Conexão:** governança de integrações dentro do WordDark.
- **Céu / Dark Factory:** produção controlada de soluções e capacidades.
- **Terra:** demanda, clientes, canais e empresas por nicho.
- **Apps especializados:** entram quando uma necessidade justificar sua existência.

## Documentos oficiais

1. `docs/01-ARQUITETURA-GERAL.md` — limites e arquitetura geral.
2. `docs/02-CONTRATOS-E-COMUNICACAO.md` — contratos, eventos e mensagens.
3. `docs/03-SEGURANCA-E-MUDANCAS.md` — permissões, risco e evolução controlada.
4. `docs/04-PLANO-DE-IMPLEMENTACAO.md` — fases propostas para construção futura.
5. `docs/05-LIMITE-DO-LEGADO.md` — separação da linha antiga.
6. `docs/06-WORDDARK-NASCIMENTO-ZERO.md` — mundo empresarial iniciado vazio.
7. `docs/07-ENTRADA-DE-CLIENTES-E-CONTRATOS.md` — entrada e rastreabilidade de contratos.
8. `docs/08-MODULOS-E-CONTRATOS-DO-NUCLEO.md` — módulos e contratos do núcleo.
9. `docs/09-MAPA-MESTRE-DE-MUNDOS-SETORES-APPS.md` — mapa de mundos, setores e aplicativos.
10. `docs/10-CICLO-DE-CRIACAO-DE-SOLUCOES.md` — descoberta, desenvolvimento e promoção de soluções temporárias, pilotos e capacidades permanentes.
11. `docs/11-PLANTA-FUNCIONAL-POR-SISTEMA.md` — responsabilidades, entradas, saídas e critérios por sistema.
12. `docs/12-MOTORES-E-DEPENDENCIAS.md` — motores lógicos e dependências.
13. `docs/13-PORTAO-DE-VALIDACAO-DA-PLANTA.md` — checklist antes de implementar.
14. `docs/14-FLUXOS-DE-PONTA-A-PONTA.md` — cenários completos, bloqueios e recuperação.
15. `docs/15-REGISTRO-DE-DECISOES-E-PENDENCIAS.md` — decisões, propostas e perguntas abertas.
16. `docs/16-DADOS-ESTADOS-E-EVIDENCIAS.md` — propriedade de dados, estados e evidências.
17. `docs/17-MATRIZ-DE-RISCO-E-APROVACAO.md` — níveis de risco, autorizações e limites de autonomia.
18. `docs/18-ESTRATEGIA-DE-AMBIENTES-E-VERSOES.md` — ambientes, versionamento, implantação e retorno.
19. `docs/19-REVISAO-DE-CONSISTENCIA-ARQUITETURAL.md` — invariantes, riscos de interpretação e pendências para a aprovação.
20. `docs/20-MATRIZ-DE-TESTES-E-ACEITE.md` — cenários positivos/negativos, critérios de aceite e evidências exigidas.

## Schemas legíveis por máquina

- `schemas/need.schema.json`: estrutura validável de uma necessidade.
- `schemas/capability.schema.json`: declaração de capacidade.
- `schemas/operation.schema.json`: envelope de operação.

Os schemas são uma base inicial; ainda precisam de testes comportamentais e não representam motores implementados.

## Ciclo de criação de soluções

Quando não houver capacidade suficiente: identificar lacuna → pesquisar alternativas com Shadow/Shadoweb → comparar custo e risco → autorizar desenvolvimento → produzir em ambiente isolado → testar → revisar evidências → aprovar conforme risco → usar como solução temporária, piloto ou capacidade permanente. Plano ou protótipo nunca equivale automaticamente a capacidade ativa.

## Regra de trabalho

Antes de implementar um recurso, registrar domínio responsável, objetivo, entradas, saídas, dados, permissões, dependências, testes, riscos e critério de conclusão. Não copiar código ou interfaces legadas sem análise explícita e revisão de segurança/arquitetura.

## Estado da planta

Os documentos 09–20 ampliam o mapa, o ciclo de soluções, as fichas funcionais, os motores, os fluxos, os dados, a política de aprovação, a estratégia de versões, a revisão de consistência e a matriz de testes. A planta ainda exige execução futura dos testes, resolução das pendências que afetam o escopo inicial e aprovação explícita do portão. Não iniciar motores ou aplicativos antes desse portão.
