# WordDark Oficial — LINHA ATIVA

Este é o repositório oficial do mundo **WordDark**.

- Repositório oficial: `ruanvictor90-cloud/WordDark-Oficial-`
- `main`: produção/online
- `develop`: criação
- `staging`: integração/testes
- Arquitetura oficial: `worddark/runtime/world`
- Financeiro: infraestrutura compartilhada do mundo.

## Regra estrutural

O WordDark não cria estruturas históricas ou clientes artificiais apenas porque uma interface existe.

Nenhum cliente, canal, grupo ou país pré-configurado é necessário para o mundo funcionar. Essas estruturas nascem quando uma necessidade ou conexão real exigir.

## Mapa oficial

```
WORDDARK
├── Infraestrutura central
│   ├── Registro
│   ├── Segurança
│   ├── Memória
│   ├── Central de Operações
│   └── Biblioteca
├── Terra
│   ├── Gestão de Negócios
│   └── Gestão de Conteúdos e Canais
├── Céu
│   ├── Marketing
│   └── Dark Factory
└── Conexões Externas
```

### Terra

Quando necessário, a organização territorial pode crescer por:

`País → Estado → Cidade → Bairro`

Esses níveis não são obrigatórios. O sistema cria somente o menor nível necessário.

### Céu

O Céu usa uma organização própria e flexível:

`Domínio → Região → Unidade → Distrito`

A nomenclatura é estrutural; não representa empresas adicionais. Marketing e Dark Factory são empresas registradas diretamente no mundo.

## Operação

```
Intenção
↓
Necessidade
↓
Língua Universal
↓
Capacidade
↓
Empresa
↓
Portão
↓
Rodovia
↓
Operação
↓
Setor/Módulo
↓
Resultado
↓
Memória
```

A Central de Operações é a fachada operacional única. A infraestrutura interna permanece invisível para interfaces comuns.

## Modularidade

Falhas não obrigam repetição integral.

Um módulo pode falhar, registrar sua evidência e receber reentrada específica. A operação continua somente depois da correção e validação daquele módulo.

## Conexões

A Central de Conexões Externas é infraestrutura compartilhada.

- conectores ficam registrados em um hub interno;
- TEST usa somente execução simulada;
- PROD exige autorização e aprovação;
- tokens de runtime não são persistidos como segredo público;
- a interface mostra somente o estado necessário para o usuário.

## Regra oficial

Não existem SucoCast, Suco País ou derivados pré-instanciados na arquitetura atual.

Novas empresas e capacidades entram por registro. O mundo não precisa ser redesenhado para receber uma nova empresa.

## Validação

`npm test` é a suíte automatizada.

A Central de Testes é a validação funcional do runtime no navegador. Nenhum resultado de teste de produção é considerado válido sem evidência real de execução.
