<template>
  <UCard class="h-full">
    <template #header>
      <h3 class="text-lg font-semibold">Hex Viewer</h3>
    </template>

    <div class="font-mono text-xs leading-relaxed overflow-auto max-h-[400px]">
      <div
        v-for="(row, rowIdx) in byteRows"
        :key="rowIdx"
        class="flex gap-4 border-b border-gray-50 dark:border-gray-900 py-1"
      >
        <!-- Offset -->
        <span class="text-gray-400 w-12">{{
          (rowIdx * 16).toString(16).padStart(4, "0")
        }}</span>

        <!-- Hex Bytes -->
        <div class="flex gap-1 w-[380px]">
          <span
            v-for="(byte, byteIdx) in row"
            :key="byteIdx"
            class="w-5 text-center transition-colors cursor-crosshair rounded"
            :class="getByteClass(rowIdx * 16 + byteIdx)"
          >
            {{ byte.toString(16).padStart(2, "0") }}
          </span>
        </div>

        <!-- ASCII -->
        <div class="flex gap-0 text-gray-400">
          <span v-for="(byte, byteIdx) in row" :key="byteIdx">
            {{ byte >= 32 && byte <= 126 ? String.fromCharCode(byte) : "." }}
          </span>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="text-[10px] text-gray-400 flex justify-between">
        <span>Click a field in the tree to highlight bytes (coming soon)</span>
        <span>Total: {{ buffer.length }} bytes</span>
      </div>
    </template>
  </UCard>
</template>

<script setup lang="ts">
import { useProtobufStore } from "~/stores/protobuf";
import { storeToRefs } from "pinia";

const store = useProtobufStore();
const { rawBuffer: buffer } = storeToRefs(store);

const byteRows = computed(() => {
  const rows = [];
  for (let i = 0; i < buffer.value.length; i += 16) {
    rows.push(Array.from(buffer.value.subarray(i, i + 16)));
  }
  return rows;
});

function getByteClass(index: number) {
  // We can add highlighting logic here based on store.selectedFieldRange
  return "hover:bg-primary-100 dark:hover:bg-primary-900/40 hover:text-primary-600";
}
</script>
