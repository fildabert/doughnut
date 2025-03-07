<template>
  <form @submit.prevent="processForm">
    <LinkTypeSelectCompact
      scope-name="note"
      field="linkTypeToParent"
      :allow-empty="true"
      v-model="creationData.linkTypeToParent"
      :errors="formErrors.linkTypeToParent"
    />
    <NoteFormTitleOnly
      v-model="creationData.textContent"
      :errors="formErrors.textContent"
    />
    <TextInput
      scope-name="wikidataID"
      field="wikidataID"
      v-model="creationData.wikidataId"
      :errors="formErrors.wikiDataId"
      placeholder="example: `Q1234`"
    />
    <WikidataSearchByLabel
      :title="creationData.textContent.title"
      @selected="onSelectWikidataEntry"
    />
    <fieldset class="secondary-info">
      <legend>Similar Notes</legend>
      <SearchResults
        v-bind="{
          noteId: parentId,
          inputSearchKey: creationData.textContent.title,
        }"
      />
    </fieldset>
  </form>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import TextInput from "../form/TextInput.vue";
import NoteFormTitleOnly from "./NoteFormTitleOnly.vue";
import useStoredLoadingApi from "../../managedApi/useStoredLoadingApi";
import SearchResults from "../search/SearchResults.vue";
import LinkTypeSelectCompact from "../links/LinkTypeSelectCompact.vue";
import WikidataSearchByLabel from "./WikidataSearchByLabel.vue";

export default defineComponent({
  setup() {
    return useStoredLoadingApi({ initalLoading: true, hasFormError: true });
  },
  components: {
    NoteFormTitleOnly,
    SearchResults,
    LinkTypeSelectCompact,
    TextInput,
    WikidataSearchByLabel,
  },
  props: { parentId: { type: Number, required: true } },
  emits: ["done"],
  data() {
    return {
      creationData: {
        linkTypeToParent: "no link",
        textContent: { title: "" },
        wikidataId: "",
      } as Generated.NoteCreation,
      formErrors: {
        linkTypeToParent: undefined,
        textContent: {},
        wikiDataId: undefined as undefined | string,
      },
    };
  },
  methods: {
    processForm() {
      this.formErrors.wikiDataId = undefined;
      this.formErrors.textContent = {};
      this.storedApi
        .createNote(this.parentId, this.creationData)
        .then((res) => {
          this.$emit("done", res);
        })
        .catch((res) => (this.formErrors = res));
    },
    onSelectWikidataEntry(selectedSuggestion: Generated.WikidataSearchEntity) {
      this.creationData.textContent.title = selectedSuggestion.label;
      this.creationData.wikidataId = selectedSuggestion.id;
    },
  },
});
</script>

<style lang="sass">
.secondary-info
  margin-top: 1rem
  padding: 5px
  margin: 0
  border: 1px solid #ccc
  border-radius: 4px
  color: #999
  font-size: smaller

  legend
    font-size: 1.2rem
    margin-bottom: 0.5rem
    float: none
    width: auto
</style>
