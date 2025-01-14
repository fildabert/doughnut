// ***********************************************
// custom commands and overwrite existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

/// <reference types="cypress" />

import "@testing-library/cypress/add-commands"
import "cypress-file-upload"
import WikidataServiceTester from "./WikidataServiceTester"

Cypress.Commands.add("pageIsNotLoading", () => {
  cy.get(".loading-bar").should("not.exist")
})

Cypress.Commands.add("loginAs", (username) => {
  const password = "password"
  cy.request({
    method: "POST",
    url: "/login",
    form: true,
    body: { username, password },
  }).then((response) => {
    expect(response.status).to.equal(200)
  })
})

Cypress.Commands.add("logout", () => {
  cy.request({
    method: "POST",
    url: "/logout",
  }).then((response) => {
    expect(response.status).to.equal(204)
  })
})

Cypress.Commands.add("submitNoteCreationFormWith", (noteAttributes) => {
  const linkTypeToParent = noteAttributes["Link Type To Parent"]
  delete noteAttributes["Link Type To Parent"]
  const { Title, Description, ["Wikidata Id"]: wikidataId, ...remainingAttrs } = noteAttributes

  cy.submitNoteFormWith({
    Title,
    "Link Type To Parent": linkTypeToParent,
    "Wikidata Id": wikidataId,
  })

  if (!!Description) {
    if (!!Title) {
      cy.findByText(Title) // the creation has to be successful before continuing to edit the description
    }
    cy.inPlaceEdit({ Description })
  }

  if (Object.keys(remainingAttrs).length > 0) {
    cy.openAndSubmitNoteAccessoriesFormWith(Title, remainingAttrs)
  }
})

Cypress.Commands.add(
  "openAndSubmitNoteAccessoriesFormWith",
  (noteTitle: string, noteAccessoriesAttributes: Record<string, string>) => {
    cy.findByText(noteTitle)
    cy.clickNoteToolbarButton("edit note")
    cy.submitNoteFormWith(noteAccessoriesAttributes)
  },
)

Cypress.Commands.add("replaceFocusedText", (text) => {
  // cy.clear for now is an alias of cy.type('{selectall}{backspace}')
  // it doesn't clear the text sometimes.
  // Invoking it twice seems to solve the problem.
  cy.focused().clear().clear().type(text).type("{shift}{enter}")
})

Cypress.Commands.add("inPlaceEdit", (noteAttributes) => {
  for (const propName in noteAttributes) {
    const value = noteAttributes[propName]
    if (value) {
      cy.findByRole(propName.toLowerCase()).click()
      cy.replaceFocusedText(value)
    }
  }
})

Cypress.Commands.add("submitNoteFormWith", (noteAttributes) => {
  for (const propName in noteAttributes) {
    const value = noteAttributes[propName]
    if (value) {
      cy.getFormControl(propName).then(($input) => {
        if ($input.attr("type") === "file") {
          cy.fixture(value).then((img) => {
            cy.wrap($input).attachFile({
              fileContent: Cypress.Blob.base64StringToBlob(img),
              fileName: value,
              mimeType: "image/png",
            })
          })
        } else if ($input.attr("role") === "radiogroup") {
          cy.clickRadioByLabel(value)
        } else if ($input.attr("role") === "button") {
          cy.wrap($input).click()
          cy.clickRadioByLabel(value)
        } else {
          cy.wrap($input).clear().type(value)
        }
      })
    }
  }
  cy.get('input[value="Submit"]').click()
})

Cypress.Commands.add("clickAddChildNoteButton", () => {
  cy.pageIsNotLoading()
  cy.findAllByRole("button", { name: "Add Child Note" }).first().click()
})

Cypress.Commands.add("clickRadioByLabel", (labelText) => {
  cy.findByText(labelText, { selector: "label" }).click({ force: true })
})

Cypress.Commands.add("submitNoteCreationFormsWith", (notes) => {
  notes.forEach((noteAttributes) => cy.submitNoteCreationFormWith(noteAttributes))
})

Cypress.Commands.add("submitNoteFormsWith", (notes) => {
  notes.forEach((noteAttributes) => cy.submitNoteFormWith(noteAttributes))
})

