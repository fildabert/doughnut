package com.odde.doughnut.models.quizFacotries;

import com.odde.doughnut.entities.Link;
import com.odde.doughnut.entities.Note;
import com.odde.doughnut.entities.ReviewPoint;
import com.odde.doughnut.entities.User;
import com.odde.doughnut.models.NoteViewer;
import com.odde.doughnut.models.UserModel;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public class CategoryHelper {
  private final User user;
  private final Link link;
  private final QuizQuestionServant servant;
  private final Link categoryLink;

  public CategoryHelper(QuizQuestionServant servant, User user, Link link) {
    this.user = user;
    this.link = link;
    this.servant = servant;
    if (servant != null) {
      categoryLink = servant.chooseOneCategoryLink(this.user, this.link).orElse(null);
    } else {
      categoryLink = null;
    }
  }

  protected Link getCategoryLink() {
    return categoryLink;
  }

  protected List<ReviewPoint> getCategoryReviewPoints(UserModel userModel) {
    if (categoryLink == null) return List.of();
    ReviewPoint reviewPointFor = userModel.getReviewPointFor(categoryLink);
    if (reviewPointFor == null) return List.of();
    return List.of(reviewPointFor);
  }

  protected List<Link> getReverseLinksOfCousins(User user) {
    List<Note> uncles = unclesFromSameCategory(user, categoryLink);
    return categoryLink.getCousinLinksOfSameLinkType(user).stream()
        .filter(cl -> !uncles.contains(cl.getSourceNote()))
        .flatMap(
            p ->
                new NoteViewer(user, p.getSourceNote())
                    .linksOfTypeThroughReverse(link.getLinkType()))
        .collect(Collectors.toList());
  }

  protected List<Note> unclesFromSameCategory(User user, Link categoryLink) {
    NoteViewer noteViewer = new NoteViewer(user, link.getSourceNote());
    List<Note> categoryCousins = categoryLink.getCousinsOfSameLinkType(user);
    return noteViewer
        .linkTargetOfType(link.getLinkType())
        .filter(categoryCousins::contains)
        .collect(Collectors.toList());
  }

  protected Stream<Link> getCousinLinksFromSameCategoriesOfSameLinkType() {
    UserModel userModel = servant.modelFactoryService.toUserModel(user);
    return new NoteViewer(user, categoryLink.getSourceNote())
        .linksOfTypeThroughReverse(link.getLinkType())
        .filter(lk -> lk != link)
        .filter(l -> userModel.getReviewPointFor(l) != null);
  }
}