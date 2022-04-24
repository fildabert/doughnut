package com.odde.doughnut.models.quizFacotries;

import com.odde.doughnut.entities.Link;
import com.odde.doughnut.entities.Note;
import com.odde.doughnut.entities.User;
import com.odde.doughnut.factoryServices.ModelFactoryService;
import com.odde.doughnut.models.Randomizer;
import java.util.List;
import java.util.Optional;
import java.util.function.Predicate;
import java.util.stream.Collectors;

public class QuizQuestionServant {
  final Randomizer randomizer;
  final ModelFactoryService modelFactoryService;
  final int maxFillingOptionCount = 2;

  public QuizQuestionServant(Randomizer randomizer, ModelFactoryService modelFactoryService) {
    this.randomizer = randomizer;
    this.modelFactoryService = modelFactoryService;
  }

  List<Note> chooseFromCohort(Note answerNote, Predicate<Note> notePredicate) {
    List<Note> list = getCohort(answerNote, notePredicate);
    return randomizer.randomlyChoose(maxFillingOptionCount, list);
  }

  public List<Note> getCohort(Note note, Predicate<Note> notePredicate) {
    List<Note> list =
        note.getSiblings().stream().filter(notePredicate).collect(Collectors.toList());
    if (list.size() > 1) return list;

    return note.getGrandAsPossible().getDescendantsInBreathFirstOrder().stream()
        .filter(notePredicate)
        .collect(Collectors.toList());
  }

  Optional<Link> chooseOneCategoryLink(User user, Link link) {
    return randomizer.chooseOneRandomly(link.categoryLinksOfTarget(user));
  }

  <T> List<T> chooseFillingOptionsRandomly(List<T> candidates) {
    return randomizer.randomlyChoose(maxFillingOptionCount, candidates);
  }
}
