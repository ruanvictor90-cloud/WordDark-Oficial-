# 15 — Registro de decisões e pendências arquiteturais

**Estado:** registro vivo. Atualizar quando o usuário confirmar uma decisão ou quando uma proposta for aprovada. Uma proposta escrita não é automaticamente uma decisão do usuário.

## 1. Decisões registradas no contexto atual

| ID | Decisão | Efeito na arquitetura | Estado |
|---|---|---|---|
| D-001 | ECOSSISTEMA é a linha limpa; não herdar interfaces ou código antigo automaticamente | Código antigo permanece arquivo/referência, sujeito a análise explícita | Definido |
| D-002 | darkHub é a central pessoal e coordena sem possuir acesso irrestrito aos outros apps | Domínio, dados e execução permanecem separados | Definido |
| D-003 | WordDark Hub é acessado dentro de darkHub, mas mantém domínio/código próprios | Experiência de gestão não substitui o núcleo WordDark | Definido |
| D-004 | WordDark começa sem empresas, fábricas ou clientes operacionais reais pré-cadastrados | Núcleo preparado para cadastrar e validar entidades futuras | Definido |
| D-005 | WordDark se organiza em núcleo WordDark, Céu e Terra | Governança/coordenação, produção e demanda têm fronteiras distintas | Definido |
| D-006 | Central de Conexão pertence ao WordDark, não a Céu | Catálogo e governo de conectores ficam no domínio empresarial central | Definido |
| D-007 | Shadow planeja e prepara soluções; Shadoweb pesquisa e conecta por meios permitidos | Pesquisa e planejamento não equivalem a execução autorizada | Definido |
| D-008 | Soluções podem ser temporárias ou permanentes; piloto é estado distinto | Ciclo de vida e promoção exigem critérios e evidências | Definido como direção |
| D-009 | Ações de alto risco, externas, financeiras ou irreversíveis exigem aprovação humana explícita | Não há autonomia irrestrita | Definido |
| D-010 | APIs pagas e infraestrutura adicional não são padrão antes de comprovar necessidade/valor | Primeira versão favorece modo manual, local ou simulado | Definido |
| D-011 | O usuário quer finalizar a planta antes de começar a construir motores e apps | Implementação aguarda revisão e aprovação explícita do escopo | Definido |
| D-012 | Empresas sociais e comerciais pertencem a Terra | Operação comercial não é parte do núcleo WordDark | Definido |

## 2. Propostas de arquitetura a revisar

| ID | Proposta | Motivo | Estado |
|---|---|---|---|
| P-001 | Usar identificadores de tenant e verificar isolamento no lado confiável | Evitar exposição de dados entre clientes | Proposta técnica |
| P-002 | Tratar evento, comando, consulta e resultado como tipos distintos | Evitar execução acidental por recebimento de evento | Proposta técnica |
| P-003 | Usar máquina de estados explícita e schemas versionados | Evitar estados inconsistentes e integração frágil | Proposta técnica |
| P-004 | Construir primeiro um executor simulado e testes negativos | Validar fluxo antes de tocar em serviços reais | Proposta de implementação |
| P-005 | Promover capacidades temporárias a permanentes somente após evidência e revisão | Evitar dependências não sustentáveis | Proposta técnica |
| P-006 | Manter módulos lógicos separados mesmo que inicialmente compartilhem artefato ou repositório | Equilibrar clareza arquitetural e recursos limitados | Proposta técnica |

## 3. Pendências de produto e nomenclatura

| ID | Pergunta | Por que importa | Pode bloquear toda a planta? |
|---|---|---|---|
| Q-001 | Qual é o escopo exato do Banco empresarial, e qual é a fronteira com finanças operacionais? | Evitar confusão entre registros internos e movimentação financeira | Não; bloqueia o módulo financeiro |
| Q-002 | “Captação” é o nome final e qual o fluxo exato de captação? | Define origem, dados e transição para contrato | Não; bloqueia esse módulo |
| Q-003 | DarkAccount representa conta, identidade, perfil empresarial ou mais de um domínio? | Identidade e perfil não devem se misturar sem limites | Não; bloqueia esse módulo |
| Q-004 | Quais apps pessoais entram na primeira versão do darkHub? | Define catálogo e dependências iniciais | Bloqueia o escopo final da primeira versão do darkHub, não a planta inteira |
| Q-005 | Qual é o primeiro serviço/entregável real a ser vendido? | Permite validar um caso pequeno com critérios concretos | Bloqueia seleção do primeiro piloto real |
| Q-006 | Qual mecanismo de identidade/autenticação será usado no primeiro ambiente? | É essencial para autorização real | Bloqueia operação real que exija identidade |
| Q-007 | Qual persistência, backup e recuperação são viáveis no primeiro ambiente? | Afeta confiabilidade e proteção de dados | Bloqueia dados de produção até decidir |
| Q-008 | Quais fontes de dados e integrações estão disponíveis legal e tecnicamente? | Evita planejar conectores impossíveis ou não autorizados | Bloqueia conectores específicos |
| Q-009 | Quais regras de expiração e manutenção serão padrão para soluções temporárias? | Evita recursos esquecidos e acessos residuais | Deve ser resolvido antes de usar temporários reais |

## 4. Regras para resolver pendências

- Não interromper o mapa inteiro por pergunta que afeta somente um módulo futuro.
- Não tratar silêncio como aprovação.
- Não transformar proposta técnica em decisão do usuário sem confirmação quando afetar escopo, risco ou produto.
- Registrar decisão, razão, sistemas afetados, versão da planta e data.
- Se uma decisão contradizer documento anterior, atualizar o documento afetado e o registro, sem manter instruções conflitantes.
- Perguntas críticas de segurança, identidade, dados e autorização devem ser resolvidas antes de operação real no escopo correspondente.

## 5. Estado de maturidade da planta

Neste momento, a planta tem arquitetura geral, contratos iniciais, núcleo WordDark, entrada de contratos, mapa mestre, ciclo de criação de soluções, fichas funcionais iniciais, mapa de motores, fluxos ponta a ponta e portão de validação. Ainda não está aprovada como especificação final: há pendências de produto, revisões de consistência e detalhes técnicos de identidade, armazenamento, conectores e primeiro caso real.

## 6. Critério de manutenção

Toda mudança arquitetural relevante deve atualizar este registro e os documentos afetados. A ausência de atualização é tratada como possível divergência a revisar antes da implementação.
