/*
 * Dark Factory — Logger Core
 * DF-0.1
 *
 * Responsabilidade:
 * Registrar os eventos que acontecem durante o ciclo
 * de uma solicitação.
 */

class DarkFactoryLogger {

  constructor() {
    this.logs = [];
  }


  log({
    requestId = null,
    event = "UNKNOWN",
    message = "",
    data = null
  } = {}) {

    const entry = {
      id: DarkFactoryLogger.generateLogId(),
      requestId: requestId,
      event: event,
      message: message,
      data: data,
      timestamp: new Date().toISOString()
    };

    this.logs.push(entry);

    return entry;
  }


  getAll() {

    return [...this.logs];
  }


  getByRequest(requestId) {

    return this.logs.filter(
      log => log.requestId === requestId
    );
  }


  clear() {

    this.logs = [];
  }


  static generateLogId() {

    const timestamp = Date.now()
      .toString(36)
      .toUpperCase();

    const random = Math.random()
      .toString(36)
      .substring(2, 6)
      .toUpperCase();

    return `LOG-${timestamp}-${random}`;
  }

}


/*
 * Disponibiliza o módulo para uso pela Dark Factory.
 */

if (typeof window !== "undefined") {
  window.DarkFactoryLogger = DarkFactoryLogger;
}
