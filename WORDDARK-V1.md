# WordDark V1 — escopo atual

**Estado:** interface e motores em construção; consolidação da versão atual em andamento.

## Objetivo imediato

Manter uma versão bruta, clara e navegável dos aplicativos e setores definidos. Os detalhes já existentes no repositório devem ser reaproveitados apenas quando o setor responsável for conectado conscientemente.

## Estrutura atual

- **WordDark:** coordenação e aplicativos centrais.
- **Céu:** Dark Factory e Central Social.
- **Terra:** Empresa social e Empresa comercial.
- **Darkbank:** Financeiro, Cofre e Investimentos do WordDark.
- **Central de conexão:** ponto de organização dos conectores externos.
- **Hub:** Central com Pedidos e Em execução, Teste e entrada para WordDark.
- **Ruan:** aplicativo privado independente, fora do WordDark.

## Princípios obrigatórios

- Não duplicar o Core.
- Não reintroduzir telas antigas como aplicativos separados quando já existe um setor atual equivalente.
- Não colocar Ruan dentro do WordDark nem misturar as finanças dos dois.
- Não criar clientes, países, canais ou empresas como estruturas internas permanentes sem necessidade real.
- Não ativar conectores reais, publicação, compras, pagamentos ou automação sem backend seguro, autorização e evidências.
- Não fazer grandes refatorações fora do escopo da etapa atual.

## Próximas etapas

1. Consolidar a estrutura e remover rotas, telas e caminhos duplicados da versão ativa.
2. Garantir que a suíte de testes valide o Core canônico e os aplicativos atuais.
3. Verificar a navegação e a persistência no navegador.
4. Só depois conectar cada setor aos motores especializados necessários.
5. Adicionar detalhes operacionais por setor, um de cada vez.

## Limites conhecidos

Várias áreas ainda usam armazenamento local. Isso não garante sincronização entre dispositivos, autenticação de produção ou auditoria inviolável. O financeiro é registro de gestão, e os impostos são estimativas. Conectores exibidos na interface ainda podem estar apenas preparados, sem conta conectada.
