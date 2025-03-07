/// <reference types="cypress" />
/// <reference types="../support" />
// @ts-check

import { Given, Then } from "@badeball/cypress-cucumber-preprocessor"

Then("I do these initial reviews in sequence:", (data) => {
  cy.initialReviewInSequence(data.hashes())
})

Given("It's day {int}, {int} hour", (day, hour) => {
  cy.testability().timeTravelTo(day, hour)
})

Then(
  "On day {int} I repeat old {string} and initial review new {string}",
  (day, repeatNotes, initialNotes) => {
    cy.testability().timeTravelTo(day, 8)

    cy.repeatReviewNotes(repeatNotes)
    cy.initialReviewNotes(initialNotes)
  },
)

Given("I go to the reviews page", () => {
  cy.routerToReviews()
})

Then("I should see that I have old notes to repeat", () => {
  cy.findByRole("button", { name: "Start reviewing old notes" })
})

Then("I should see that I have new notes to learn", () => {
  cy.findByRole("button", { name: "Start reviewing new notes" })
})

Then(
  "On day {int} I should have {string} note for initial review and {string} for repeat",
  (day, numberOfInitialReviews, numberOfRepeats) => {
    cy.testability().timeTravelTo(day, 8)
    cy.routerToReviews()
    cy.findByText(numberOfInitialReviews, {
      selector: ".number-of-initial-reviews",
    })
    cy.findByText(numberOfRepeats, { selector: ".number-of-repeats" })
  },
)

Then("choose to remove it from reviews", () => {
  cy.findByRole("button", { name: "remove this note from review" }).click()
  cy.findByRole("button", { name: "OK" }).click()
})

Then("it should move to review page", () => {
  cy.url().should("eq", Cypress.config().baseUrl + "/reviews")
})

Then("I initial review {string}", (noteTitle) => {
  cy.initialReviewNotes(noteTitle)
})

Then("I added and learned one note {string} on day {int}", (noteTitle, day) => {
  cy.testability().seedNotes([{ title: noteTitle }])
  cy.testability().timeTravelTo(day, 8)
  cy.initialReviewNotes(noteTitle)
})

Then("I learned one note {string} on day {int}", (noteTitle, day) => {
  cy.testability().timeTravelTo(day, 8)
  cy.initialReviewNotes(noteTitle)
})

Then("I am repeat-reviewing my old note on day {int}", (day) => {
  cy.testability().timeTravelTo(day, 8)
  cy.routerToRepeatReview()
})

Then("I should see the happy option", () => {
  cy.get("#repeat-happy").should("exist")
})

Then("I am learning new note on day {int}", (day) => {
  cy.testability().timeTravelTo(day, 8)
  cy.routerToInitialReview()
})

Then(
  "I have selected the option {string} in review setting and set the level to be {int}",
  (option, level) => {
    cy.getFormControl(option).check()
    cy.getFormControl("Level").clear().type(level)
    cy.findByRole("button", { name: "Update" }).click()
  },
)

Then("I have selected the option {string}", (option) => {
  cy.getFormControl(option).check()
  cy.findByRole("button", { name: "Keep for repetition" }).click()
})

Then("I have unselected the option {string}", (option) => {
  cy.getFormControl(option).uncheck()
  cy.findByRole("button", { name: "Keep for repetition" }).click()
})

Then("I should see the option {string} is {string}", (option, status) => {
  cy.getFormControl(option).then(($elem) => {
    if (status === "on") {
      cy.wrap($elem).should("be.checked")
    } else {
      cy.wrap($elem).should("not.be.checked")
    }
  })
})

Then("choose to remove it fromm reviews", () => {
  cy.get("#more-action-for-repeat").click()
  cy.findByRole("button", { name: "Remove This Note from Review" }).click()
})

Then("I choose the happy option", () => {
  cy.get("#repeat-happy").click()
})

Then(
  "I should be asked cloze deletion question {string} with options {string}",
  (question, options) => {
    cy.shouldSeeQuizWithOptions([question], options)
  },
)

Then(
  "I should be asked picture question {string} with options {string}",
  (pictureInQuestion, options) => {
    cy.shouldSeeQuizWithOptions([], options)
  },
)

Then("I should be asked picture selection question {string} with {string}", (question) => {
  cy.shouldSeeQuizWithOptions([question], "")
})

Then("I should be asked spelling question {string}", (question) => {
  cy.findByText(question).should("be.visible")
})

Then(
  "I should be asked link question {string} {string} with options {string}",
  (noteTitle, linkType, options) => {
    cy.shouldSeeQuizWithOptions([noteTitle, linkType], options)
  },
)

Then("I type my answer {string}", (answer) => {
  cy.getFormControl("Answer").type(answer)
  cy.findByRole("button", { name: "OK" }).click()
})

Then("I choose answer {string}", (noteTitle) => {
  cy.findByRole("button", { name: noteTitle }).click()
})

Then("I should see that my answer is correct", () => {
  // checking the css name isn't the best solution
  // but the text changes
  cy.get(".alert-success").should("exist")
})

Then("I should see the information of note {string}", (noteTitle) => {
  cy.findByText(noteTitle)
})

Then("I should see that my answer {string} is wrong", (answer) => {
  cy.findByText(`Your answer \`${answer}\` is wrong.`)
})

Then("I should see the repetition is finished: {string}", (yesNo) => {
  cy.findByText("You have finished all repetitions for this half a day!").should(
    yesNo === "yes" ? "exist" : "not.exist",
  )
})

Then("I am changing note {string}'s review setting", (noteTitle) => {
  cy.visit("/")
  cy.clickNotePageMoreOptionsButton(noteTitle, "Edit review settings")
})

Then("The randomizer always choose the last", () => {
  cy.testability().randomizerAlwaysChooseLast()
})

Then("I should see the statistics of note {string}", (noteTitle, data) => {
  cy.findByText(noteTitle)
  cy.findByRole("button", { name: "Statistics" }).click({ force: true })
  const attrs = data.hashes()[0]
  for (const k in attrs) {
    cy.findByText(attrs[k]).should("be.visible")
  }
})

Then("I view the last result", () => {
  cy.findByRole("button", { name: "view last result" }).click()
})

Then("I should see the review point is removed from review", () => {
  cy.findByText("This review point has been removed from reviewing.")
})
