import Long from "long";

export enum WireType {
  VARINT = 0,
  FIXED64 = 1,
  LENGTH_DELIMITED = 2,
  START_GROUP = 3,
  END_GROUP = 4,
  FIXED32 = 5,
}

export interface DecodedField {
  index: number;
  wireType: WireType;
  raw: Uint8Array;
  value: any;
  type: string;
  name?: string;
  nested?: DecodedField[];
  start: number;
  end: number;
  formatted?: string;
}

export class ProtobufDecoder {
  static decodeVarint(
    buffer: Uint8Array,
    offset: number,
  ): { value: Long; bytesRead: number } {
    let result = Long.UZERO;
    let shift = 0;
    let bytesRead = 0;

    while (offset + bytesRead < buffer.length) {
      const byte = buffer[offset + bytesRead];
      if (byte === undefined) break;
      bytesRead++;
      result = result.or(Long.fromNumber(byte & 0x7f).shiftLeft(shift));
      if ((byte & 0x80) === 0) break;
      shift += 7;
      if (shift >= 64) throw new Error("Varint too long");
    }

    return { value: result, bytesRead };
  }

  static isProbablyMessage(buffer: Uint8Array): boolean {
    if (buffer.length === 0) return false;
    try {
      const decoded = this.decodeRaw(buffer);
      // If we found valid fields and total bytes consumed match, it's likely a message
      let totalBytes = 0;
      for (const field of decoded) {
        totalBytes = Math.max(totalBytes, field.end);
      }
      return decoded.length > 0 && totalBytes <= buffer.length;
    } catch (e) {
      return false;
    }
  }

  static formatTimestamp(seconds: Long, nanos: number): string {
    const ms = seconds.toNumber() * 1000 + Math.floor(nanos / 1000000);
    return new Date(ms).toISOString();
  }

  static decodeRaw(buffer: Uint8Array): DecodedField[] {
    const fields: DecodedField[] = [];
    let offset = 0;

    while (offset < buffer.length) {
      const start = offset;
      const { value: tag, bytesRead: tagBytes } = this.decodeVarint(
        buffer,
        offset,
      );
      offset += tagBytes;

      const fieldNumber = tag.shiftRightUnsigned(3).toNumber();
      const wireType = tag.and(0x07).toNumber() as WireType;

      let value: any;
      let type = "unknown";
      let formatted: string | undefined;

      switch (wireType) {
        case WireType.VARINT: {
          const { value: v, bytesRead: vBytes } = this.decodeVarint(
            buffer,
            offset,
          );
          offset += vBytes;
          value = v.toString();
          type = "varint";
          break;
        }
        case WireType.FIXED64: {
          value = new DataView(buffer.buffer, buffer.byteOffset + offset, 8)
            .getBigUint64(0, true)
            .toString();
          offset += 8;
          type = "fixed64";
          break;
        }
        case WireType.LENGTH_DELIMITED: {
          const { value: len, bytesRead: lenBytes } = this.decodeVarint(
            buffer,
            offset,
          );
          offset += lenBytes;
          const length = len.toNumber();
          const subBuffer = buffer.subarray(offset, offset + length);
          offset += length;

          if (this.isProbablyMessage(subBuffer)) {
            const nested = this.decodeRaw(subBuffer);
            value = nested;
            type = "message";

            // Heuristic for Timestamp: Message with field 1 (seconds) and field 2 (nanos)
            if (
              nested.length === 2 &&
              nested.find((f) => f.index === 1 && f.type === "varint") &&
              nested.find((f) => f.index === 2 && f.type === "varint")
            ) {
              const s = Long.fromString(
                nested.find((f) => f.index === 1)!.value,
              );
              const n = parseInt(nested.find((f) => f.index === 2)!.value);
              // Rough check for valid timestamp seconds (year 1980 to 2100)
              if (s.greaterThan(315532800) && s.lessThan(4102444800)) {
                formatted = this.formatTimestamp(s, n);
              }
            }
          } else {
            // Heuristic for string vs bytes
            const isASCII = Array.from(subBuffer).every(
              (b) => b >= 32 && b <= 126,
            );
            if (isASCII && subBuffer.length > 0) {
              value = new TextDecoder().decode(subBuffer);
              type = "string";
            } else {
              value = Array.from(subBuffer)
                .map((b) => b.toString(16).padStart(2, "0"))
                .join(" ");
              type = "bytes";
            }
          }
          break;
        }
        case WireType.FIXED32: {
          value = new DataView(
            buffer.buffer,
            buffer.byteOffset + offset,
            4,
          ).getUint32(0, true);
          offset += 4;
          type = "fixed32";
          break;
        }
        default:
          throw new Error(`Unsupported wire type: ${wireType}`);
      }

      fields.push({
        index: fieldNumber,
        wireType,
        raw: buffer.subarray(start, offset),
        value,
        type,
        start,
        end: offset,
        formatted,
      });
    }

    return fields;
  }
}
