# MAPA DO VÉU

## Camadas

1. IDENTIDADE — quem pode solicitar uma operação.
2. OAUTH — autorização junto aos provedores.
3. COFRE — armazenamento protegido de material sensível.
4. SESSÕES — ciclo de vida de tokens e sessões.
5. CONEXÕES — catálogo dos provedores e contas conectadas.
6. CAPACIDADES — o que cada conexão pode fazer.
7. ENTRADA — recebe eventos externos.
8. SAÍDA — executa operações externas sem entregar credenciais ao Mundo.
9. REVOGAÇÃO — encerra acessos.
10. ROTAÇÃO — troca credenciais e segredos.
11. AUDITORIA — registra eventos de segurança e operação.
12. PRIVACIDADE — classifica e limita exposição de dados.
13. RECUPERAÇÃO — restaura conexões e estados autorizados.
14. EMERGÊNCIA — bloqueio global/isolado.
15. INTEGRIDADE — verifica consistência da fronteira.
16. PONTE COM O MUNDO — entrega somente informação sanitizada.

## Fluxo

```
EXTERNO
   ↓
[IDENTIDADE / OAUTH]
   ↓
[COFRE / SESSÕES]
   ↓
[CONEXÕES]
   ↓
[CAPACIDADES]
   ↓
[ENTRADA] ──→ [PRIVACIDADE] ──→ WORDDARK
                         │
WORDDARK ─→ [CAPACIDADES] → [SAÍDA] → EXTERNO
                         │
              [AUDITORIA / INTEGRIDADE]
```

## Regra

O Mundo nunca deve precisar conhecer o segredo usado para realizar a operação.

O Véu também não deve virar um novo painel administrativo do Mundo. Ele é uma fronteira modular e controlada.
