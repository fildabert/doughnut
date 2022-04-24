package com.odde.doughnut.models.quizFacotries;

import com.odde.doughnut.entities.Note;
import com.odde.doughnut.models.Randomizer;
import java.util.List;
import java.util.stream.Collectors;

public interface QuestionOptionsFactory {
  Note generateAnswer();

  List<Note> generateFillingOptions();

  default List<Note> generateOptions1() {
    Note answerNote = generateAnswer();
    if (answerNote == null) return null;
    List<Note> fillingOptions = generateFillingOptions();
    if (fillingOptions.isEmpty()) {
      return null;
    }
    fillingOptions.add(answerNote);
    return fillingOptions;
  }

  default String generateOptions(Randomizer randomizer) {
    List<Note> options = generateOptions1();
    if (options == null) return null;
    return randomizer.shuffle(options).stream()
        .map(Note::getId)
        .map(Object::toString)
        .collect(Collectors.joining(","));
  }
}
