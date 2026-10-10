export function id(prefix="ID") {
  const safePrefix=String(prefix||"ID").trim().replace(/[^A-Za-z0-9_-]+/g,"-")||"ID";
  const randomId=globalThis.crypto?.randomUUID?.();
  const fallback=()=>`${Date.now().toString(36)}-${Math.random().toString(36).slice(2,12)}`;
  return `${safePrefix}-${randomId||fallback()}`;
}
