package com.odde.doughnut.models;

import com.odde.doughnut.entities.Answer;
import com.odde.doughnut.entities.AnswerResult;
import com.odde.doughnut.entities.AnswerViewedByUser;
import com.odde.doughnut.entities.Note;
import com.odde.doughnut.entities.SelfEvaluate;
import com.odde.doughnut.factoryServices.ModelFactoryService;
import java.sql.Timestamp;

public class AnswerModel {
  private final Answer answer;
  private final ModelFactoryService modelFactoryService;

  private Boolean cachedResult;

  public AnswerModel(Answer answer, ModelFactoryService modelFactoryService) {
    this.answer = answer;
    this.modelFactoryService = modelFactoryService;
  }

  public void updateReviewPoints(Timestamp currentUTCTimestamp) {
    SelfEvaluate selfEvaluate = isCorrect() ? SelfEvaluate.satisfying : SelfEvaluate.sad;
    answer
        .getQuestion()
        .getViceReviewPointIdList()
        .forEach(
            rPid ->
                this.modelFactoryService
                    .reviewPointRepository
                    .findById(rPid)
                    .ifPresent(
                        vice ->
                            this.modelFactoryService
                                .toReviewPointModel(vice)
                                .updateReviewPoint(currentUTCTimestamp, selfEvaluate)));
    ReviewPointModel reviewPointModel =
        this.modelFactoryService.toReviewPointModel(answer.getQuestion().getReviewPoint());
    reviewPointModel.updateReviewPoint(currentUTCTimestamp, selfEvaluate);
  }

  public AnswerViewedByUser getAnswerViewedByUser() {
    AnswerViewedByUser answerResult = new AnswerViewedByUser();
    answerResult.answerId = answer.getId();
    answerResult.correct = isCorrect();
    answerResult.answerDisplay = getAnswerDisplay();
    return answerResult;
  }

  public AnswerResult getAnswerResult() {
    AnswerResult answerResult = new AnswerResult();
    answerResult.answerId = answer.getId();
    answerResult.correct = isCorrect();
    return answerResult;
  }

  public void save() {
    modelFactoryService.answerRepository.save(answer);
  }

  private String getAnswerDisplay() {
    if (getAnswerNote() != null) {
      return getAnswerNote().getTitle();
    }
    return answer.getSpellingAnswer();
  }

  private boolean isCorrect() {
    if (cachedResult != null) return cachedResult;
    cachedResult = answer.getQuestion().isAnswerCorrect(this::matchAnswer);
    return cachedResult;
  }

  private Note getAnswerNote() {
    if (answer.getAnswerNoteId() == null) return null;
    return this.modelFactoryService.noteRepository.findById(answer.getAnswerNoteId()).orElse(null);
  }

  private boolean matchAnswer(Note correctAnswerNote) {
    if (getAnswerNote() != null) {
      return correctAnswerNote.equals(getAnswerNote());
    }

    return correctAnswerNote.getNoteTitle().matches(answer.getSpellingAnswer());
  }
}
