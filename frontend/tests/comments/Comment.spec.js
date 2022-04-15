/**
 * @jest-environment jsdom
 */
import helper from '../helpers';
import NoteCardsView from '@/components/notes/views/NoteCardsView.vue';
import makeMe from "../fixtures/makeMe";

helper.resetWithApiMock(beforeEach, afterEach)

describe('delete comment', () => {
  it('should be call once', async () => {
    const noteRealm = makeMe.aNoteRealm.withCommentOfId(237).please();
    helper.store.setFeatureToggle(true);
    helper.store.loadNoteRealms([noteRealm]);
    const wrapper = helper.component(NoteCardsView).withProps(
      {noteId: noteRealm.id, expandChildren: true}).mount()
    await wrapper.find('#comment-237-delete').trigger('click');
  });
});