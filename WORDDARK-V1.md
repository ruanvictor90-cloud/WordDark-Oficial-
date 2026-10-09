# WordDark V1 — plano de desenvolvimento

**Marco:** início oficial em 09/10/2026  
**Estado:** V1 em construção; interface publicada, validação técnica e módulos operacionais em andamento.

## Objetivo da V1

Transformar a estrutura do WordDark em um sistema modular utilizável, começando pela empresa de gestão de canais sociais e produção de conteúdo. O foco é que cada função possa operar isoladamente, enquanto a produção completa coordena várias funções sem duplicar regras.

## Limites de autoridade

- **Ruan / ADM Dono:** camada externa e soberana. O WordDark não a administra nem acessa sua raiz.
- **WordDark:** coordena, encaminha, verifica regras e mantém registros do próprio mundo.
- **ADM:** administra somente dentro das permissões concedidas.
- **DEV:** desenvolve e testa; não recebe autoridade administrativa automaticamente.
- **Público:** acessa apenas interfaces e funções autorizadas.
- A financeira do WordDark e a financeira privada permanecem separadas. Qualquer repasse ao ambiente privado começa como proposta explícita.

## Estrutura

- **WordDark:** gerenciamento, segurança, auditoria, biblioteca e coordenação.
- **Céu:** Dark Factory, Marketing, produção e soluções.
- **Terra:** empresas, canais, clientes, fornecedores e necessidades.
- **Rodovia:** transporte interno entre módulos; não precisa de interface própria.
- **Financeira:** cofre operacional, lançamentos, resultados e propostas de investimento.
- **Biblioteca:** memória e arquivos, inicialmente locais e depois centralizados com permissões.

## Entregas da V1

### V1.0 — Fundação operacional
- [x] Shell Ruan e aplicativo WordDark separados.
- [x] Navegação inicial entre áreas do mundo.
- [x] Registro local de intenções e notas.
- [x] Cofre local para lançamentos informados manualmente.
- [x] Separação visual entre ADM Dono, ADM, DEV e Público.
- [x] Avisos de que conectores e transações reais não estão ativos.
- [ ] Núcleo e testes automatizados saudáveis.

### V1.1 — Empresa de gestão de canais
- [x] Bancada de conteúdo com briefing e escopo.
- [x] Diferenciar operação isolada de produção completa.
- [x] Registrar o resultado produzido.
- [x] Etapas de trabalho e revisão manual de direitos e regras da plataforma.
- [ ] Testes automatizados do fluxo de trabalho.
- [ ] Biblioteca de ativos e versões com histórico consistente.
- [ ] Modelos reutilizáveis por canal e formato.
- [ ] Relatório de execução e auditoria por trabalho.

### V1.2 — Núcleo operacional
- [ ] Contratos padronizados de pedido, execução, resposta e erro.
- [ ] Registro consistente de eventos e reentrada segura de módulos.
- [ ] Testes de integração da Rodovia e dos portões.
- [ ] Permissões verificadas no servidor, não apenas na interface.
- [ ] Biblioteca persistente com cópia de segurança e sincronização.

### V1.3 — Conexões controladas
- [ ] Identidade e sessão seguras no servidor.
- [ ] Conectores oficiais para plataformas, iniciando por uma rede.
- [ ] Escopos mínimos, ambientes de teste e revogação de acesso.
- [ ] Revisão humana antes de publicar ou executar ações externas.
- [ ] Registros de consentimento, falhas e resultados.
- [ ] Nenhuma senha ou segredo armazenado no código público.

### V1.4 — Empresa comercial
- [ ] Catálogo e modelos de produtos.
- [ ] Fornecedores, custos, preços e margens.
- [ ] Pedidos, estados, atendimento e logística.
- [ ] Integrações de loja e pagamento somente após segurança e auditoria.

## Critérios para chamar a V1 de estável

1. Todos os testes automatizados obrigatórios passam.
2. Os fluxos principais funcionam em celular e computador.
3. Os dados têm comportamento documentado: local, sincronizado ou remoto.
4. Nenhuma interface afirma que uma ação externa ocorreu sem confirmação do serviço.
5. As permissões são aplicadas fora do navegador antes de qualquer operação real.
6. Existe procedimento para falha, reentrada, cópia de segurança e recuperação.
7. As funções de conteúdo podem ser executadas isoladamente sem exigir a linha completa.

## Limitações conhecidas da alfa atual

A bancada de conteúdo, intenções, notas e Cofre ainda usam armazenamento local do navegador. Isso não é sincronizado entre dispositivos, não é um banco central e pode ser apagado pelo usuário. As revisões são controles de fluxo locais, não certificações jurídicas. Não há publicação automática, geração automática de mídia, métricas externas, transações bancárias ou integrações de contas ativas.

**Regra de lançamento:** primeiro provar o fluxo em modo local/simulado; depois testar em ambiente restrito; só então habilitar qualquer execução externa com autorização, logs e possibilidade de interrupção.
