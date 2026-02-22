<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold">Schema Editor</h3>
        <USelect
          v-if="availableTypes.length"
          v-model="selectedType"
          :items="availableTypes.map((t) => ({ label: t, value: t }))"
          placeholder="Select root type"
          class="min-w-48"
        />
      </div>
    </template>

    <UTextarea
      v-model="schema"
      placeholder="Paste your .proto definition here..."
      :rows="10"
      class="font-mono text-sm"
      @update:model-value="onSchemaInput"
    />

    <template #footer>
      <div class="flex items-center gap-2 text-xs">
        <span v-if="availableTypes.length" class="text-green-500">
          Parsed {{ availableTypes.length }} types
        </span>
        <span v-else class="text-gray-400"> No types detected </span>
      </div>
    </template>
  </UCard>
</template>

<script setup lang="ts">
import { useProtobufStore } from "~/stores/protobuf";
import { storeToRefs } from "pinia";

const store = useProtobufStore();
const {
  protoSchema: schema,
  selectedTypeName: selectedType,
  availableTypes,
} = storeToRefs(store);

function onSchemaInput() {
  store.setSchema(schema.value);
}

watch(selectedType, (newType) => {
  store.setTypeName(newType);
});
</script>
