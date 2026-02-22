<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold">Input Buffer</h3>
        <USelect
          v-model="format"
          :items="[
            { label: 'Hex', value: 'hex' },
            { label: 'Base64', value: 'base64' },
          ]"
          class="w-32"
        />
      </div>
    </template>

    <UTextarea
      v-model="input"
      placeholder="Paste your hex or base64 protobuf payload here..."
      :rows="6"
      class="font-mono text-sm"
      @update:model-value="onInput"
    />

    <template #footer>
      <div v-if="error" class="text-red-500 text-sm">
        {{ error }}
      </div>
      <div v-else class="text-gray-500 text-xs">
        {{ bufferSize }} bytes loaded
      </div>
    </template>
  </UCard>
</template>

<script setup lang="ts">
import { useProtobufStore } from "~/stores/protobuf";
import { storeToRefs } from "pinia";

const store = useProtobufStore();
const {
  inputString: input,
  inputFormat: format,
  error,
  rawBuffer,
} = storeToRefs(store);

const bufferSize = computed(() => rawBuffer.value.length);

function onInput() {
  store.setInput(input.value, format.value);
}

watch(format, () => {
  if (input.value) {
    onInput();
  }
});
</script>
