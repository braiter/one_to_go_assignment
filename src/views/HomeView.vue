<script setup lang="ts">
import MaskedInput from "@/components/MaskedInput.vue";
import {ref} from "vue";

const date = ref("");
</script>

<template>
  <main>
      <div class="greetings">
          <MaskedInput v-model:date="date"/>
      </div>
  </main>
</template>
