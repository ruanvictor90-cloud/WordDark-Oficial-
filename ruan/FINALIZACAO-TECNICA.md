# Ruan — plano de finalização técnica
Data da revisão: 2026-10-15
Branch de trabalho: `ruan/finalizacao-integral-2026-10-15`
Base: `main` do repositório oficial `ruanvictor90-cloud/WordDark-Oficial-`.

## Objetivo
Finalizar o Ruan como central pessoal privada, independente do runtime WordDark, com módulos separados, dados pessoais isolados, navegação previsível e versão móvel testável. Esta branch é de trabalho; não publicar nem mesclar na `main` até a revisão e os testes.

## Escopo confirmado
- A Área ADM não faz parte do Ruan atual.
- Ruan é o único lugar da aplicação que pode ter a gaveta global de aplicativos.
- Pessoal contém os setores Financeiro e Tarefas; os registros são locais e não movimentam dinheiro real.
- Shadow é um aplicativo separado; DarkEye é protótipo de navegação, não um motor de navegador nativo.
- WordDark Hub é somente um atalho explícito de integração. Ruan não deve importar código interno do Hub/WordDark nem expor dados pessoais a eles.
- A identidade desejada para Ruan é preto/roxo, com retorno consistente, marca central e notificações discretas.
- Manter Shadow/DarkEye como estrutura inicial; não implementar ainda lógica futura de Shadow nem prometer sincronização, autenticação ou notificações em segundo plano.

## Estado encontrado na leitura inicial
- A página central atual tem quatro atalhos: Entretenimento, Pessoal, Shadow e WordDark Hub.
- Existem motores de dados pessoais, migração de chaves antigas, exportação/importação JSON, testes unitários e testes de fronteira estrutural.
- Os testes de estrutura atuais explicitamente exigem que a gaveta global esteja temporariamente removida. Isso precisa ser reconciliado com a decisão de produto antes de alterar os testes ou a interface.
- A divergência entre documentação e tela central foi parcialmente resolvida: a central agora tem dois widgets compactos (saldo registrado e tarefas em aberto), sem reintroduzir a gaveta global. Os testes de interface foram atualizados para esse comportamento.
- O CSS contém blocos de estilos históricos e múltiplas declarações de identidade. A revisão visual deve consolidar sem reescrever módulos que já funcionam.
- A estrutura é local ao dispositivo: não existe sincronização entre aparelhos nem autenticação nesta versão.
- Nesta branch, a central recebeu os dois widgets, a versão de assets foi atualizada e o cache do service worker passou para v24. Os formulários de Financeiro e Tarefas passaram a usar a data local do dispositivo para evitar divergência de dia por UTC, e os links de notificação foram corrigidos. A documentação e as asserções foram atualizadas.
- A suíte completa ainda não foi executada: o ambiente atual não conseguiu clonar o repositório para rodar Node localmente. Os testes continuam pendentes de execução em ambiente com o repositório disponível.

## Plano de trabalho
1. **Congelar a especificação:** resolver divergências entre README, HTML, CSS e testes antes de decidir a forma final da central.
2. **Auditar navegação:** verificar todos os links relativos, retorno de cada módulo, ausência de navegação global duplicada e funcionamento do Hub como único atalho externo permitido.
3. **Auditar dados:** validar migração sem perda, cálculos financeiros, prazos locais, validação de entrada, importação/exportação e isolamento entre módulos.
4. **Auditar notificações e offline:** revisar links internos das notificações, confirmar renovação do cache do service worker e testar comportamento offline em dispositivo.
5. **Consolidar identidade:** manter preto/roxo, marca e cabeçalho consistentes; evitar mudanças de interface além do escopo confirmado.
6. **Executar testes:** testes de domínio, armazenamento, motor central, DarkEye, estrutura e fronteiras; corrigir regressões. Esta etapa permanece pendente de execução real.
7. **Entrega:** registrar alterações, resultados dos testes e limitações; somente então avaliar integração à `main` e publicação.

## Critérios de conclusão
- Todos os links locais de HTML, CSS, JavaScript, manifesto e service worker resolvem corretamente.
- Nenhuma página de aplicativo contém uma segunda gaveta global.
- Dados antigos de tarefas/finanças são migrados sem descarte e os testes cobrem o comportamento.
- Ruan não depende do runtime WordDark/Hub; o atalho para o Hub é a única exceção de navegação.
- A documentação corresponde ao comportamento real.
- Os testes são executados e os resultados são registrados sem alegar testes não realizados.
- A branch de finalização é revisada antes de qualquer merge ou publicação.
