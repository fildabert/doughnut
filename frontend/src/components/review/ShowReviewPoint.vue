<template>
  <div class="alert alert-danger" v-if="reviewPoint.removedFromReview">
    This review point has been removed from reviewing.
  </div>
  <div v-if="noteId">
    <NoteShowPage
      v-if="noteId"
      v-bind="{
        noteId,
        expandChildren: false,
      }"
      :key="noteId"
    />
  </div>

  <div v-if="link">
    <div class="jumbotron py-4 mb-2">
      <LinkShow
        v-bind="{ link }"
        @note-realm-updated="$emit('noteRealmUpdated', $event)"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import LinkShow from "../links/LinkShow.vue";
import NoteShowPage from "../../pages/NoteShowPage.vue";

export default defineComponent({
  props: {
    reviewPoint: {
      type: Object as PropType<Generated.ReviewPoint>,
      required: true,
    },
  },
  emits: ["noteRealmUpdated"],
  components: { LinkShow, NoteShowPage },
  computed: {
    noteId() {
      return this.reviewPoint.thing.note?.id;
    },
    link() {
      return this.reviewPoint.thing.link;
    },
  },
});
</script>
