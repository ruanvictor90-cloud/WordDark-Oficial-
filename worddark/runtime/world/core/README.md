# WordDark Core — Unified Central Copy

This branch is the isolated experimental copy of the central WordDark Core.

## Architecture
The consolidated runtime remains responsible for operational execution:
- operation engine
- security
- environment guard
- road / communication
- registry / persistence
- emergency stop

The integrated Core V1 foundation adds the structural layer:
- identity IDs
- entities and registry
- context
- contextual permissions
- gates
- operation package
- results
- services
- external connectors
- error recovery
- inbox
- version history

There is one active Core architecture. The old laboratory naming is not used by the integrated modules.

## Runtime
Use `WordDarkCoreRuntime` as the unified composition layer. It extends the existing operational runtime instead of creating a second world/runtime.

## Safety
This branch is `staging-core-v1-integration`. It is isolated from `main`. No code here is promoted automatically.

Pipeline:
SETOR → TESTES → VALIDAÇÃO → REVISÃO → AUTORIZAÇÃO → TRANSPLANTE → MAIN
