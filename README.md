# ECOSSISTEMA — Linha oficial de desenvolvimento

**Estado:** planta arquitetural em consolidação; nenhum aplicativo novo foi implementado nesta linha.  
**Data de início:** 2026-10-19.

## Regra de origem

A branch `ecossistema` é a linha limpa de planejamento e desenvolvimento futuro. Ela contém documentação e schemas, sem interfaces ou motores legados.

O estado anterior foi preservado na branch `legado-arquivado-2026-10-19`. A branch `main` acompanha a linha limpa do ECOSSISTEMA. A existência desta documentação não significa que a publicação web esteja desativada; a configuração de GitHub Pages precisa ser verificada separadamente.

## Visão

Construir um ecossistema de sistemas independentes, capazes de se comunicar por contratos explícitos, permissões e resultados verificáveis.

- **darkHub:** central pessoal, catálogo, supervisão e ciclo de desenvolvimento.
- **WordDark Hub:** experiência de gestão do mundo empresarial dentro do darkHub, com limites próprios.
- **Shadow:** inteligência, planejamento e preparação de soluções.
- **Shadoweb:** navegação, pesquisa e conectores permitidos.
- **WordDark:** mundo empresarial independente, organizado em núcleo WordDark, Céu e Terra.
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
13. `docs/13-PORTAO-DE-VALIDACAO-DA-PLANTA.md` — checklist obrigatório antes de implementar.

## Contratos legíveis por máquina

- `schemas/need.schema.json`: estrutura validável de uma necessidade.
- `schemas/capability.schema.json`: declaração de capacidade de uma entidade.
- `schemas/operation.schema.json`: envelope validável de operação.

Os schemas são uma base inicial; ainda precisam de testes comportamentais e não representam motores implementados.

## Princípio de nascimento zero

O WordDark começa sem fábricas, empresas ou clientes operacionais pré-cadastrados. O núcleo é planejado para registrar necessidades, validar capacidades, identificar lacunas, coordenar soluções, controlar permissões, exigir aprovações e auditar resultados.

## Ciclo de criação de soluções

Quando o mundo não tiver capacidade suficiente, o fluxo planejado é: identificar lacuna → Shadow/Shadoweb pesquisam → especificar alternativas e custos → autorizar desenvolvimento → produzir em ambiente isolado → testar → revisar evidências → aprovar conforme risco → usar como solução temporária, piloto ou capacidade permanente. Uma proposta ou protótipo nunca equivale automaticamente a capacidade ativa.

## Regra para qualquer novo trabalho

Antes de implementar um recurso, registrar domínio responsável, objetivo, entradas, saídas, dados, permissões, dependências, testes, riscos e critério de conclusão. Não copiar código ou interfaces legadas sem análise explícita e revisão de segurança/arquitetura.

## Estado da planta

Os documentos 09–13 ampliam o inventário, o ciclo de evolução, as fichas funcionais, o mapa de motores e o portão de validação. A planta ainda exige revisão cruzada, resolução das pendências críticas e aprovação explícita do escopo inicial. Não iniciar motores ou aplicativos antes desse portão.
