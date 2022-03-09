/**
 * @jest-environment jsdom
 */

import NoteOverview from "../../src/components/notes/NoteOverview.vue";
import makeMe from "../fixtures/makeMe";
import { renderWithStoreAndMockRoute, StoredComponentTestHelper } from "../helpers";
import { screen } from "@testing-library/vue";

describe("note overview", () => {
  let helper: StoredComponentTestHelper;

  beforeEach(()=>{
    helper = new StoredComponentTestHelper();
  });

  it("should render one note", async () => {
    const note = makeMe.aNote.title("single note").please();
    helper.store.loadNotes([note]);
    helper.render(
      NoteOverview,
      { props: { noteId: note.id, expandChildren: true } },
    );
    expect(screen.getByRole("title")).toHaveTextContent("single note");
    expect(screen.getAllByRole("title")).toHaveLength(1);
  });

  it("should render one note with links", async () => {
    const note = makeMe.aNote.title("source").linkToSomeNote().please();
    helper.store.loadNotes([note]);
    helper.render(
      NoteOverview,
      { props: { noteId: note.id, expandChildren: true } },
    );
    await screen.findByText("a tool");
  });

  it("should render note with one child", async () => {
    const noteParent = makeMe.aNote.title("parent").please();
    const noteChild = makeMe.aNote.title("child").under(noteParent).please();
    helper.store.loadNotes([noteParent, noteChild]);
    helper.render(
      NoteOverview,
      { props: { noteId: noteParent.id, expandChildren: true } },
    );
    expect(screen.getAllByRole("title")).toHaveLength(2);
    await screen.findByText("parent");
    await screen.findByText("child");
  });

  it("should render note with grandchild", async () => {
    const noteParent = makeMe.aNote.title("parent").please();
    const noteChild = makeMe.aNote.title("child").under(noteParent).please();
    const noteGrandchild = makeMe.aNote.title("grandchild").under(noteChild).please();
    helper.store.loadNotes([noteParent, noteChild, noteGrandchild]);
    helper.render(
      NoteOverview,
      { props: { noteId: noteParent.id, expandChildren: true } },
    );
    await screen.findByText("parent");
    await screen.findByText("child");
    await screen.findByText("grandchild");
  });

});
