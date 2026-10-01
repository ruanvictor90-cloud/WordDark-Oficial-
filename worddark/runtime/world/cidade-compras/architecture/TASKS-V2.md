# Cidade de Compras — Tasks V2

## Regra de operação
- [x] Desenvolver somente na branch develop.
- [ ] Integrar em staging somente após revisão.
- [ ] Não alterar main durante esta fase.

## Fundação
- [x] Identidade da cidade como operação da Terra.
- [x] Responsabilidades dos setores.
- [x] Limite Terra/Céu.
- [x] Serviços externos declarados.
- [x] Contrato V1 da cidade.
- [x] Modelo de canais multicanal.
- [x] Modelo de resultado de serviço.
- [x] Vínculo operação ↔ recursos.

## Portão
- [x] Entrada.
- [x] Identidade.
- [x] Papel do ator.
- [x] Autorização.
- [x] Roteamento.
- [x] Integração com contrato de permissões.
- [ ] Permissões específicas por setor.
- [ ] Logs completos do ciclo.

## Comunicação
- [x] Contrato multicanal.
- [x] Site.
- [x] Redes sociais.
- [x] Mensageria.
- [x] Marketplaces.
- [x] Canal futuro via tipo OTHER.
- [ ] Adaptadores reais por plataforma.
- [ ] Conversa persistente vinculada à operação.

## Atendimento
- [x] Identificação.
- [x] Intenções.
- [x] Busca de catálogo (contrato preparado).
- [x] Resposta.
- [x] Construção de carrinho (contrato preparado).
- [x] Confirmação.
- [x] Handoff humano.
- [ ] Motor de atendimento real.

## Comércio
- [x] Produto.
- [x] Carrinho.
- [x] Pedido.
- [x] Estados do pedido.
- [x] Máquina de transição do pedido.
- [x] Cancelamento (transição).
- [x] Reembolso (transição).
- [ ] Estoque/validação de disponibilidade.
- [ ] Checkout real.

## Central de Contas
- [x] Cobrança.
- [x] Recebimento.
- [x] Reembolso.
- [x] Repasse.
- [x] Reconciliação.
- [ ] Gateway de pagamento real.
- [ ] Ledger financeiro persistente.

## Fornecedores e logística
- [x] Cadastro de fornecedor.
- [x] Pedido ao fornecedor.
- [x] Envio do pedido.
- [x] Remessa.
- [x] Rastreamento.
- [x] Entrega.
- [x] Exceções.
- [ ] Adaptadores reais de fornecedor/transportadora.

## Pós-venda e ocorrências
- [x] Troca.
- [x] Devolução.
- [x] Reembolso.
- [x] Ocorrência.
- [x] Recuperação.
- [x] Requeue/escalonamento básico.
- [ ] Políticas comerciais configuráveis.

## Serviços do Céu
- [x] Contrato de solicitação externa.
- [x] Rota Terra → Rodovia → Céu.
- [x] Serviço MARKETING.
- [x] Serviço DARK_FACTORY.
- [x] Contrato de resultado.
- [x] Recebimento de resultado.
- [ ] Integração real com os serviços do Céu.

## Biblioteca
- [x] Registro de histórico operacional.
- [x] Registro de resultados.
- [x] Registro de ocorrências.
- [x] Registro de aprendizados.
- [x] Formato preparado para Biblioteca Central.
- [ ] Persistência central real.

## Interface
- [x] Estrutura UI existente.
- [x] Separação entre entrada, painel e setores.
- [ ] Portão visual.
- [ ] Painel operacional.
- [ ] Setores navegáveis.
- [ ] Operações.
- [ ] Histórico.
- [ ] Erros.
- [ ] Estados de carregamento.

## Testes
- [x] Teste de fronteira Terra/Céu.
- [x] Teste de autorização do portão.
- [x] Teste estrutural V1.
- [x] Teste multicanal.
- [x] Teste fornecedor/logística.
- [x] Teste pós-venda.
- [x] Teste recuperação de ocorrência.
- [x] Teste Marketing → Dark Factory.
- [x] Teste contrato de serviço.
- [ ] Fluxo comercial completo com pedido real.
- [ ] Suite completa executada localmente/CI.

## Critério de saída da V1
A Cidade de Compras deve operar seu fluxo comercial de ponta a ponta e solicitar serviços externos sem incorporar responsabilidades do Céu.

### Ordem de fechamento
1. Motor comercial completo.
2. Integração do runtime com a máquina de estados do pedido.
3. Persistência/logs.
4. Interface operacional.
5. Suite completa.
6. Revisão estrutural.
7. Candidato a staging.

> Esta checklist descreve estrutura e pendências. Um item marcado não significa que uma integração externa real já esteja disponível.
