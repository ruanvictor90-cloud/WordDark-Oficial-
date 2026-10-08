import {securityBoundaryStatus} from "./security-boundary.js";

function assert(c,m){if(!c)throw new Error(m);}

export function runSecurityBoundaryTests(){
  const s=securityBoundaryStatus();
  assert(s.rules.secretsNeverEnterWorld,"SECRET_BOUNDARY");
  assert(s.rules.oauthCodesNeverEnterWorld,"OAUTH_BOUNDARY");
  assert(s.rules.rawTokensNeverEnterLogs,"LOG_BOUNDARY");
  assert(s.rules.providerAccountsMustBeScoped,"ACCOUNT_SCOPE");
  assert(s.rules.failedAuthorizationMustFailClosed,"FAIL_CLOSED");
  assert(s.rules.errorsMustNotExposeSecrets,"ERROR_REDACTION");
  assert(s.rules.stagingMustNotShareProductionSecrets,"ENVIRONMENT_ISOLATION");
  return {ok:true,checks:s.checks.length};
}
