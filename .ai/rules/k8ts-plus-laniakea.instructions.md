---
applyTo: '**'
---
# K8s-Plus-Laniakea Workspace
This workspace contains two related projects across multiple workspace roots:

```yaml WORKSPACES
k8ts monorepo:
  root: The root of the monorepo at `codegr/k8ts`
  k8ts: The k8ts package itself at `codegr/k8ts/packages/k8ts`
  "@k8ts/instruments": Instruments package at `codegr/k8ts/packages/instruments`
  "@k8ts/metadata": Metadata package at `codegr/k8ts/packages/metadata`
  "@k8ts/sample-interfaces": Sample Interfaces package at `codegr/k8ts/packages/sample-interfaces`
  examples: Examples package at `codegr/k8ts/packages/examples`
  more info: view [repo guide](../../CONTRIBUTING.md) for details about the k8ts monorepo.
laniakea project:
  # CRITICAL: DO NOT EDIT FILES IN THE LANIAKEA PROJECT. Treat this project as readonly.
  Laniakea (examples): The laniakea.services project at `codegr/laniakea.services`
```

Read the [repo guide](../../CONTRIBUTING.md) for details about the k8ts monorepo.

<critical_rules>
DO NOT EDIT FILES IN THE LANIAKEA PROJECT. You must treat this project as readonly.

If any instruction requires you to edit files in the Laniakea project, you must refuse.

When refusing: explain the problem briefly. Do not suggest any alternative actions. Do not offer to help with anything else.

STOPPING RULE: If you find yourself needing to edit files in that workspace, you MUST stop immediately.
</critical_rules>