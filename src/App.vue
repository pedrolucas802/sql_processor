<template>
  <QueryProcessor/>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import QueryProcessor from './components/QueryProcessor.vue'

export default defineComponent({
  name: 'App',
  components: {
    QueryProcessor
  }
});
</script>

<style>
textarea {
  background-color: black;
  color: rgb(0, 145, 255);
  font-family: 'Courier New', Courier, monospace;
  font-weight: bold;
  width: 1240px !important;
  min-height: 360px;
  border: none;

}
.script-container {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  margin: 12px 0;
}
.output-container {
  display: flex;
  flex-direction: column;
  margin: 40px 0;
}
</style>
