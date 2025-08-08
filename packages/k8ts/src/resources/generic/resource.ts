import { Kind, type Origin } from "@k8ts/instruments";
import type { Meta } from "@k8ts/metadata";
import { ManifestResource } from "../../node/manifest-resource";

export interface ManifestObject {
  apiVersion: string;
  kind: string;
  metadata?: Record<string, any>;
  [key: string]: any;
}

export class GenericResource extends ManifestResource<ManifestObject> {
  readonly kind: Kind.Kind;
  constructor(origin: Origin, meta: Meta, manifest: ManifestObject) {
    super(origin, meta, manifest);
    const [group, version] = manifest.apiVersion.includes("/")
      ? manifest.apiVersion.split("/")
      : ["", manifest.apiVersion];
    this.kind = Kind.group(group).version(version as any).kind(manifest.kind);
  }

  protected override async manifest() {
    const { apiVersion, kind, metadata = {}, ...rest } = this.props;
    return {
      apiVersion,
      kind,
      ...rest,
      metadata: {
        ...metadata,
        name: this.name,
        ...(this.namespace ? { namespace: this.namespace } : {}),
      },
    };
  }
}

export type Resource = GenericResource;
