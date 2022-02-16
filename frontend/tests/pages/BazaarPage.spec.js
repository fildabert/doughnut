/**
 * @jest-environment jsdom
 */
 import BazaarPage from "@/pages/BazaarPage.vue";
 import flushPromises from "flush-promises";
 import _ from "lodash";
 import { renderWithStoreAndMockRoute } from "../helpers";
 import store from "../../src/store/index.js";
 import makeMe from "../fixtures/makeMe";
 
 jest.useFakeTimers();

 beforeEach(() => {
   fetch.resetMocks();
 });

describe("bazaar page", () => {
  test("fetch API to be called ONCE on mount", async () => {
    const notebook = makeMe.aNotebook.please();
    const bazaarNote = makeMe.aBazaarNote.notebooks(notebook).please();
    fetch.mockResponseOnce(JSON.stringify(bazaarNote));

    renderWithStoreAndMockRoute(store, BazaarPage);
    
    await flushPromises();
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith("/api/bazaar", {});
  });
});
