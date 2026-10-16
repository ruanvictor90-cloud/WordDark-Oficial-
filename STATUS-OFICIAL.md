# WordDark Oficial — estado do ecossistema

**Repositório:** `ruanvictor90-cloud/WordDark-Oficial-`

- `main`: linha de publicação principal.
- `develop`: desenvolvimento.
- `staging`: integração e testes.
- **darkHub:** central independente de análise e criação de aplicativos.
- **WordDark Hub:** entrada independente do mundo operacional.
- **WordDark:** runtime operacional do ecossistema.
- **Core WordDark:** `worddark/runtime/world/core/`.
- **Interface WordDark:** `worddark/app/`.

## Arquitetura do ecossistema

```
ECOSSISTEMA
├── darkHub
│   ├── Painel central
│   ├── Análise do ecossistema
│   ├── Análise técnica
│   ├── Criador de aplicativos
│   ├── Registro de projetos
│   └── Segurança e auditoria local
├── WordDark Hub
│   ├── Central
│   ├── Teste
│   └── Entrada para WordDark
└── WORDDARK
    ├── Coordenação central
    ├── Céu
    │   └── Execução e produção
    └── Terra
        └── Entidades, pedidos e necessidades
```

## Estado técnico do darkHub reescrito
- A nova implementação fica em `darkhub/`, sem importar módulos internos de outros aplicativos.
- Duas áreas de análise separadas: ecossistema e técnica.
- Criador de apps produz uma especificação e arquivos iniciais exportáveis.
- Cofre local usa PBKDF2-SHA-256 e AES-256-GCM.
- Conectores remotos permanecem desligados.
- A geração de base inicial não equivale a APK de produção nem a publicação automática.
- O cofre é proteção local; autenticação de servidor, Android Keystore, sincronização e auditoria remota ainda exigem implementação.

## Regra de liberação
Nenhuma alteração desta linha de reescrita deve ser integrada à publicação principal sem revisão, testes e autorização explícita.
