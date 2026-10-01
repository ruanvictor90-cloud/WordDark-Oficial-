# Rodovia

A Rodovia é a principal rede operacional de comunicação do WordDark.

Ela conecta os Portões aos destinos sem exigir que um setor conheça diretamente outro setor.

## Responsabilidade

A Rodovia:
1. recebe pedidos vindos dos Portões;
2. consulta a Central do Mundo;
3. identifica a capacidade necessária;
4. encontra o setor responsável;
5. encaminha o pedido;
6. acompanha o retorno;
7. devolve o resultado ao setor de origem;
8. se não houver capacidade, encaminha o pedido para Criação do Mundo.

## Regra fundamental

Nenhum setor precisa conhecer diretamente outro setor para solicitar algo.

O setor conhece seu Portão. O Portão conhece a Rodovia. A Rodovia conhece as capacidades registradas na Central.

A implementação interna de um setor pode mudar sem obrigar os demais setores a mudar.

## Separação de responsabilidades

- Portão: conexão controlada entre setor e Rodovia.
- Rodovia: comunicação, descoberta de capacidade e roteamento.
- Central do Mundo: catálogo e conhecimento operacional dos setores.
- Destino: execução da solução.
- Criação do Mundo: criação de nova capacidade quando ela não existe.
- Painel Central: autorização de entrada de novas estruturas no mundo.