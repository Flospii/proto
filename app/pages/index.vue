<template>
  <div class="container mx-auto p-4 space-y-4">
    <div class="flex flex-col lg:flex-row gap-4">
      <!-- Left Column: Input and Schema -->
      <div class="w-full lg:w-1/3 flex flex-col gap-4">
        <BufferInput />
        <SchemaEditor />
      </div>

      <!-- Right Column: Results and Hex -->
      <div class="w-full lg:w-2/3 flex flex-col gap-4">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
          <ResultTreeView class="h-[600px]" />
          <HexViewer class="h-[600px]" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import BufferInput from "~/components/BufferInput.vue";
import SchemaEditor from "~/components/SchemaEditor.vue";
import ResultTreeView from "~/components/ResultTreeView.vue";
import HexViewer from "~/components/HexViewer.vue";
</script>
