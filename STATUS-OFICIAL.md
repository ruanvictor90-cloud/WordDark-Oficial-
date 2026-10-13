# WordDark Oficial — linha ativa

**Repositório:** `ruanvictor90-cloud/WordDark-Oficial-`

- `main`: produção/publicação.
- `develop`: criação.
- `staging`: integração e testes.
- **Core canônico:** `worddark/runtime/world/core/`.
- **Interface do mundo:** `worddark/app/`.
- **Ruan:** aplicativo privado independente.
- **Hub:** entrada separada com Central, Teste e acesso ao WordDark.

## Mapa atual da interface

```
RUAN (privado e independente)
├── Pessoal
│   ├── Financeiro
│   └── Tarefas
├── Shadow
│   └── DarkEye (protótipo)
└── WordDark Hub
    ├── Central
    │   ├── Pedidos
    │   └── Em execução
    ├── Teste
    └── WordDark

WORDDARK
├── Central
├── Darkbank
│   ├── Financeiro
│   ├── Cofre
│   └── Investimentos
├── Central de conexão
├── Automação
├── Biblioteca
├── Escola do Mundo
├── Governança
├── Segurança
├── Teste
├── Céu
│   ├── Dark Factory
│   │   ├── Em criação
│   │   └── Biblioteca
│   └── Central Social
│       ├── Gestor de redes sociais
│       ├── Gestor de marketing digital
│       └── Gestor de projetos
└── Terra
    ├── Empresa social
    └── Empresa comercial
```

## Regras de consolidação

1. O aplicativo expõe apenas as áreas definidas para esta versão.
2. Ruan não é um setor nem um aplicativo interno do WordDark.
3. Darkbank não mantém reserva, página ou transferência direcionada ao Ruan.
4. Central Social é o nome atual da área; a antiga tela de Marketing não permanece como aplicativo separado.
5. O Core ativo é único: `worddark/runtime/world/core/`.
6. `worddark/core-central/` é legado arquivado e não entra na suíte padrão.
7. Módulos detalhados ainda não conectados ficam fora do fluxo ativo; não devem ser integrados automaticamente.
8. TEST não aciona conectores reais. PROD exige autorização e controles de servidor.
9. Nenhum segredo deve ser armazenado no frontend público.
10. Estado local não equivale a sincronização, autenticação ou auditoria inviolável.

## Estado técnico

A versão atual reúne interfaces, navegação, armazenamento local e motores especializados. A integração de ponta a ponta entre todas as telas e todos os motores ainda é uma etapa futura. Recursos visuais ou registros locais não devem ser apresentados como execução externa real.

## Verificação

`npm test` é a suíte automatizada principal. Depois dela, verificar manualmente a navegação, a persistência e a publicação no navegador.
