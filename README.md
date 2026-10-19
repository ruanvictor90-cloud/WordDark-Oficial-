# ECOSSISTEMA — Linha oficial de desenvolvimento

**Estado:** arquitetura em definição; nenhum aplicativo novo foi implementado nesta linha ainda.  
**Data de início:** 2026-10-19.

## Regra de origem

A branch `ecossistema` é a linha limpa de planejamento e desenvolvimento futuro. Ela começa apenas com documentação arquitetural, sem interfaces, motores ou aplicativos legados.

O estado anterior foi preservado na branch `legado-arquivado-2026-10-19`. A branch `main` agora aponta para a linha limpa do ECOSSISTEMA. O histórico anterior continua acessível pela branch de arquivo.

## Visão

Construir um ecossistema de aplicativos independentes, capazes de se comunicar por contratos explícitos, permissões e resultados verificáveis.

- **darkHub:** central pessoal, supervisão e coordenação do ecossistema.
- **WordDark Hub:** área de gestão do mundo empresarial, acessível dentro do darkHub, mas com código e domínio próprios.
- **Shadow:** assistente de inteligência, planejamento e execução autorizada.
- **Shadoweb:** navegador, pesquisa e conectividade com recursos internos e externos.
- **WordDark:** ecossistema empresarial independente, organizado em WordDark, Céu e Terra.
- **Outros apps:** aplicações especializadas, cada uma com escopo próprio.

## Documentos oficiais

1. `docs/01-ARQUITETURA-GERAL.md`
2. `docs/02-CONTRATOS-E-COMUNICACAO.md`
3. `docs/03-SEGURANCA-E-MUDANCAS.md`
4. `docs/04-PLANO-DE-IMPLEMENTACAO.md`
5. `docs/05-LIMITE-DO-LEGADO.md`
6. `docs/06-WORDDARK-NASCIMENTO-ZERO.md`
7. `docs/07-ENTRADA-DE-CLIENTES-E-CONTRATOS.md`

## Princípio do WordDark

O WordDark nasce sem empresas, fábricas ou clientes operacionais pré-cadastrados, mas com as capacidades fundamentais para registrar necessidades, cadastrar entidades, validar contratos, gerir permissões, coordenar operações, exigir aprovações, auditar resultados e tratar falhas. Novas capacidades entram como módulos com contratos, testes e critérios próprios.

## Regra para qualquer novo trabalho

Antes de implementar um recurso, registrar: domínio responsável, objetivo, entradas, saídas, dados que possui, permissões, dependências, testes e critério de conclusão.

Não copiar código ou interfaces legadas para esta linha sem análise explícita, decisão registrada e revisão de segurança/arquitetura.
