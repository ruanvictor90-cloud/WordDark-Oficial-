# 18 — Ambientes, versões e implantação controlada

**Estado:** estratégia lógica proposta. A tecnologia de hospedagem e empacotamento será escolhida conforme recursos disponíveis.

## 1. Objetivo

Permitir que sistemas independentes evoluam sem confundir código em desenvolvimento com capacidade pronta para uso, sem publicar acidentalmente e sem perder a possibilidade de retornar a uma versão estável.

## 2. Ambientes lógicos

| Ambiente | Finalidade | Dados permitidos | Efeitos externos |
|---|---|---|---|
| Desenvolvimento | Criar e alterar código, configuração e documentação | Dados sintéticos ou explicitamente autorizados para desenvolvimento | Bloqueados por padrão |
| Teste/validação | Testes funcionais, de contrato, segurança e regressão | Conjuntos de teste isolados | Simulados; nenhum efeito real acidental |
| Piloto | Avaliação com escopo, usuários e volume limitados | Dados mínimos necessários, com base e permissão adequadas | Apenas efeitos explicitamente aprovados |
| Produção | Uso operacional real | Dados conforme finalidade, acesso e retenção aprovados | Sujeitos à matriz de risco e autorização |

A palavra “ambiente” é um limite lógico. Se os ambientes compartilharem dispositivo, processo ou armazenamento no início, a separação precisa ser demonstrada por controles e testes; nomear uma pasta “teste” não basta.

## 3. Ciclo de versão

Proposta de estados:
`draft → building → test_candidate → review → approved → released → active`

Alternativas: `blocked`, `rejected`, `suspended`, `deprecated`, `retiring`, `retired`, `rollback_pending`, `rolled_back`.

- **draft:** requisito ou ideia registrada.
- **building:** artefato em preparação.
- **test_candidate:** versão identificável pronta para validação.
- **review:** evidências e impactos sendo avaliados.
- **approved:** versão aprovada para ambiente e escopo específicos.
- **released:** pacote publicado no canal autorizado.
- **active:** versão em uso e elegível para roteamento.
- **suspended/deprecated/retired:** sem novas operações, conforme política.

“Publicado” não significa automaticamente “ativo”, e “ativo” não significa compatível com qualquer consumidor.

## 4. Identidade da versão

Cada versão deve identificar, conforme aplicável:
- sistema e módulo proprietário;
- número/identificador de versão;
- commit ou artefato de origem;
- versões dos contratos e schemas;
- dependências e suas versões;
- ambiente e configuração não secreta;
- resultados de testes;
- aprovação aplicável;
- limitações conhecidas;
- estratégia de migração e retorno.

Segredos não devem ser incorporados ao pacote nem expostos nos metadados.

## 5. Compatibilidade e migrações

- Mudanças aditivas compatíveis podem seguir a política de versão aprovada.
- Mudanças incompatíveis exigem versão de contrato e plano de migração.
- Consumidores devem declarar versões compatíveis.
- Uma capacidade não recebe novas solicitações se não suportar o contrato solicitado.
- Migrações de dados devem ser testadas, ter cópia recuperável quando aplicável e definir como lidar com falha parcial.
- Versões anteriores permanecem rastreáveis; não são sobrescritas silenciosamente.

## 6. Promoção e retorno

Para promover:
1. selecionar artefato imutável e versão;
2. validar testes e dependências;
3. revisar riscos, permissões e dados;
4. confirmar ambiente e escopo;
5. obter aprovação exigida;
6. promover o mesmo artefato validado, evitando recompilar conteúdo diferente sem nova validação;
7. verificar saúde e resultados;
8. registrar versão ativa e responsáveis.

Para retornar:
1. interromper novas operações se necessário;
2. verificar compatibilidade do retorno com dados já alterados;
3. executar rollback ou compensação aprovada;
4. verificar estado resultante;
5. registrar evidências e tarefas pendentes.

Nem toda mudança de dados é reversível; nesses casos, o plano precisa declarar compensação ou intervenção manual em vez de prometer rollback.

## 7. Publicação web e APKs

Publicar um site, ativar GitHub Pages, liberar um APK ou conectar um domínio são ações de implantação distintas. A existência de código no GitHub não comprova que esteja offline ou que uma versão esteja instalada.

Cada publicação deve declarar:
- repositório/branch/commit de origem;
- canal e destino;
- responsável e autorização;
- versão;
- resultado de verificação;
- procedimento de desativação ou retirada.

Até a política e a autorização estarem definidas, a linha de arquitetura deve continuar como documentação e schemas, sem implantação automática de apps.

## 8. Critérios de aceite

- Versão de desenvolvimento não aparece como ativa.
- Artefato testado é o mesmo que foi promovido.
- Contrato incompatível é rejeitado.
- Falha na promoção bloqueia o roteamento.
- Retorno não apaga a trilha de auditoria.
- Publicação não ocorre sem autorização para aquele destino.
- O estado real do ambiente é verificado, não inferido a partir do nome da branch.
