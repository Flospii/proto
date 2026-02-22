<template>
  <div
    class="flex flex-col border-s-2 border-gray-100 dark:border-gray-800 ml-2"
  >
    <div
      class="group flex items-center gap-2 px-2 py-1 hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer transition-colors"
      :class="{ 'bg-primary-50 dark:bg-primary-950/20': isSelected }"
      :style="{ paddingLeft: `${depth * 16 + 8}px` }"
      @click="select"
    >
      <div class="flex items-center gap-1 min-w-[30px]">
        <span class="text-xs font-bold text-gray-400">{{ field.index }}:</span>
      </div>

      <div class="flex flex-col flex-grow min-w-0">
        <div class="flex items-center gap-2">
          <span
            class="text-xs font-mono px-1 bg-gray-100 dark:bg-gray-800 rounded text-gray-500"
          >
            {{ field.type }}
          </span>
          <span class="text-sm font-medium truncate">
            {{
              Array.isArray(field.value)
                ? `Message (${field.value.length} fields)`
                : field.value
            }}
          </span>
        </div>
      </div>

      <div class="text-[10px] text-gray-400 font-mono">
        [{{ field.start }}-{{ field.end }}]
      </div>
    </div>

    <!-- Recursive children -->
    <div v-if="Array.isArray(field.value)">
      <FieldNode
        v-for="(subField, idx) in field.value"
        :key="idx"
        :field="subField"
        :depth="depth + 1"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useProtobufStore } from "~/stores/protobuf";
import { storeToRefs } from "pinia";
import type { DecodedField } from "~/utils/protobuf-decoder";

const props = defineProps<{
  field: DecodedField;
  depth: number;
}>();

const store = useProtobufStore();
const { selectedFieldIndex } = storeToRefs(store);

const isSelected = computed(() => {
  // This is a simplified selection logic; for real nested selection we might need IDs
  return false;
});

function select() {
  // store.selectField(props.field.start)
}
</script>
