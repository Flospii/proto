<template>
  <UCard class="h-full flex flex-col">
    <template #header>
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold">Decoded Results (Heuristic)</h3>
        <UBadge v-if="decodedFields.length" color="success" variant="subtle">
          {{ decodedFields.length }} fields
        </UBadge>
      </div>
    </template>

    <div class="flex-grow overflow-auto">
      <div
        v-if="!decodedFields.length"
        class="text-gray-400 text-center py-8 italic"
      >
        No data to display. Enter a payload above.
      </div>
      <div v-else class="space-y-1">
        <div v-for="(field, index) in decodedFields" :key="index">
          <FieldNode :field="field" :depth="0" />
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { useProtobufStore } from "~/stores/protobuf";
import { storeToRefs } from "pinia";
import FieldNode from "./FieldNode.vue";

const store = useProtobufStore();
const { decodedHeuristic: decodedFields } = storeToRefs(store);
</script>
