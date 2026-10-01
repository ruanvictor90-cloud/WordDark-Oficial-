/* WordDark Core — Single Central Entry Point
 * Todos os módulos abaixo pertencem ao mesmo Core.
 */
module.exports={
 Identity:require("./identity"),
 Operation:require("./operation"),
 Entity:require("./entities"),
 EntityRegistry:require("./entity-registry"),
 Context:require("./context"),
 Permissions:require("./permissions"),
 Gate:require("./gate"),
 OperationPackage:require("./operation-package"),
 Result:require("./result"),
 Service:require("./service"),
 Connector:require("./connector"),
 ErrorRecovery:require("./error-recovery"),
 Inbox:require("./inbox"),
 Versioning:require("./versioning"),
 WorldRuntime:require("./world-runtime"),
 OperationEngine:require("./operation-engine"),
 OperationRegistry:require("./operation-registry"),
 Road:require("./road"),
 Communication:require("./communication"),
 Persistence:require("./persistence"),
 EnvironmentGuard:require("./environment-guard"),
 EmergencyStop:require("./emergency-stop-manager")
};