Cypress.Commands.add("expectNoteCards", (expectedCards) => {
  expectedCards.forEach((elem) => {
    for (const propName in elem) {
      if (propName === "note-title") {
        cy.findByText(elem[propName], { selector: ".card-title a" }).should("be.visible")
      } else {
        cy.findByText(elem[propName])
      }
    }
  })
})

Cypress.Commands.add("navigateToChild", (noteTitle) => {
  cy.findByText(noteTitle, { selector: ".card-title" }).click()
  cy.expectNoteTitle(noteTitle)
})

Cypress.Commands.add("navigateToNotePage", (notePath: string) => {
  const found = notePath.match(/Top\/(.*)/)
  if (!found || found.length < 2) {
    throw new Error("the note path should be something like `Top/path/to/note`")
  }
  const noteTitlesDividedBySlash = found[1]
  cy.visitMyNotebooks()
  noteTitlesDividedBySlash
    .commonSenseSplit("/")
    .forEach((noteTitle) => cy.navigateToChild(noteTitle))
})

// jumptoNotePage is faster than navigateToNotePage
//    it uses the note id memorized when creating them with testability api
Cypress.Commands.add("jumpToNotePage", (noteTitle, forceLoadPage) => {
  cy.testability()
    .getSeededNoteIdByTitle(noteTitle)
    .then((noteId) => {
      const url = `/notes/${noteId}`
      if (forceLoadPage) cy.visit(url)
      else cy.routerPush(url, "noteShow", { noteId: noteId })
    })
  cy.expectNoteTitle(noteTitle)
})

Cypress.Commands.add("routerPush", (fallback, name, params) => {
  cy.get("@firstVisited").then((firstVisited) => {
    cy.window().then(async (win) => {
      if (!!win.router && firstVisited === "yes") {
        const failed = await win.router.push({
          name,
          params,
          query: { time: Date.now() }, // make sure the route re-render
        })
        if (!failed) {
          await cy.get(".modal-body").should("not.exist")
          return
        }
        cy.log("router push failed")
        cy.log(failed)
      }
      await cy.wrap("yes").as("firstVisited")
      await cy.visit(fallback)
    })
  })
})

Cypress.Commands.add("clickButtonOnCardBody", (noteTitle, buttonTitle) => {
  cy.findByText(noteTitle, { selector: ".card-title a" }).then(($card) => {
    cy.wrap($card)
      .parent()
      .parent()
      .findByText(buttonTitle)
      .then(($button) => {
        cy.wrap($button).click()
      })
  })
})

Cypress.Commands.add("visitMyNotebooks", () => {
  cy.visit("/notebooks")
})

Cypress.Commands.add("startSearching", () => {
  cy.clickNoteToolbarButton("link note")
})

Cypress.Commands.add("clickNotePageButton", (noteTitle, btnTextOrTitle, forceLoadPage) => {
  cy.jumpToNotePage(noteTitle, forceLoadPage)
  cy.clickNoteToolbarButton(btnTextOrTitle)
})

Cypress.Commands.add("clickNotePageMoreOptionsButton", (noteTitle, btnTextOrTitle) => {
  cy.jumpToNotePage(noteTitle)
  cy.clickNotePageMoreOptionsButtonOnCurrentPage(btnTextOrTitle)
})

Cypress.Commands.add("clickNotePageMoreOptionsButtonOnCurrentPage", (btnTextOrTitle) => {
  cy.clickNoteToolbarButton("more options")
  cy.clickNoteToolbarButton(btnTextOrTitle)
})

Cypress.Commands.add("expectExactLinkTargets", (targets) => {
  cy.get(".search-result .card-title a")
    .then((elms) => Cypress._.map(elms, "innerText"))
    .should("deep.equal", targets)
})

Cypress.Commands.add("findNoteCardButton", (noteTitle, btnTextOrTitle) => {
  return cy
    .findByText(noteTitle)
    .parent()
    .parent()
    .parent()
    .parent()
    .findByRole("button", { name: btnTextOrTitle })
})

Cypress.Commands.add("findNoteCardEditButton", (noteTitle) => {
  return cy.findNoteCardButton(noteTitle, "edit note")
})

