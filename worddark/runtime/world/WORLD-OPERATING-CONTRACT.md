# WordDark — Contrato Operacional Atual

## Regra central
**WordDark coordena. As empresas operam. Os setores executam.**

## Mundo
- Terra: empresas e operações próximas às necessidades reais.
- Céu: empresas especializadas e fábricas.
- Rodovia: transporte interno invisível; não decide, não autoriza e não executa.
- Portões: entrada, contexto, identidade, permissão e saída.
- Central de Operações: ciclo de pedidos, operações, suboperações e resultados.
- Biblioteca: histórico, memória operacional, experimentos e conhecimento validado.
- Financeiro: recursos, movimentos, planos, assinaturas e estado econômico.
- Conexões Externas: adaptadores para o mundo externo; credenciais ficam isoladas.

## Empresas atuais
### Terra
1. Empresa de Gestão de Negócios
2. Empresa de Gestão de Conteúdos e Canais

### Céu
1. Empresa de Marketing
2. Dark Factory — Empresa de Produção de Conteúdo

Central de Conexões Externas é infraestrutura compartilhada, não empresa.

## Linguagem
Pedidos não escolhem diretamente outra empresa. Eles expressam:
- intenção;
- necessidade;
- capacidade;
- serviço;
- contexto.

O catálogo canônico transforma serviços/intents em capacidades. O registro encontra quem possui a capacidade. O coordenador resolve o endpoint operacional. Só então a Rodovia transporta.

## Ciclo
```
INTENÇÃO
  ↓
NECESSIDADE
  ↓
CAPACIDADE
  ↓
EMPRESA
  ↓
ENDPOINT
  ↓
PORTÃO
  ↓
RODOVIA
  ↓
OPERAÇÃO
  ↓
SUBOPERAÇÕES/MÓDULOS
  ↓
RESULTADO
  ↓
MEMÓRIA
  ↓
RETORNO
```

## Memória operacional
Cada operação pode registrar:
- eventos;
- falhas;
- módulo afetado;
- resolução;
- conclusão;
- histórico local;
- promoção de conhecimento para a Biblioteca Central.

Falhas modulares devem permitir reentrada a partir do módulo afetado, sem repetir etapas já concluídas.

## Regra de crescimento
Novas empresas, módulos e integrações entram por capacidade/registro. A arquitetura central não deve ser redesenhada para cada novo negócio.

## Estado atual
A prioridade é provar um circuito operacional ponta a ponta antes de adicionar novas empresas ou integrações desnecessárias.
