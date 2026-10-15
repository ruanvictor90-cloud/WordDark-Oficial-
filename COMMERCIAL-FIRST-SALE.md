# WordDark — primeiro ciclo operacional manual

**Objetivo:** começar a usar o mundo com um serviço pequeno, verificável e sem investimento inicial. Este roteiro é operacional, não uma declaração de que todas as integrações estão ativas.

## Estado real da versão publicada

- A interface WordDark permite registrar solicitações, encaminhar trabalhos para a fila da Dark Factory, editar e revisar entregas, exportar um pacote Markdown, registrar movimentos locais no Cofre e organizar dados comerciais.
- Esses registros da interface são armazenados no navegador atual. Eles não sincronizam automaticamente entre aparelhos nem constituem uma base comercial compartilhada.
- O encaminhamento para a Dark Factory prepara um trabalho e mantém seu histórico local; não significa que um executor remoto produziu o material.
- Exportar um pacote não envia nada ao cliente. Contato, proposta, aceite, produção/revisão e entrega devem continuar manuais.
- O Cofre é um registro interno de planejamento. Não verifica saldo bancário, não movimenta dinheiro e não confirma recebimentos por conta própria.
- Publicação automática, cobrança automática, integrações externas e execução em produção devem permanecer desligadas até existir backend real, identidade, autorização, auditoria e teste no ambiente implantado.

## Serviço-piloto recomendado

**Pacote básico de conteúdo para pequeno negócio ou criador**

- 3 textos curtos de publicação com chamada para ação.
- 1 roteiro de vídeo vertical de 30–45 segundos.
- 1 revisão curta da bio/apresentação do perfil.
- Entrega em documento para o cliente revisar e publicar.
- Uma rodada de ajustes, dentro do escopo acordado.

Faixa inicial de teste: **R$ 50–100 pelo pacote**, apenas como hipótese a validar — não como preço garantido de mercado. Não incluir filmagem, edição avançada, publicação na conta do cliente, anúncios, garantia de vendas/seguidores ou revisões ilimitadas.

## Procedimento de ponta a ponta

1. **Captação — Terra / Empresa comercial:** escolha um negócio com uma necessidade pública e observável. Faça contato individual e personalizado; não use disparos em massa.
2. **Registrar a necessidade:** no WordDark, abra o fluxo de solicitação comercial, descreva o problema, o resultado desejado, o prazo e as limitações. Não inclua senhas, dados sensíveis ou informações privadas desnecessárias.
3. **Qualificar manualmente:** confirme o produto/serviço a divulgar, o público, o tom, as informações obrigatórias, quem aprova e o prazo realista.
4. **Enviar proposta fora do sistema:** informe entregáveis, preço, prazo, uma rodada de ajustes, exclusões e forma de pagamento. Guarde a mensagem de aceite como referência; não comece sem aceite explícito.
5. **Preparar a execução:** encaminhe a solicitação para a Dark Factory na interface. Confira o briefing gerado e complete público, tom, plataforma e objetivo.
6. **Produzir de verdade:** escreva ou cole o material produzido no editor da entrega. A fila organiza o trabalho; ela não substitui a produção humana.
7. **Revisar:** confira nomes, fatos, ortografia, direitos de uso e regras da plataforma. Salve a entrega. Só marque como aprovada/concluída se o conteúdo estiver presente e as verificações exigidas estiverem marcadas.
8. **Exportar e entregar:** exporte o pacote Markdown, abra o arquivo e confira o conteúdo. Envie-o manualmente ao cliente por um canal combinado.
9. **Registrar o resultado:** registre a referência da entrega e o aceite do cliente. No Cofre, lance separadamente valores efetivamente recebidos e despesas reais, usando uma descrição que permita auditoria. Não registre proposta ou fatura como dinheiro recebido.
10. **Fechar o trabalho:** calcule receita recebida menos custos diretos registrados; reserve valores necessários para obrigações conhecidas antes de decidir qualquer reinvestimento. Registre horas, ajustes e aprendizado.

## Mensagem de contato — personalizar antes de enviar

> Oi! Vi [observação verdadeira e específica sobre o negócio] e pensei numa forma simples de organizar melhor a apresentação de vocês. Estou testando um pacote com 3 textos para publicações, 1 roteiro curto de vídeo e uma revisão da bio, tudo entregue em documento para vocês revisarem e publicarem. Inclui uma rodada de ajustes. O valor inicial fica entre R$ 50 e R$ 100, conforme o escopo. Posso preparar uma ideia de exemplo, sem compromisso?

Não diga que analisou algo que não viu. Não prometa crescimento, vendas ou alcance. Se o cliente pedir algo fora do pacote, negocie novo escopo antes de aceitar.

## Registro mínimo por trabalho

- Identificador do pedido e do cliente.
- Escopo e versão da proposta aceita.
- Referência e data do aceite do cliente.
- Entregáveis e versão entregue.
- Referência do envio e confirmação do cliente.
- Valor contratado, valor faturado e valor recebido — campos distintos.
- Despesas, taxas, horas de trabalho e retrabalho.
- Resultado e próximo passo.

## Critério para automatizar depois

Automatize apenas uma etapa repetitiva após observar trabalhos reais e medir tempo, custo, erros e retrabalho. Não ligue uma integração externa apenas porque existe um módulo ou um teste com mocks. Antes de ativar backend compartilhado, valide credenciais, identidade, autorização, persistência, auditoria, idempotência, recuperação e desligamento de emergência.

**Regra desta fase:** o WordDark pode coordenar e registrar o piloto; uma pessoa ainda autoriza, executa, revisa, envia e confirma as ações externas.
