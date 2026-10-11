# Fundação de captação de trabalho — etapa anterior ao Dark

**Status:** fundação de domínio isolada; sem interface, sem conectores e sem execução real.

Esta camada prepara a entrada organizada de necessidades de clientes e negócios. Ela não é o Dark, não cria Shadow, não classifica ideias por IA e não executa pedidos. O limite desta etapa é entregar contratos de pedido, catálogo, propostas, aceite explícito e ciclo de estados para que a criação futura do Dark possa ser decidida sobre uma base clara.

## Experiência pretendida

A descoberta de serviços deve parecer um catálogo navegável, no espírito de uma biblioteca de categorias — sem copiar a interface ou a marca de qualquer plataforma. O cliente escolhe uma categoria, explica a necessidade e escolhe como quer pedir:

- **Entrega definida:** escopo e resultado já conhecidos.
- **Tenho uma ideia:** o cliente descreve o objetivo e precisa de ajuda para definir o escopo.
- **Consulta:** orientação ou análise especializada.
- **Recorrente:** serviço com frequência acordada.
- **Urgente:** prazo curto que o prestador ainda precisa confirmar.

O catálogo inicial inclui conteúdo, escrita, design, edição, localização/legendas, marketing, automação, sites/aplicativos, comércio, pesquisa, consultoria e suporte. As categorias são dados de catálogo e podem crescer sem reescrever o motor de pedidos.

## Pedido mínimo

Cada pedido possui título, categoria, tipo, descrição, identificador da origem, orçamento, prazo opcional e indicadores de risco. O orçamento aceita valor fixo, faixa, pedido de orçamento ou valor ainda indefinido. A moeda desta fundação é BRL. Pedidos recorrentes precisam indicar a frequência.

## Proposta e aceite

Uma proposta declara prestador, escopo, entregas, modelo de preço, valor, duração estimada, pressupostos, exclusões e validade. O aceite precisa ser uma ação explícita do solicitante. **Aceitar uma proposta não autoriza automaticamente uma ação externa, pagamento, publicação ou acesso a conta.** A autorização para iniciar a execução é um passo separado e auditável.

## Ciclo de vida

`rascunho → enviada → detalhes pendentes/ pronta para encaminhamento → propostas abertas → proposta selecionada → autorização explícita → em andamento → revisão → concluída`

Cancelamento e arquivamento são caminhos próprios. Não é permitido pular etapas.

## Risco, concorrência e preço

- Os indicadores de risco (publicação pública, acesso a conta externa, direitos/licenças, dados pessoais, compromisso financeiro, segurança ou conformidade legal) desviam o pedido para revisão manual; não são aprovados automaticamente.
- Concorrência futura deve comparar propostas pelo escopo, entregas, preço, prazo, recorrência, experiência/evidências e riscos — não apenas pelo menor preço.
- O preço anunciado não deve ser tratado como preço garantido até existir proposta com escopo definido.
- A recorrência deve deixar explícitos período, entregas por ciclo, preço por ciclo, cancelamento e renovação antes de qualquer cobrança.
- Esta etapa não implementa pagamento, ranking público, reputação, disputa ou verificação de prestadores; essas decisões continuam pendentes.

## Fronteiras desta etapa

Incluído: catálogo de categorias, validação de pedido, decisão inicial de revisão, contrato de proposta, aceite explícito e máquina de estados.

Fora do escopo: telas, app Dark, Shadow, triagem por IA, contas de usuários reais, banco de dados, pagamentos, mensagens externas, roteamento real pela Rodovia, execução pela Dark Factory, publicação e conectores sociais.

A identidade do solicitante é representada por um identificador opaco; este módulo não precisa receber senha, token, documento pessoal ou credenciais externas.

## Testes

Execute na raiz do repositório:

```bash
node --test worddark/captacao/capture.test.js
```

Esta fundação deve ser revisada e testada antes de ser ligada a qualquer interface ou runtime existente.
