<template>
  <ClientOnly>
    <UCard class="h-full flex flex-col">
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold">
            Decoded Results ({{ decodedSchema ? "Schema" : "Heuristic" }})
          </h3>
          <UBadge
            v-if="decodedFields.length || decodedSchema"
            color="success"
            variant="subtle"
          >
            {{
              decodedSchema
                ? Object.keys(decodedSchema).length
                : decodedFields.length
            }}
            items
          </UBadge>
        </div>
      </template>

      <div class="flex-grow overflow-auto">
        <div
          v-if="!decodedFields.length && !decodedSchema"
          class="text-gray-400 text-center py-8 italic"
        >
          No data to display. Enter a payload above.
        </div>

        <!-- Schema View -->
        <div v-else-if="decodedSchema" class="space-y-1">
          <div v-for="(field, index) in decodedSchema" :key="index">
            <FieldNode :field="field" :depth="0" />
          </div>
        </div>

        <!-- Heuristic View -->
        <div v-else class="space-y-1">
          <div v-for="(field, index) in decodedFields" :key="index">
            <FieldNode :field="field" :depth="0" />
          </div>
        </div>
      </div>
    </UCard>
    <template #fallback>
      <UCard class="h-full flex items-center justify-center">
        <USkeleton class="w-full h-full" />
      </UCard>
    </template>
  </ClientOnly>
</template>

<script setup lang="ts">
import { useProtobufStore } from "~/stores/protobuf";
import { storeToRefs } from "pinia";
import FieldNode from "./FieldNode.vue";

const store = useProtobufStore();
const { decodedHeuristic: decodedFields, decodedSchema } = storeToRefs(store);
</script>
