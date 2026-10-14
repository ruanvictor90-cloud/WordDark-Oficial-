> **Nota de consolidação (2026-10-13):** esta árvore preserva a arquitetura detalhada e materiais históricos; ela não deve ser interpretada como a lista de aplicativos da interface atual. Consulte `CURRENT-VERSION-SCOPE.md` antes de expor ou conectar qualquer módulo. Juice Country e os canais derivados são exemplos externos/de teste, não a estrutura interna obrigatória do mundo.

# WordDark
mundo das sombras

## Marco Zero

O WordDark é um mundo digital modular dividido entre **Céu** e **Terra**.

- **Céu:** suporte, infraestrutura, segurança, serviços e execução.
- **Terra:** países, estados, setores, operações, marcas e negócios que geram necessidades.

### Mapa oficial

~~~
WORDDARK
├── CÉU
│   ├── Dark Factory
│   ├── Rodovia
│   ├── Registry
│   ├── Security
│   ├── Storage
│   └── Contracts
│
└── TERRA
    └── País
        └── Estado
            └── Setor
                └── Operação
~~~

**Regra central:** a Terra gera necessidades; o Céu fornece os meios para atendê-las.

A **Dark Factory** é uma fábrica compartilhada do Céu: produz, edita, processa e valida. Ela não escolhe o destino de publicação. O Estado/País da Terra recebe o resultado e decide como utilizá-lo.

## Documentação

- [Arquitetura oficial do mundo](world/)
- [Guia de arquitetura para devs](docs/DEVELOPERS.md)
- [Modelo oficial de branches](docs/BRANCHING.md)
- [Céu](world/sky/)
- [Terra](world/earth/)
- [Dark Factory](world/sky/darkfactory/)
- [Juice Country](world/earth/juice-country/)

## Rumo de construção

~~~
Marco Zero → Núcleo → MVP funcional → Testes → Segurança → Automação → Escala
~~~

O GitHub é o ambiente atual de desenvolvimento e testes. A arquitetura deve permitir uma futura migração para infraestrutura própria sem depender dela.

> Teste de edição realizado via integração do ChatGPT/GitHub.