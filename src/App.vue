<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
    <header>
        <img alt="Vue logo" class="logo" src="@/assets/logo.svg" width="125" height="125"/>
    </header>

    <RouterView/>
</template>

<style scoped>
header {
    line-height: 1.5;
    max-height: 100vh;
    text-align: center;
}
</style>
