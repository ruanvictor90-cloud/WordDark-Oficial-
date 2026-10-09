# WordDark — Arquitetura Geral do Mundo v1

## Autoridade
1. **ADM Dono** — autoridade soberana externa ao WordDark; define limites e pode interromper o mundo. Nunca é uma role interna.
2. **ADM** — administra configurações e operações internas dentro dos limites autorizados.
3. **DEV** — desenvolve, mantém e testa; escrever código não concede autoridade administrativa.
4. **Público** — acessa somente interfaces e serviços publicados.

Nenhuma camada inferior pode criar permissões para uma camada superior. A decisão padrão é negar.

## Trindade e interconexão
- **Mundo / WordDark:** coordenação, segurança, biblioteca, roteamento, auditoria e supervisão.
- **Céu:** produção e soluções — Dark Factory e Marketing.
- **Terra:** empresas, clientes, canais, comércio e operações externas.
- **Rodovia:** transporte interno de mensagens e capacidades; sem painel público próprio.
- **Financeiro:** setor transversal; planos e assinaturas são uma linha separada de monetização.

## Fluxo de operação
`INTENÇÃO → IDENTIFICAÇÃO → AUTORIZAÇÃO → ROTEAMENTO → EXECUÇÃO → VALIDAÇÃO → RESULTADO → MEMÓRIA → RETORNO`

TEST usa simulação e não deve executar conectores reais. Produção exige autenticação confiável, autorização explícita, barreiras server-side e testes aprovados.

## Estado atual
A interface inicial e a primeira fronteira de permissões são protótipos de desenvolvimento. O gateway exige um resolvedor de identidade confiável e handlers conectados ao runtime. Não é um sistema de login completo. A suíte geral ainda precisa ser validada antes de promover qualquer alteração à produção.
