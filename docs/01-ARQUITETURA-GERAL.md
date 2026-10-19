# 01 — Arquitetura geral do ECOSSISTEMA

**Status:** especificação inicial v1.0 — base para análise e validação antes de implementar motores.

## 1. Princípio central

O ecossistema não é um único aplicativo gigante. É um conjunto de sistemas independentes que colaboram por contratos estáveis. Cada app tem seu próprio código, ciclo de versão, testes, limites de acesso e responsabilidade sobre os próprios dados.

O darkHub coordena e supervisiona; não se torna proprietário irrestrito dos outros sistemas.

## 2. Mapa lógico

```text
ECOSSISTEMA
|
+-- darkHub (central pessoal e coordenação)
|   +-- experiência principal do darkHub
|   +-- painel de saúde e informações
|   +-- catálogo/launcher de aplicativos
|   +-- centro de desenvolvimento e versões
|   +-- coordenação de tarefas, alertas e aprovações
|   +-- WordDark Hub (área visível dentro do darkHub)
|       +-- interface/entrada para gestão do WordDark
|       +-- código, dados e permissões próprios
|
+-- Camada de integração (contratos, eventos, identidade, permissões)
|
+-- Shadow (inteligência, planejamento, produção de planos e tarefas)
+-- Shadoweb (navegação, pesquisa e conectores externos/internos)
+-- WordDark (mundo empresarial independente)
|   +-- WordDark: governança, coordenação e equilíbrio
|   +-- Céu: fábricas, gestores e produção de soluções
|   +-- Terra: demanda, clientes e empresas por nicho
+-- Outros aplicativos especializados
```

Este é um mapa de responsabilidades, não uma afirmação de que os componentes já estejam implementados.

## 3. Relação entre darkHub e WordDark Hub

- O usuário abre o WordDark Hub a partir do darkHub.
- O WordDark Hub pertence à experiência de navegação do darkHub, mas não é o mesmo código nem o mesmo domínio de dados.
- O darkHub pode apresentar status, notificações e operações autorizadas do WordDark Hub.
- O WordDark Hub solicita ações empresariais ao WordDark por contratos; não acessa diretamente bancos de dados privados de outros domínios.
- O WordDark permanece utilizável como sistema independente quando sua arquitetura e implantação permitirem.

## 4. Propriedade por domínio

| Sistema | Responsabilidade principal | Não deve assumir |
|---|---|---|
| darkHub | Coordenação geral, ambiente pessoal, supervisão e ciclo de evolução | Ser dono irrestrito dos dados ou da execução dos outros apps |
| WordDark Hub | Gestão e acesso ao mundo empresarial | Substituir o núcleo empresarial do WordDark |
| Shadow | Interpretar objetivos, pesquisar quando autorizado, planejar, preparar entregáveis e acompanhar tarefas | Declarar uma ação executada sem evidência ou permissão |
| Shadoweb | Navegar, pesquisar e operar conectores permitidos | Tratar todo site como API ou contornar autenticação/controles |
| WordDark | Governança e operação do ecossistema empresarial | Misturar dados pessoais privados sem autorização |
| Cada app adicional | Resolver um domínio específico | Depender de acesso irrestrito a todos os outros apps |

## 5. Separação de código

Direção recomendada: cada app evolui em repositório próprio quando for tecnicamente e operacionalmente viável. A documentação central do ecossistema descreve contratos e compatibilidade; não reúne todos os motores em um único arquivo ou pacote.

Se, por praticidade inicial, houver mais de um módulo no mesmo repositório, cada módulo ainda deverá ter limites claros, dependências explícitas, testes e publicação independentes. A organização em pastas sozinha não equivale a isolamento de segurança.

## 6. Arquitetura visual

A identidade atual roxo/preto é uma referência visual a preservar. Nenhuma interface legada é considerada automaticamente aprovada para a nova linha. O redesenho visual ocorrerá depois da definição de navegação, responsabilidades, estados e contratos.

Princípios de UX: mobile-first; telas limpas; navegação consistente; apps identificados por ícone e nome; estados claros; acessibilidade; ausência de painéis decorativos que não entreguem função real.

## 7. Camadas técnicas

1. Experiência: telas, navegação e acessibilidade.
2. Aplicação: fluxos e casos de uso do próprio app.
3. Domínio: regras e estados de negócio.
4. Integração: contratos, eventos e conectores.
5. Infraestrutura: persistência, rede, armazenamento, autenticação e observabilidade.
6. Garantia: testes, auditoria, recuperação e versionamento.

Cada app implementa somente as camadas de que necessita; as regras de comunicação permanecem compatíveis com o ecossistema.
