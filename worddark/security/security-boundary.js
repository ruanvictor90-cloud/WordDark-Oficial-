export const SECURITY_BOUNDARY_VERSION="1.0.0";

export const SECURITY_CHECKS=[
  "ADM_ROOT_ISOLATION",
  "WORLD_SECRET_ISOLATION",
  "OAUTH_CALLBACK_ISOLATION",
  "CAPABILITY_LEAST_PRIVILEGE",
  "INPUT_SANITIZATION",
  "OUTPUT_SANITIZATION",
  "ACCOUNT_SCOPE_ISOLATION",
  "AUDITABILITY",
  "REVOCATION",
  "ROTATION",
  "EMERGENCY_STOP",
  "REPLAY_PROTECTION",
  "REQUEST_IDEMPOTENCY",
  "RATE_LIMITING",
  "ERROR_REDACTION",
  "LOG_REDACTION",
  "ENVIRONMENT_SEPARATION",
  "PRODUCTION_GATE",
  "HUMAN_APPROVAL",
  "RECOVERY_PATH"
];

export const SECURITY_RULES={
  secretsNeverEnterWorld:true,
  secretsNeverEnterPublicInterface:true,
  oauthCodesNeverEnterWorld:true,
  rawTokensNeverEnterLogs:true,
  providerAccountsMustBeScoped:true,
  destructiveOperationsRequireExplicitCapability:true,
  publishOperationsCanRequireApproval:true,
  everyExternalOperationMustBeAuditable:true,
  failedAuthorizationMustFailClosed:true,
  errorsMustNotExposeSecrets:true,
  stagingMustNotShareProductionSecrets:true
};

export function securityBoundaryStatus(){
  return {version:SECURITY_BOUNDARY_VERSION,checks:SECURITY_CHECKS,rules:SECURITY_RULES};
}
