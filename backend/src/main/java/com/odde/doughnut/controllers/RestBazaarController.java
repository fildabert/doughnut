
package com.odde.doughnut.controllers;

import com.odde.doughnut.factoryServices.ModelFactoryService;
import com.odde.doughnut.models.BazaarModel;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/bazaar")
class RestBazaarController {
  private final ModelFactoryService modelFactoryService;

  public RestBazaarController(ModelFactoryService modelFactoryService) {
    this.modelFactoryService = modelFactoryService;
  }

  @GetMapping("")
  public RestNotebookController.NotebooksViewedByUser bazaar() {
    BazaarModel bazaar = modelFactoryService.toBazaarModel();
    RestNotebookController.NotebooksViewedByUser notebooksViewedByUser = new RestNotebookController.NotebooksViewedByUser();
    notebooksViewedByUser.notebooks = bazaar.getAllNotebooks();
    return notebooksViewedByUser;
  }

}