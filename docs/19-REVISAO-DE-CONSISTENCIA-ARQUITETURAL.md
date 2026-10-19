# 19 — Revisão de consistência arquitetural

**Estado:** primeira revisão cruzada documental. Não equivale à aprovação final da planta nem à validação de código.

## 1. Escopo revisado

A revisão compara a arquitetura geral, comunicação, segurança, plano de implementação, limite do legado, nascimento zero do WordDark, contratos de clientes, módulos do núcleo, mapa mestre, ciclo de soluções, fichas funcionais, motores, portão de validação, fluxos, decisões, dados e schemas.

## 2. Invariantes que devem valer em todos os documentos

1. **Separação de domínios:** darkHub coordena a experiência pessoal; WordDark Hub é a experiência de gestão; o núcleo WordDark governa operações empresariais. Compartilhar navegação não compartilha propriedade de dados nem autorização.
2. **Separação de responsabilidades:** WordDark é governança e coordenação; Céu produz soluções; Terra organiza demanda, clientes e empresas; Central de Conexão pertence a WordDark.
3. **Nascimento zero:** entidades operacionais reais não vêm pré-cadastradas; catálogo e mecanismos de registro são estrutura, não empresas fictícias.
4. **Capacidade comprovada:** declarar uma capacidade não a torna ativa. Ativação exige validação, testes, permissões, responsável, versão e evidência.
5. **Autonomia limitada:** Shadow prepara e planeja; Shadoweb pesquisa e conecta dentro das permissões; agentes não aprovam as próprias ações críticas.
6. **Comunicação por contrato:** sem acesso direto a dados internos de outro domínio como atalho; comando, evento, consulta e resultado são tipos diferentes.
7. **Falha explícita:** timeout, evidência ausente e resultado parcial nunca são sucesso presumido.
8. **Mudança controlada:** alteração é isolada, testada, revisada e aprovada conforme risco; mudança material invalida aprovação antiga.
9. **Custo consciente:** modo manual/simulado primeiro; API paga ou infraestrutura nova exige justificativa.
10. **Planta antes de implementação:** documentos e schemas não significam que motores, apps ou integrações estejam construídos.

## 3. Pontos identificados e tratamento

| Tema | Risco de interpretação | Regra de resolução |
|---|---|---|
| darkHub versus WordDark Hub | Parecer que o Hub pessoal possui o núcleo empresarial | Manter código/domínio/dados separados e usar contratos |
| WordDark versus Céu | Núcleo virar fábrica universal | Núcleo governa e roteia; produção fica em Céu |
| Terra versus núcleo | Comercial e empresas ficarem dentro do núcleo | Empresas sociais/comerciais e demanda pertencem a Terra |
| Shadow versus Shadoweb | Misturar planejamento com execução/conectividade | Shadow planeja; Shadoweb recupera fontes e opera conectores autorizados |
| Capacidade declarada versus ativa | Roteamento para módulo não testado | Estado e evidência de ativação obrigatórios |
| Aprovação versus execução | Mensagem aprovada ser tratada como resultado | Aprovação separada da operação e confirmação separada do destino |
| Solução temporária versus permanente | Protótipo virar dependência sem dono | Expiração/retirada ou promoção formal com responsável |
| Repositório versus publicação | Supor que branch limpa está offline | Verificar separadamente configurações de Pages, deploy e destinos |
| Esquema JSON versus segurança | Payload válido ser considerado autorizado | Schema valida forma; identidade/política validam permissão |
| Código compartilhado versus isolamento | Monorepo ser confundido com segurança | Isolamento é imposto por contratos, autorização e arquitetura de execução |

## 4. Limites desta revisão

A revisão é documental. Não comprova:
- que o conteúdo inteiro esteja livre de toda contradição;
- que schemas estejam cobertos por testes automáticos;
- que isolamento, autorização, armazenamento ou recuperação funcionem;
- que GitHub Pages ou outro destino esteja desligado;
- que o usuário tenha aprovado todas as propostas técnicas;
- que os requisitos de todos os apps futuros estejam detalhados.

Esses itens exigem revisão adicional, decisão ou teste próprio.

## 5. Pendências que impedem a aprovação total

### Críticas para qualquer operação real
- Identidade, autenticação e autoridade de aprovação.
- Persistência, backup, restauração e política de retenção.
- Implementação e testes de isolamento de dados por domínio/tenant.
- Gestão segura de segredos e permissões de conectores.
- Estratégia operacional de incidentes, suspensão e recuperação.
- Ambiente inicial concreto e critérios de implantação.

### Específicas por módulo/caso de uso
- Escopo final de Banco empresarial, Captação e DarkAccount.
- Lista final de apps pessoais na primeira versão do darkHub.
- Primeiro serviço comercial, contrato, critérios de aceite e custos.
- Fontes e integrações realmente disponíveis.
- Prazos, expiração e manutenção de soluções temporárias.

As pendências específicas não precisam paralisar toda a arquitetura. Devem bloquear somente os módulos e fluxos que dependem delas.

## 6. Próxima revisão exigida

1. Validar a matriz de risco e aprovação do documento 17.
2. Validar ambientes e ciclo de versão do documento 18.
3. Revisar schemas com exemplos válidos/inválidos e transições de estado.
4. Confirmar nomenclatura, propriedade e fronteiras do mapa mestre.
5. Selecionar um escopo mínimo de simulação, sem execução externa.
6. Registrar o resultado do portão do documento 13 como reprovado, aprovado com pendências ou aprovado para escopo definido.

## 7. Resultado provisório

A arquitetura já tem uma direção coerente para coordenação, comunicação contratual, criação de soluções e autorização humana. A planta **ainda não está declarada finalizada**: esta revisão registra invariantes e riscos, mas faltam validação detalhada dos schemas, decisões do escopo inicial e revisão/aprovação explícita do usuário.

Nenhum motor ou aplicativo deve ser tratado como pronto apenas por causa desta documentação.