Cypress.Commands.add(
  "initialReviewOneNoteIfThereIs",
  ({ review_type, title, additional_info, skip }) => {
    if (review_type == "initial done") {
      cy.findByText("You have achieved your daily new notes goal.").should("be.visible")
    } else {
      cy.findByText(title)
      switch (review_type) {
        case "single note": {
          if (additional_info) {
            cy.get(".note-body").should("contain", additional_info)
          }
          break
        }

        case "picture note": {
          if (additional_info) {
            const [expectedDescription, expectedPicture] = additional_info.commonSenseSplit("; ")
            cy.get(".note-body").should("contain", expectedDescription)
            cy.get("#note-picture")
              .find("img")
              .should("have.attr", "src")
              .should("include", expectedPicture)
          }
          break
        }

        case "link": {
          if (additional_info) {
            const [linkType, targetNote] = additional_info.commonSenseSplit("; ")
            cy.findByText(title)
            cy.findByText(targetNote)
            cy.get(".badge").contains(linkType)
          }
          break
        }

        default:
          expect(review_type).equal("a known review page type")
      }
      if (skip) {
        cy.findByText("Skip repetition").click()
        cy.findByRole("button", { name: "OK" }).click()
      } else {
        cy.findByText("Keep for repetition").click()
      }
    }
  },
)

Cypress.Commands.add("expectNoteTitle", (title) =>
  cy.findByText(title, { selector: "[role=title] *" }),
)

Cypress.Commands.add("repeatReviewOneNoteIfThereIs", ({ review_type, title, additional_info }) => {
  if (review_type == "repeat done") {
    cy.findByText("You have finished all repetitions for this half a day!").should("be.visible")
  } else {
    cy.findByText(title, { selector: "h2" })
    switch (review_type) {
      case "single note": {
        if (additional_info) {
          cy.get(".note-body").should("contain", additional_info)
        }
        break
      }

      default:
        expect(review_type).equal("a known review page type")
    }
    cy.get("#repeat-satisfied").click()
  }
})

Cypress.Commands.add("navigateToCircle", (circleName) => {
  cy.visit("/circles")
  cy.findByText(circleName).click()
})

Cypress.Commands.add("routerToInitialReview", () => {
  cy.routerPush("/reviews/initial", "initial", {})
})

Cypress.Commands.add("routerToReviews", () => {
  cy.routerPush("/", "root", {})
  cy.routerPush("/reviews", "reviews", {})
})

Cypress.Commands.add("routerToRepeatReview", () => {
  cy.routerPush("/reviews/repeat", "repeat", {})
})

Cypress.Commands.add("initialReviewInSequence", (reviews) => {
  cy.routerToInitialReview()
  reviews.forEach((initialReview) => {
    cy.initialReviewOneNoteIfThereIs(initialReview)
  })
})

Cypress.Commands.add("initialReviewNotes", (noteTitles) => {
  cy.initialReviewInSequence(
    noteTitles.commonSenseSplit(", ").map((title) => {
      return {
        review_type: title === "end" ? "initial done" : "single note",
        title,
      }
    }),
  )
})

Cypress.Commands.add("repeatReviewNotes", (noteTitles) => {
  cy.routerToRepeatReview()
  noteTitles.commonSenseSplit(",").forEach((title) => {
    const review_type = title === "end" ? "repeat done" : "single note"
    cy.repeatReviewOneNoteIfThereIs({ review_type, title })
  })
})

Cypress.Commands.add("shouldSeeQuizWithOptions", (questionParts, options) => {
  questionParts.forEach((part) => {
    cy.get(".quiz-instruction").contains(part)
  })
  options.commonSenseSplit(",").forEach((option) => cy.findByText(option).should("be.visible"))
})

Cypress.Commands.add("getFormControl", (label) => {
  return cy.findByLabelText(label)
})

Cypress.Commands.add("subscribeToNotebook", (notebookTitle: string, dailyLearningCount: string) => {
  cy.findNoteCardButton(notebookTitle, "Add to my learning").click()
  cy.get("#subscription-dailyTargetOfNewNotes").clear().type(dailyLearningCount)
  cy.findByRole("button", { name: "Submit" }).click()
})

