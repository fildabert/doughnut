<template>
  <ToolbarFrame>
    <div class="btn-group btn-group-sm">
      <ViewTypeButtons v-bind="{ viewType, noteId: selectedNote.id }" />

      <NoteNewButton
        :parent-id="selectedNote.id"
        button-title="Add Child Note"
        @new-note-added="onNewNoteAdded($event)"
      >
        <SvgAddChild />
      </NoteNewButton>

      <NoteNewButton
        :parent-id="selectedNote.parentId"
        button-title="Add Sibling Note"
        v-if="!!selectedNote.parentId"
        @new-note-added="onNewNoteAdded($event)"
      >
        <SvgAddSibling />
      </NoteNewButton>

      <PopupButton title="edit note">
        <template #button_face>
          <SvgEdit />
        </template>
        <template #dialog_body="{ doneHandler }">
          <NoteEditDialog
            :note-id="selectedNote.id"
            @done="
              doneHandler($event);
              $emit('noteRealmUpdated');
            "
          />
        </template>
      </PopupButton>

      <PopupButton title="associate wikidata">
        <template #button_face>
          <SvgWikiData />
        </template>
        <template #dialog_body="{ doneHandler }">
          <WikidataAssociationDialog
            :note="selectedNote"
            @done="
              doneHandler($event);
              $emit('noteRealmUpdated', $event);
            "
          />
        </template>
      </PopupButton>

      <PopupButton title="link note">
        <template #button_face>
          <SvgSearch />
        </template>
        <template #dialog_body="{ doneHandler }">
          <LinkNoteDialog
            :note="selectedNote"
            @done="
              doneHandler($event);
              $emit('noteRealmUpdated', $event);
            "
          />
        </template>
      </PopupButton>

      <NoteUndoButton @note-realm-updated="$emit('noteRealmUpdated', $event)" />
      <div class="dropdown">
        <button
          class="btn btn-light dropdown-toggle"
          id="dropdownMenuButton"
          data-bs-toggle="dropdown"
          aria-haspopup="true"
          aria-expanded="false"
          role="button"
          title="more options"
        >
          <SvgCog />
        </button>
        <div class="dropdown-menu dropdown-menu-end">
          <PopupButton class="dropdown-item" title="Edit review settings">
            <template #button_face>
              <SvgReviewSetting />Edit review settings
            </template>
            <template #dialog_body="{ doneHandler }">
              <ReviewSettingEditDialog
                :note-id="selectedNote.id"
                :title="selectedNote.title"
                @done="doneHandler($event)"
              />
            </template>
          </PopupButton>
          <NoteDeleteButton
            class="dropdown-item"
            :note="selectedNote"
            @note-deleted="$emit('noteDeleted', $event)"
          />
        </div>
      </div>
    </div>
  </ToolbarFrame>
  <Breadcrumb v-bind="selectedNotePosition" />
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import Breadcrumb from "./Breadcrumb.vue";
import NoteUndoButton from "./NoteUndoButton.vue";
import useStoredLoadingApi from "../../managedApi/useStoredLoadingApi";
import PopupButton from "../commons/Popups/PopupButton.vue";
import SvgSearch from "../svgs/SvgSearch.vue";
import LinkNoteDialog from "../links/LinkNoteDialog.vue";
import { ViewTypeName } from "../../models/viewTypes";
import ToolbarFrame from "./ToolbarFrame.vue";
import SvgWikiData from "../svgs/SvgWikiData.vue";
import WikidataAssociationDialog from "../notes/WikidataAssociationDialog.vue";
import SvgAddChild from "../svgs/SvgAddChild.vue";
import SvgAddSibling from "../svgs/SvgAddSibling.vue";
import SvgCog from "../svgs/SvgCog.vue";
import NoteNewButton from "./NoteNewButton.vue";
import ViewTypeButtons from "./ViewTypeButtons.vue";
import SvgReviewSetting from "../svgs/SvgReviewSetting.vue";
import ReviewSettingEditDialog from "../review/ReviewSettingEditDialog.vue";
import SvgEdit from "../svgs/SvgEdit.vue";
import NoteEditDialog from "../notes/NoteEditDialog.vue";
import usePopups from "../commons/Popups/usePopup";
import NoteDeleteButton from "./NoteDeleteButton.vue";

export default defineComponent({
  setup() {
    return { ...useStoredLoadingApi(), ...usePopups() };
  },
  props: {
    selectedNote: { type: Object as PropType<Generated.Note>, required: true },
    selectedNotePosition: {
      type: Object as PropType<Generated.NotePositionViewedByUser>,
      required: true,
    },
    viewType: { type: String as PropType<ViewTypeName>, required: true },
  },
  emits: ["noteDeleted", "noteRealmUpdated", "newNoteAdded"],
  components: {
    NoteUndoButton,
    Breadcrumb,
    PopupButton,
    SvgSearch,
    LinkNoteDialog,
    ToolbarFrame,
    SvgWikiData,
    WikidataAssociationDialog,
    SvgCog,
    SvgAddChild,
    SvgAddSibling,
    NoteNewButton,
    ViewTypeButtons,
    SvgReviewSetting,
    ReviewSettingEditDialog,
    SvgEdit,
    NoteEditDialog,
    NoteDeleteButton,
  },
  computed: {
    featureToggle() {
      return this.piniaStore.featureToggle;
    },
  },
  methods: {
    onNewNoteAdded(newNote: Generated.NoteRealmWithPosition) {
      this.$emit("newNoteAdded", newNote);
    },
  },
});
</script>
