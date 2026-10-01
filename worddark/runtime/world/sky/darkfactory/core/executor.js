/*
 * Dark Factory — Default Executor
 * DF-0.3
 *
 * Executor padrão de testes.
 * Nenhuma tarefa externa é executada neste estágio.
 */

class DarkFactoryExecutor {

  constructor() {
    this.name = "DF-Default-Executor";
    this.type = "test";
    this.status = "IDLE";
  }

  execute(request) {
    if (!request) {
      return {
        success: false,
        status: "FALHA",
        message: "Nenhuma solicitação fornecida."
      };
    }

    if (request.permission !== "approved") {
      return {
        success: false,
        status: "REJEITADO",
        message: "A solicitação não possui autorização para execução."
      };
    }

    this.status = "EXECUTING";

    const result = {
      success: true,
      status: "PROCESSADO",
      executor: this.name,
      executorType: this.type,
      requestId: request.id,
      taskType: request.taskType || this.type,
      message: "Solicitação processada pelo executor de teste.",
      executedAt: new Date().toISOString()
    };

    this.status = "IDLE";

    return result;
  }

  getStatus() {
    return this.status;
  }
}

if (typeof window !== "undefined") {
  window.DarkFactoryExecutor = DarkFactoryExecutor;
}
