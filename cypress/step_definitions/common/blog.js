import {
  Given,
  And,
  Then,
  When,
  Before
} from "cypress-cucumber-preprocessor/steps";

Given("There is a blog titled {string} in Doughnut", (title) => {
  cy.visitMyNotebooks();
  cy.findByText("Add New Notebook").click();
  cy.get('select').select("BLOG");
  cy.submitNoteFormsWith([{Title:title}]);
});


Given("There is a Blog Notebook called odd-e blog", (data) => {
  cy.loginAs('developer');

  cy.visitMyNotebooks();
  cy.findByText("Add New Notebook").click();
  const dataHashes = data.hashes().map(data => {
      data["NotebookType"]= "BLOG"
      return data;
  })
  cy.submitNoteFormsWith(dataHashes);
});

Then("I should see the current year on the blog-site's side navbar", ()=>{
    cy.get('.yearList').children().contains(new Date().getFullYear()).should('have.length', 1);
});

And("A blog is posted in {string}", (blogNotebook, data) => {
    cy.findByText("(Add Article)").click();
    cy.submitNoteFormsWith(data.hashes());
});

Given("There is no Notebook type blog", () => {

});

When("I open the Blog page", () => {
  cy.visitBlog();
});

Then("the left panel should show empty", () => {
  cy.getYearList().should('be.empty');
});

Given("There is a Notebook type blog with title 'odd-e-blog'", () => {

});


Then("the left panel should show Years list", () => {
  cy.get('.yearList').should((lis) => {
  expect(lis).to.have.length(1)
  });
});

And("There are some posts in the blog", (data) => {
    cy.addArticle(data.hashes());
});

When("I add a new blog article in {string} with title {string}", (blogTitle,articleTitle) => {
    cy.visitMyNotebooks();
    cy.navigateToNotePage(blogTitle);
    cy.addArticle([{Title: articleTitle }]);
});

When("I add a new blog article in {string} on {string} with title {string}", (blogTitle, date, articleTitle) => {
    cy.visitMyNotebooks();
    cy.navigateToNotePage(blogTitle);
    cy.addArticle([{Title: articleTitle }]);
});

When("I add a new blog article with this information", (data) => {

    //blogTitle = data.hashes()[0]['Title'];
    //blogDesc = data.hashes()[0]['Description'];
    //cy.visitMyNotebooks();
    //cy.navigateToNotePage(data.hashes()[0]['Title']);
    cy.addArticle([{Title: data.hashes()[0]['Title'], Description: data.hashes()[0]['Description']}]);
});

Then("I should see a blog post on the Blog page created today", (data) => {
    cy.assertArticleInWebsiteByTitle(
        {
            title: data.hashes()[0]['Title'],
            description: data.hashes()[0]['Description'],
            authorName: data.hashes()[0]['AuthorName'],
            createdAt: new Date().toLocaleString('en-GB', {day:'numeric', month: 'short', year:'numeric'})
        }
    );
});



When("after creating a blog article {string}", (articleTitle, data) => {
  cy.findByText("(Add Article)").click();
  cy.submitNoteFormsWith(data.hashes());
});

Then("I should see {string} in breadcrumb", (expectedBreadcrumb) => {
  const d = new Date();
  const y = d.getFullYear();
  const m = d.toLocaleString("default", {month: 'short'});
  const bc = expectedBreadcrumb.replace("{YYYY}", y).replace("{MMM}", m);

  cy.get('.breadcrumb').within( ()=>
      bc.commonSenseSplit(", ").forEach(s => cy.findByText(s))
  );
});