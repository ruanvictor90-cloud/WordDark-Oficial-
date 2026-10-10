const RULES=[
  {id:"PRIVATE_KEY",severity:"CRITICAL",pattern:/-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/i},
  {id:"AWS_ACCESS_KEY",severity:"CRITICAL",pattern:/\bAKIA[0-9A-Z]{16}\b/},
  {id:"GENERIC_SECRET_ASSIGNMENT",severity:"HIGH",pattern:/\b(?:password|passwd|secret|api[_-]?key|access[_-]?token|refresh[_-]?token)\s*[:=]\s*["'][^"']{8,}["']/i},
  {id:"OAUTH_CLIENT_SECRET",severity:"HIGH",pattern:/\bclient[_-]?secret\s*[:=]\s*["'][^"']{8,}["']/i}
];

class WordDarkSecretPolicy {
  scan(content=""){
    return RULES.filter(rule=>rule.pattern.test(String(content))).map(({id,severity})=>({id,severity}));
  }

  assertClean(content=""){
    const findings=this.scan(content);
    return {clean:findings.length===0,findings};
  }
}
if(typeof module!=="undefined") module.exports=WordDarkSecretPolicy;
if(typeof window!=="undefined") window.WordDarkSecretPolicy=WordDarkSecretPolicy;
