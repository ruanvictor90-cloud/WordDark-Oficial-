# MAPA DE ACESSO E USO DE INFORMAÇÕES

## Regra central
Nenhum dado deve atravessar uma fronteira apenas porque tecnicamente pode.

## Entrada
EXTERNO → VÉU → validação → classificação → sanitização → CENTRAL → setor autorizado.

## Saída
SETOR → CENTRAL DE CONEXÃO → autorização → VÉU → provedor.

## Classificação
PUBLIC
→ pode aparecer na interface pública.

OPERATIONAL
→ necessário ao Mundo para operar.

PRIVATE
→ permitido somente ao componente responsável.

SECRET
→ nunca entra no Mundo nem na interface pública.

## Pontos obrigatórios
1. identidade;
2. autenticação;
3. autorização;
4. escopo da conta;
5. capacidade;
6. validação da entrada;
7. sanitização;
8. execução;
9. resultado mínimo;
10. auditoria;
11. revogação;
12. recuperação.

## Proibição
Um setor não pode contornar a Central de Conexão para acessar diretamente um provedor.

Um módulo não pode receber uma credencial somente para realizar uma operação que pode ser expressa como capacidade.

## Ambientes
DEVELOPMENT, STAGING e PRODUCTION devem possuir fronteiras próprias. Segredos de produção não devem ser reutilizados em desenvolvimento ou testes.

## Falha
Falha de autorização = negar.

Falha de validação = negar.

Falha de integridade = bloquear.

Falha de conexão = estado DEGRADED/ERROR, nunca acesso irrestrito.

Falha de segurança = emergência/revogação conforme impacto.
