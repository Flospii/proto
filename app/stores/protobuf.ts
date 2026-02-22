import { defineStore } from "pinia";
import { ProtobufDecoder, type DecodedField } from "../utils/protobuf-decoder";
import { SchemaAnalyzer } from "../utils/schema-analyzer";

export const useProtobufStore = defineStore("protobuf", {
  state: () => ({
    rawBuffer: new Uint8Array(0),
    inputString: "",
    inputFormat: "hex" as "hex" | "base64",
    protoSchema: "",
    selectedTypeName: "",
    decodedHeuristic: [] as DecodedField[],
    decodedSchema: null as any,
    availableTypes: [] as string[],
    error: null as string | null,
    analyzer: new SchemaAnalyzer(),
    selectedFieldIndex: null as number | null,
  }),

  actions: {
    setInput(input: string, format: "hex" | "base64") {
      this.inputString = input;
      this.inputFormat = format;
      this.error = null;
      try {
        if (format === "hex") {
          const hex = input.replace(/\s/g, "");
          if (hex.length % 2 !== 0) throw new Error("Invalid hex length");
          this.rawBuffer = new Uint8Array(
            hex.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16)),
          );
        } else {
          this.rawBuffer = Uint8Array.from(atob(input), (c) => c.charCodeAt(0));
        }
        this.decode();
      } catch (e: any) {
        this.error = `Input error: ${e.message}`;
        this.rawBuffer = new Uint8Array(0);
        this.decodedHeuristic = [];
      }
    },

    async setSchema(proto: string) {
      this.protoSchema = proto;
      this.error = null;
      try {
        await this.analyzer.loadSchema(proto);
        this.availableTypes = this.analyzer.getTypes();
        if (this.availableTypes.length > 0 && !this.selectedTypeName) {
          this.selectedTypeName = this.availableTypes[0] ?? "";
        }
        this.decode();
      } catch (e: any) {
        this.error = `Schema error: ${e.message}`;
        this.availableTypes = [];
      }
    },

    setTypeName(name: string) {
      this.selectedTypeName = name ?? "";
      this.decode();
    },

    decode() {
      if (this.rawBuffer.length === 0) return;

      // Always do heuristic decode
      try {
        this.decodedHeuristic = ProtobufDecoder.decodeRaw(this.rawBuffer);
      } catch (e: any) {
        this.error = `Heuristic decode error: ${e.message}`;
      }

      // Do schema decode if available
      if (this.selectedTypeName) {
        try {
          this.decodedSchema = this.analyzer.decodeWithSchema(
            this.rawBuffer,
            this.selectedTypeName,
          );
        } catch (e: any) {
          console.warn("Schema decode failed, falling back to heuristic", e);
          this.decodedSchema = null;
        }
      }
    },

    selectField(index: number | null) {
      this.selectedFieldIndex = index;
    },
  },
});
