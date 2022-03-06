/**
 * @jest-environment jsdom
 */
import { screen } from "@testing-library/vue";
import NoteCardsView from "@/components/notes/views/NoteCardsView.vue";
import store from "../fixtures/testingStore.js";
import { renderWithStoreAndMockRoute } from "../helpers";
import makeMe from "../fixtures/makeMe";

describe("note wth child cards", () => {

  it("should render note with one child", async () => {
    const notePosition = makeMe.aNotePosition.please()
    const noteParent = makeMe.aNote.title("parent").please();
    const noteChild = makeMe.aNote.title("child").under(noteParent).please();
    store.loadNotes([noteParent, noteChild]);
    renderWithStoreAndMockRoute(
      store,
      NoteCardsView,
      { props: { noteId: noteParent.id, notePosition, expandChildren: true } },
    )
    expect(screen.getAllByRole("title")).toHaveLength(1);
    await screen.findByText("parent");
    await screen.findByText("child");
  })
});