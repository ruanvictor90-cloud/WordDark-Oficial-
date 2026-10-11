# Motor Central de Operações — Ruan

Fundação lógica inicial da Área ADM/Ruan. **Não é um app** e não ativa a IA Shadow.

## Responsabilidades
- Centralizar tarefas, notas e eventos pessoais numa API modular.
- Definir a identidade soberana `ADM-RUAN`.
- Permitir pedidos iniciados por Ruan para WordDark somente com aprovação explícita.
- Rejeitar qualquer tentativa de WordDark iniciar acesso à Área Ruan.
- Aceitar adaptadores futuros sem acoplá-los ao núcleo.

## Limites desta etapa
- Sem aplicativo, interface, servidor HTTP ou endpoint de entrada.
- Sem Shadow, modelo de IA, memória inteligente ou execução autônoma.
- Sem tokens, credenciais ou segredos.
- Memória somente em processo; reiniciar o processo apaga os dados desta implementação.
- Adaptador WordDark não configurado. Pedidos só saem quando um adaptador é injetado e a aprovação explícita é fornecida.

## Uso em Node.js
```js
import { RuanEngine } from "./index.mjs";
const ruan = new RuanEngine();
ruan.createTask({ title: "Definir próxima etapa", category: "desenvolvimento", priority: "high" });
console.log(ruan.getStatus());
```

## Soberania
`Ruan → pedido autorizado → WordDark` é permitido. `WordDark → entrada, leitura ou administração de Ruan` é bloqueado.

O futuro app WordDark será outra camada, instalada separadamente. Shadow fica reservada para uma etapa posterior.
