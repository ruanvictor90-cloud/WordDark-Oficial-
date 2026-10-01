/*
 * Dark Factory — Executor Manager
 * DF-0.3
 *
 * Responsabilidade:
 * Registrar executores disponíveis e selecionar o executor
 * adequado para cada tipo de tarefa.
 */

class DarkFactoryExecutorManager {

  constructor() {
    this.executors = new Map();
  }

  register(executor) {
    if (!executor || !executor.name || !executor.type || typeof executor.execute !== "function") {
      return {
        success: false,
        reason: "Executor inválido."
      };
    }

    this.executors.set(executor.type, executor);

    return {
      success: true,
      type: executor.type,
      name: executor.name
    };
  }

  get(type) {
    return this.executors.get(type) || null;
  }

  has(type) {
    return this.executors.has(type);
  }

  list() {
    return Array.from(this.executors.values()).map(executor => ({
      type: executor.type,
      name: executor.name,
      status: typeof executor.getStatus === "function"
        ? executor.getStatus()
        : "UNKNOWN"
    }));
  }

  select(request) {
    if (!request) {
      return {
        success: false,
        reason: "Solicitação ausente."
      };
    }

    const type = request.taskType || "test";
    const executor = this.get(type);

    if (!executor) {
      return {
        success: false,
        reason: "Nenhum executor disponível para o tipo: " + type,
        taskType: type
      };
    }

    return {
      success: true,
      taskType: type,
      executor
    };
  }
}

if (typeof window !== "undefined") {
  window.DarkFactoryExecutorManager = DarkFactoryExecutorManager;
}
