<template>
  <LoadingPage v-bind="{ loading, contentExists: !!notePosition }">
    <Breadcrumb v-bind="notePosition" />
  </LoadingPage>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import useLoadingApi from "../../managedApi/useLoadingApi";
import LoadingPage from "../../pages/commons/LoadingPage.vue";
import Breadcrumb from "./Breadcrumb.vue";

export default defineComponent({
  setup() {
    return { ...useLoadingApi({ initalLoading: true }) };
  },
  props: {
    noteId: { type: Number, required: true },
  },
  components: {
    LoadingPage,
    Breadcrumb,
  },
  data() {
    return {
      notePosition: undefined as Generated.NotePositionViewedByUser | undefined,
    };
  },
  methods: {
    async fetchData() {
      this.notePosition = await this.api.noteMethods.getNotePosition(
        this.noteId
      );
    },
  },

  mounted() {
    this.fetchData();
  },
});
</script>
