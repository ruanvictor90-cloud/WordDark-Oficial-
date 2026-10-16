# darkHub → Shadoweb: contrato de passagem

**Estado:** base darkHub em revisão isolada; não mesclada nem publicada como produção.  
**Objetivo:** permitir que o desenvolvimento do Shadoweb comece sem transformar o darkHub em dependência obrigatória nem misturar as bases dos dois aplicativos.

## Responsabilidades

- **darkHub:** painel central de acompanhamento, análise do ecossistema, análise técnica, registro de projetos, governança local e criação/exportação de especificações e bases iniciais de aplicativos.
- **Shadoweb:** produto independente de navegação, pesquisa, catálogo de conexões, acesso a serviços e encaminhamento controlado. Deve manter seu próprio código, identidade, armazenamento, permissões e ciclo de build.
- **WordDark:** governa as operações do ecossistema. Não é substituído pelo darkHub nem pelo Shadoweb.

## Regras de isolamento

1. Shadoweb não importa módulos internos de darkHub em tempo de execução.
2. darkHub não abre, executa ou carrega código do Shadoweb como plugin.
3. Não compartilhar `localStorage`, chaves criptográficas, sessão ou credenciais entre os aplicativos.
4. Não colocar tokens, chaves de API, refresh tokens ou segredos em HTML, JavaScript de frontend, assets do APK ou repositório.
5. Qualquer comunicação futura deve passar por contrato versionado e endpoint autenticado, com autorização por escopo, validação no servidor, revogação e auditoria.
6. Exportar uma especificação ou scaffold pelo criador do darkHub não significa que o app foi compilado, testado, publicado ou aprovado para produção.
7. O operador deve aprovar explicitamente ações destrutivas, publicação, empacotamento e novas conexões.

## Contrato mínimo para integrações futuras

Uma proposta de integração deverá declarar:
- identificador e versão do contrato;
- identidade de origem e destino;
- finalidade e dados mínimos permitidos;
- autenticação, autorização e expiração;
- esquema de pedido/resposta e limites de tamanho;
- timeouts, repetição segura e tratamento de falhas;
- IDs de correlação para auditoria;
- desconexão/revogação e testes negativos;
- ambientes separados de desenvolvimento, staging e produção.

Até que todos os itens estejam definidos e testados, a conexão permanece **desativada**.

## Segurança atual do darkHub

O cofre local usa PBKDF2-SHA-256 e AES-256-GCM para criptografar registros no dispositivo. Agora há exportação e restauração de backup criptografado; a restauração valida a frase secreta e a integridade dos dados antes de substituir o cofre local. A frase secreta não pode ser recuperada. Guardar backup e frase secreta em locais separados.

Isso não equivale a autenticação de servidor, sincronização entre dispositivos, armazenamento Android Keystore, logs remotos invioláveis ou proteção contra dispositivo comprometido. Esses controles continuam sendo gates de produção.

## Critérios para avançar ao Shadoweb

- [ ] Testes do cofre, backup/restauração, fábrica de apps e limites de segurança aprovados.
- [ ] APK debug do darkHub gerado como artefato de teste.
- [ ] Revisão manual no Android: criar cofre, registrar itens, bloquear, desbloquear, exportar backup, restaurar em instalação limpa e verificar frase incorreta.
- [ ] Confirmar que `main` e o deploy de produção continuam inalterados.
- [ ] Iniciar Shadoweb em branch própria, com build e testes independentes.

## Próxima etapa

Começar o Shadoweb como aplicativo independente, primeiro consolidando seu navegador e modelo de navegação; depois estabelecer Gate, Connect, Bridge, Knowledge e Audit como módulos separados. Nenhuma integração real deve ser ativada antes de contratos e controles de segurança serem implementados e testados.
