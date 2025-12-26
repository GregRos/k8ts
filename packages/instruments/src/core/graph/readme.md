# Origins and Resources

K8ts tries to model k8s resources and the things that contain these resources - file, folders, etc.

K8s resources are naturally represented by the `Resource` classes. Meanwhile, `Origin` classes are the containers from which those resources *originate*.

1. A `Deployment` is a Resource.
2. The file in which the Deployment's manifest appears is an `Origin`.

Resource and Origin classes are both Entitiies. We'll go over that concept elsewhere, but it generally means:

That leads to two kind of classes: `Origins` and `Resources`. The `Origin` class represents a container from which `Resources` *originate*. Origins typically produce their `Resources` lazily, when required. This allows resources to reference each other via the `FwRef` mechanism that we won't talk about here.

## Overview

The workspace implements a graph-based system for Kubernetes resource management with four key concepts that form a 2×2 matrix of relationships:

- **Entity**: The data layer (Origin and Resource are both Entity types)
- **Node**: The navigation/traversal layer wrapping Entities
- **Origin**: Abstract base for user-defined resource classes
- **Resource**: Concrete manifestable Kubernetes resources

## The Four Combinations

### 1. Origin Entity (`Origin<_Node, _Origin>`)

**Purpose**: Abstract base class for user-defined resource types that establishes inheritance hierarchies.

**Characteristics**:

- Extends `Entity`
- Cannot be directly manifested into Kubernetes YAML
- Serves as a template/parent for concrete Resources
- Defines shared structure, metadata, and behavior

**Key Methods**:

- `asResource()`: Converts to a manifestable Resource
- Propagates metadata and configuration to child Resources

### 2. Origin Node (`OriginNode<_Origin>`)

**Purpose**: Navigation and traversal wrapper around Origin entities.

**Characteristics**:

- Extends `Node`
- Provides graph traversal methods for Origins
- Immutable wrapper (changes affect underlying Entity)
- Used primarily during resource construction phase

**Key Properties**:

- `kids`: Child Origin/Resource nodes
- `parent`: Parent Origin node
- `relations`: Dependencies between Origins
- `descendants`, `ancestors`: Tree navigation

### 3. Resource Entity (`Resource<_Node, _Resource>`)

**Purpose**: Concrete manifestable Kubernetes resource that produces YAML output.

**Characteristics**:

- Extends `Origin` (and therefore `Entity`)
- Contains actual Kubernetes API object specifications
- Can be serialized to YAML manifests
- Represents deployable infrastructure

**Key Methods**:

- `manifest()`: Generates Kubernetes YAML
- `asResource()`: Returns self (already a Resource)

**Key Properties**:

- `apiObject`: The underlying cdk8s ApiObject
- `chart`: The cdk8s Chart context

### 4. Resource Node (`ResourceNode<_Resource>`)

**Purpose**: Navigation wrapper with manifestation capabilities for Resource entities.

**Characteristics**:

- Extends `OriginNode` (and therefore `Node`)
- Primary interface used during manifestation pipeline
- Resolves all `FwRef` instances when accessed
- Provides dependency graph for build ordering

**Key Properties**:

- All Node traversal methods (`kids`, `relations`, `recursiveRelations`)
- `recursiveRelationsSubtree`: Dependencies across entire subtree
- Used to determine manifest generation order

## Relationship Patterns

### Entity ↔ Node Binding

Every Entity type has a corresponding Node type:

- `Origin` ↔ `OriginNode`
- `Resource` ↔ `ResourceNode`

Entities maintain a reference to their Node via the `.node` property, which forces `FwRef` resolution.

### Origin → Resource Transformation

```typescript
// Origin (abstract/template)
class MyOrigin extends Origin<OriginNode<MyOrigin>, MyOrigin> {
  asResource() {
    return new MyResource(...)
  }
}

// Resource (concrete/manifestable)
class MyResource extends Resource<ResourceNode<MyResource>, MyResource> {
  manifest() {
    return /* Kubernetes YAML */
  }
}
```

### Graph Traversal Hierarchy

```
Node (abstract)
├── Provides: kids, parent, ancestors, descendants, relations
├── OriginNode
│   └── Inherits all Node capabilities
│   └── Wraps Origin entities
└── ResourceNode
    └── Inherits all OriginNode + Node capabilities
    └── Wraps Resource entities
    └── Used in manifestation pipeline
```

### Entity Hierarchy

```
Entity (abstract base)
└── Origin (abstract, non-manifestable)
    └── Resource (concrete, manifestable)
```

## Key Insights

1. **Separation of Concerns**: Entity handles data/state, Node handles navigation
2. **Inheritance Mirror**: Node hierarchy mirrors Entity hierarchy exactly
3. **Lazy Resolution**: Accessing `.node` forces `FwRef` resolution
4. **Immutability**: Nodes are immutable wrappers; mutations affect underlying Entities
5. **Equality**: Node equality is based on wrapped Entity identity, not Node instance
6. **Manifestation Gate**: Only Resources (not Origins) can generate Kubernetes YAML

## Usage Phases

1. **Construction Phase**: Users create Origins, build entity trees
2. **Transformation Phase**: Origins converted to Resources via `asResource()`
3. **Manifestation Phase**: ResourceNodes traverse dependency graph, generate YAML in correct order
