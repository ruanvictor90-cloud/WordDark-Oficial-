# WordDark Oficial

Este é o desenvolvimento oficial do mundo.

## Estrutura operacional

- **MAIN** organiza o mundo.
- **WORDDARK** governa, protege, registra, autoriza e coordena.
- **CÉU** concentra capacidades globais organizadas em Domínios autônomos. Cada Domínio segue `Domínio → Região → Núcleo → Distrito`.
- **TERRA** concentra os clientes/ecossistemas e suas operações territoriais.

### Céu

O Céu usa a mesma lógica estrutural da Terra, mas com nomenclatura e finalidade próprias:

`Domínio → Região → Núcleo → Distrito`

Exemplo: `Dark Factory → Produção Audiovisual → Editor → Distrito de Montagem`.

Marketing segue o mesmo princípio, com suas próprias Regiões e Núcleos.

### Terra

`País → Estado → Cidade → Bairro`

- País: organiza o ecossistema/cliente.
- Estado: representa o setor.
- Cidade: sistema operacional do Estado.
- Bairro: identifica, administra e solicita o que o Estado precisa.

### Infraestrutura transversal

- **Portão:** entrada/saída, identificação, recebimento e rastreabilidade.
- **Rodovia:** transporte e roteamento por capacidade.
- **Central do Mundo:** acompanha capacidades e recebe demandas que não possuem executor.
- **Criação do Mundo:** prepara propostas; estruturas novas só entram no mundo após autorização.

## Regra de operação modular

Uma operação pode ser composta por vários módulos independentes.

Cada módulo gera seu próprio checkpoint. Se um módulo falhar, a operação pode retornar somente a esse módulo e continuar do ponto seguinte após a correção.

Exemplo:

`imagem ✅ → áudio ❌ → vídeo não executado`

Depois:

`reentrada no áudio → áudio ✅ → vídeo → conclusão`

Não é necessário repetir a imagem.

## Regra de responsabilidade

A Cidade não vira fábrica. O Estado não conhece internamente outro setor. A Rodovia não executa trabalho. A Dark Factory executa produção do Céu. A Terra solicita e recebe resultados.

O código legado em `worddark/runtime` permanece apenas como **referência histórica de migração** até que toda capacidade relevante esteja reconciliada e testada na estrutura oficial. O runtime oficial não depende dele.

## Testes

`npm test`

A suíte oficial cobre o núcleo, operações, segurança, memória, Dark Factory e integração modular.
