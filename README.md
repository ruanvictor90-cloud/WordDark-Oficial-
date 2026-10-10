# WordDark Oficial

Este é o desenvolvimento oficial do mundo **WordDark**.

## Princípio central

> **O WordDark coordena. As empresas operam. Os setores executam.**

O mundo é a infraestrutura que interliga empresas, capacidades, operações, memória, segurança, permissões, finanças e conexões externas. Empresas não substituem o WordDark; elas usam o mundo para operar.

## Mapa atual

```
WORDDARK
├── Língua Universal
│   ├── Produção
│   └── Operação
├── Infraestrutura
│   ├── Registro
│   ├── Segurança
│   ├── Memória
│   └── Central de Operações
├── Rodovia
├── Empresas
│   ├── Terra
│   │   ├── Gestão de Negócios
│   │   └── Gestão de Conteúdos e Canais
│   └── Céu
│       ├── Marketing
│       └── Dark Factory
└── Conexões Externas
```

Terra e Céu são áreas do mundo, não empresas.

## Fluxo oficial

```
INTENÇÃO
↓
NECESSIDADE
↓
LÍNGUA UNIVERSAL
↓
CAPACIDADE
↓
EMPRESA
↓
PORTÃO
↓
RODOVIA
↓
OPERAÇÃO
↓
MÓDULOS
↓
RESULTADO
↓
MEMÓRIA
↓
RETORNO
```

A **Central de Operações** é a entrada operacional única. Registries, planner, roteador e adapters permanecem por baixo do tapete; interfaces comuns mostram apenas o que é necessário para operar.

## Operação modular

Uma produção pode possuir várias operações e módulos independentes. Se um módulo falhar, a operação pode reentrar somente naquele módulo.

Exemplo:

`imagem ✅ → áudio ❌ → vídeo não executado`

Depois:

`reentrada no áudio → áudio ✅ → vídeo → conclusão`

Não é necessário repetir o que já foi concluído.

## Área pessoal do proprietário

**Ruan** é uma área pessoal privada, não uma empresa. Tarefas, lembretes, ideias e projetos pessoais ficam isolados do conhecimento operacional do mundo. A comunicação é iniciada por Ruan: o WordDark não entra nessa área nem compartilha seus dados automaticamente.

Fluxo autorizado:

`Ruan → solicitação explícita → WordDark → resposta → Ruan`

## Empresas

### Terra
- **Empresa de Gestão de Negócios:** negócios, produtos, fornecedores, clientes, pedidos, recursos, vendas e automações.
- **Empresa de Gestão de Conteúdos e Canais:** contas, canais, conteúdo, audiência, planejamento operacional e publicação.

### Céu
- **Empresa de Marketing:** mercado, tendências, oportunidades, naming, identidade, posicionamento, audiência, campanhas e crescimento.
- **Dark Factory — Empresa de Produção de Conteúdo:** criação, edição, montagem, transformação, renderização, validação e preparação de conteúdo.

## Conexões externas

A **Central de Conexões Externas** é infraestrutura compartilhada, não empresa.

Ela centraliza:
- autorização;
- contas externas;
- adapters/connectors;
- estado das conexões;
- publicação e outras capacidades externas.

A interface não precisa conhecer registries ou tokens. TEST usa somente simuladores; PROD exige autorização/aprovação e conexão adequada. Secrets não ficam no GitHub Pages.

## TEST e PROD

`TEST` é ambiente de laboratório e nunca deve executar connector real.

`PROD` exige barreira explícita de aprovação e autorização. A separação existe para impedir que testes atinjam contas externas acidentalmente.

## Central de Testes

A Central de Testes é um laboratório funcional do runtime. Ela deve validar:
- contratos;
- empresas e capacidades;
- roteamento;
- operações;
- produções;
- execução por setores;
- falhas;
- reentrada;
- resultados;
- memória;
- isolamento TEST/PROD;
- conectores simulados.

## Estrutura dinâmica

Nenhum cliente, canal ou grupo histórico é criado automaticamente.

A Terra cresce conforme necessidades reais. O Céu cresce conforme capacidades reais. Não existem SucoCast, Suco País ou derivados pré-instanciados na arquitetura oficial.

## Desenvolvimento

- `main` = 🌍 produção/online
- `develop` = 🛠️ criação
- `staging` = 🧪 integração/testes

Todo desenvolvimento estrutural deve ser integrado e testado no repositório oficial antes de ser considerado parte do mundo.

### Testes

`npm test`

A suíte Node valida o runtime central e os contratos. A Central de Testes valida também o comportamento no navegador/GitHub Pages.


## Início com investimento zero

A aplicação pode ser usada como um **painel local de operação** sem contratar uma API de IA ou um servidor adicional. Abra a página do app, entre em **Lançamento sem custo** e siga o checklist. O primeiro ciclo recomendado é:

1. Conferir a conta oficial e seus elementos de identidade.
2. Criar a missão de estreia na Dark Factory.
3. Preparar e exportar o pacote local.
4. Revisar roteiro, fatos, direitos autorais e regras da plataforma.
5. Publicar manualmente na conta oficial, se e quando estiver aprovado.
6. Registrar o link e os aprendizados na Biblioteca.
7. Exportar um backup JSON e guardá-lo em local seguro.

O checklist é apenas um acompanhamento local. Os dados ficam no navegador deste dispositivo; não há sincronização automática, IA remota, publicação social automática, conexão bancária ou cobrança real ativadas. Não armazene senhas, tokens ou chaves de API no app. O primeiro ciclo não exige essas integrações.


## Portão Principal e contas executoras

A Área ADM pessoal tem uma entrada própria em `/ruan/`, com um emulador de telefone e três níveis de navegação: Área ADM pessoal, centro do WordDark e contas executoras externas. O painel exibe notificações locais registradas pelo WordDark na mesma origem do navegador. As notificações do sistema podem ser autorizadas enquanto a página está aberta; push em segundo plano ainda não existe.

O centro **Contas executoras · Suco** registra os quatro perfis-piloto externos: SucoCast, SucoGeek, SucoComed e SucoEmpreendimento. É possível alterar o estado local e criar missões na Dark Factory. Nenhuma credencial é armazenada, nenhuma rede é conectada e nenhuma publicação é automática. Os estados e notificações locais não são confirmação independente de uma plataforma externa.
