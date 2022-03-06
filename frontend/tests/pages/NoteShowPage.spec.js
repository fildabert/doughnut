/**
 * @jest-environment jsdom
 */
 import { screen } from "@testing-library/vue";
 import NoteShowPage from "@/pages/NoteShowPage.vue";
 import NoteWithLinks from "@/components/notes/NoteWithLinks.vue";
 import flushPromises from "flush-promises";
 import _ from "lodash";
 import store from "../fixtures/testingStore.js";
 import { renderWithStoreAndMockRoute, 
  mountWithStoreAndMockRoute } from "../helpers";
 import makeMe from "../fixtures/makeMe";
 import { viewType } from "../../src/models/viewTypes";

 jest.useFakeTimers();
 describe("all in note show page", () => {
 describe("note show", () => {
    const note = makeMe.aNote.please()
    const stubResponse = {
      notePosition: makeMe.aNotePosition.inCircle('a circle').please(),
      notes: [ note ]
    };

    beforeEach(() => {
      fetch.resetMocks();
      fetch.mockResponse(JSON.stringify(stubResponse));
    });


   test(" should fetch API to be called TWICE when viewType is not included ", async () => {

     renderWithStoreAndMockRoute(store, NoteShowPage, {
       propsData: { noteId: note.id },
     });
     await flushPromises();
     jest.advanceTimersByTime(5000);
     expect(fetch).toHaveBeenCalledTimes(1);
     expect(fetch).toHaveBeenCalledWith(`/api/notes/${note.id}`, expect.anything());
     await screen.findByText("a circle");
   });

   test(" should fetch API to be called when viewType is mindmap ", async () => {
    const viewTypeValue = "mindmap";
    renderWithStoreAndMockRoute(store, NoteShowPage, {
      propsData: { noteId: note.id, viewType: viewTypeValue },
    });
    await flushPromises();
    expect(viewType(viewTypeValue).fetchAll).toBe(true);
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(`/api/notes/${note.id}/overview`, expect.anything());
    await screen.findByText("a circle");
  
  });



 });

 

 describe("polling data", () => {
  it("should not call fetch API when inputing text ", async () => {
    const note = makeMe.aNote.title("Dummy Title").please();
    store.loadNotes([note]);

    const { wrapper } = mountWithStoreAndMockRoute(store, NoteWithLinks, {
      props: {
        note
      },
    });

    await wrapper.find('[role="title"]').trigger("click");
    await wrapper.find('[role="title"] input').trigger("input");
    

    await flushPromises();
    jest.advanceTimersByTime(5000);
    expect(fetch).not.toHaveBeenCalledWith(
      `/api/notes/${note.id}`,{}
    );
  });

});

});
 