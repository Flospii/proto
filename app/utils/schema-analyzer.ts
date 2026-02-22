import protobuf from "protobufjs";

export interface SchemaTreeNode {
  name: string;
  fieldNumber: number;
  type: string;
  value: any;
  children?: SchemaTreeNode[];
}

export class SchemaAnalyzer {
  private root: protobuf.Root | null = null;

  async loadSchema(protoContent: string): Promise<void> {
    try {
      this.root = protobuf.parse(protoContent).root;
    } catch (e: any) {
      throw new Error(`Failed to parse proto: ${e.message}`);
    }
  }

  getTypes(): string[] {
    if (!this.root) return [];
    const types: string[] = [];
    const traverse = (obj: any, parentName = "") => {
      if (obj instanceof protobuf.Type) {
        types.push(parentName + obj.name);
      }
      if (obj.nested) {
        Object.keys(obj.nested).forEach((key) => {
          traverse(
            obj.nested[key],
            parentName + (obj.name ? obj.name + "." : ""),
          );
        });
      }
    };
    traverse(this.root);
    return types;
  }

  decodeWithSchema(buffer: Uint8Array, typeName: string): any {
    if (!this.root) throw new Error("Schema not loaded");
    const Type = this.root.lookupType(typeName);
    const message = Type.decode(buffer);
    return Type.toObject(message, {
      longs: String,
      enums: String,
      bytes: String,
      defaults: true,
      arrays: true,
      objects: true,
      oneofs: true,
    });
  }

  // A more advanced version that returns structured metadata including unknown fields
  decodeWithMetadata(buffer: Uint8Array, typeName: string): any {
    if (!this.root) return null;
    const Type = this.root.lookupType(typeName);
    const message = Type.decode(buffer);

    // protobufjs stores unknown fields in message.$unknown
    // We can use this to merge schema fields and unknown fields
    return {
      decoded: Type.toObject(message, {
        longs: String,
        enums: String,
        bytes: String,
      }),
      unknown: message.constructor.prototype.$unknown || [],
    };
  }
}
