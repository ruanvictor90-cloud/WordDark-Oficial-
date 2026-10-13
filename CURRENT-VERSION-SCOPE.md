# Escopo da versão atual — consolidação

Este documento define o que pode estar exposto no aplicativo atual. Não significa que todos os detalhes de cada setor já estejam implementados.

## Ruan (fora do mundo WordDark)
- Central pessoal, gaveta global de apps, Pessoal, Shadow/DarkEye e acesso ao Hub.
- Nenhuma tela, reserva financeira ou transferência para Ruan dentro do WordDark.

## WordDark Hub
- Central: Pedidos e Em execução.
- Teste.
- Entrada para WordDark.

## WordDark
- Áreas: WordDark, Céu e Terra.
- Aplicativos centrais: Central, Darkbank, Central de conexão, Automação, Biblioteca, Escola do Mundo, Governança, Segurança e Teste.
- Céu: Dark Factory e Central Social.
- Dark Factory: Em criação e Biblioteca (Áudio, Vídeos, Voz, Imagens, Outros arquivos).
- Central Social: Gestor de redes sociais, Gestor de marketing digital e Gestor de projetos.
- Terra: Empresa social e Empresa comercial.
- Darkbank: Financeiro, Cofre e Investimentos; a divisão do Cofre cobre apenas capital de giro e investimentos do WordDark.

## Regras de consolidação
1. Não reintroduzir o app pessoal antigo dentro do WordDark.
2. Central Social substitui a antiga tela independente de Marketing.
3. O único Core ativo é `worddark/runtime/world/core/`.
4. `worddark/core-central/` fica preservado como legado, mas fora da execução e dos testes padrão.
5. Código detalhado não conectado pode ficar guardado, mas não deve adicionar telas ou fluxos à versão atual.
6. Não ativar conectores reais, pagamentos, publicação ou automação sem autorização, controles seguros e evidência.
7. Alterações nesta etapa devem ser pequenas, revisáveis e testadas antes de entrar na `main`.
