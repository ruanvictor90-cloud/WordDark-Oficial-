# WordDark — Mundo Operacional Alfa

Este app é uma camada navegável do mundo WordDark, separada do núcleo pessoal Ruan.

## Áreas
- Visão geral e Gerenciamento
- Céu: Dark Factory, Marketing, laboratório
- Terra: empresas e necessidades
- Financeira do mundo: cofre, lançamentos, resultado e propostas de repasse
- Biblioteca
- Segurança e camadas de autoridade
- Aplicativos empresariais: Gestão de canais e Empresa comercial

## Funcionalidade local já incluída
- Navegação entre setores e empresas
- Registro local de intenções
- Marcação manual de intenções como concluídas
- Registro local de entradas e saídas do Cofre do mundo
- Cálculo do saldo e resultado registrado
- Registro de propostas de repasse ao financeiro privado
- Notas operacionais locais
- PWA / cache básico

## Limites
- Persistência apenas no navegador atual via localStorage.
- Sem autenticação real, backend, sincronização, backup ou auditoria inviolável.
- Não conecta redes sociais, lojas, fornecedores, pagamentos ou bancos.
- Marcar intenção como concluída é um registro manual; não comprova execução externa.
- Proposta de repasse não movimenta dinheiro e não concede ao WordDark acesso ao financeiro privado do Ruan.
- A navegação para Ruan é um atalho; não existe integração segura entre os dados dos dois ambientes ainda.

## Princípio
Ruan é o ambiente pessoal. WordDark é um aplicativo dentro dele. O WordDark coordena suas operações, mas não administra a raiz pessoal nem pode conceder autoridade a si próprio.