Cypress.Commands.add("unsubscribeFromNotebook", (noteTitle) => {
  cy.visitMyNotebooks()
  cy.findNoteCardButton(noteTitle, "Unsubscribe").click()
})

Cypress.Commands.add("searchNote", (searchKey, options) => {
  options?.forEach((option) => cy.getFormControl(option).check())
  cy.findByPlaceholderText("Search").clear().type(searchKey)
  cy.tick(500)
})

Cypress.Commands.add("assertBlogPostInWebsiteByTitle", (article) => {
  cy.get("#article-container").within(() => {
    cy.get(".article")
      .first()
      .within(() => {
        cy.get(".title").first().should("have.text", article.title)
        cy.get(".content").first().should("have.text", article.description)
        cy.get(".authorName").first().should("have.text", article.authorName)
        cy.get(".createdAt").first().should("have.text", article.createdAt)
      })
  })
})

Cypress.Commands.add("failure", () => {
  throw new Error("Deliberate CYPRESS test Failure!!!")
})

Cypress.Commands.add("expectCurrentNoteDescription", (expectedDescription) => {
  cy.findByText(expectedDescription, { selector: ".note-description *" })
})

Cypress.Commands.add("withinMindmap", () => {
  cy.pageIsNotLoading()
  cy.wrap(
    new Promise((resolve) => {
      cy.get(`.box .content .inner-box .content`).then((mindmap) => {
        const rect = mindmap[0].getBoundingClientRect()
        cy.get("[role='card']").then(($elms) => {
          const cards = Object.fromEntries(
            Cypress.$.makeArray($elms).map((el) => [el.innerText, el.getBoundingClientRect()]),
          )
          cards.mindmapRect = rect
          resolve(cards)
        })
      })
    }),
  )
})

Cypress.Commands.add("distanceBetweenCardsGreaterThan", (cards, note1, note2, min) => {
  const rect1 = cards[note1]
  const rect2 = cards[note2]
  const xd = (rect1.right + rect1.left) / 2 - (rect2.right + rect2.left) / 2
  const yd = (rect1.top + rect1.bottom) / 2 - (rect2.top + rect2.bottom) / 2
  expect(Math.sqrt(xd * xd + yd * yd)).greaterThan(min)
})

Cypress.Commands.add("clickNoteToolbarButton", (btnTextOrTitle) => {
  cy.get(".toolbar").findByRole("button", { name: btnTextOrTitle }).click()
})

Cypress.Commands.add("deleteNoteViaAPI", { prevSubject: true }, (subject) => {
  cy.request({
    method: "POST",
    url: `/api/notes/${subject}/delete`,
  }).then((response) => {
    expect(response.status).to.equal(200)
  })
})

Cypress.Commands.add("noteByTitle", (noteTitle: string) => {
  return cy
    .findByText(noteTitle, { selector: "a.card-title" })
    .invoke("attr", "href")
    .then(($attr) => /notes\/(\d+)/g.exec($attr)[1])
})

Cypress.Commands.add("clickAssociateWikiDataButton", (title, wikiID) => {
  cy.clickNotePageButton(title, "associate wikidata")
  cy.replaceFocusedText(wikiID)
})

Cypress.Commands.add(
  "stubWikidataEntityQuery",
  { prevSubject: true },
  (
    wikidataServiceTester: WikidataServiceTester,
    wikidataId: string,
    wikidataTitle: string,
    wikipediaLink: string,
  ) => {
    wikidataServiceTester.stubWikidataEntityQuery(wikidataId, wikidataTitle, wikipediaLink)
  },
)

Cypress.Commands.add(
  "stubWikidataSearchResult",
  { prevSubject: true },
  (wikidataServiceTester: WikidataServiceTester, wikidataLabel: string, wikidataId: string) => {
    wikidataServiceTester.stubWikidataSearchResult(wikidataLabel, wikidataId)
  },
)

Cypress.Commands.add("expectFieldErrorMessage", (message: string) => {
  cy.findByText(message, { selector: ".error-msg" })
})
