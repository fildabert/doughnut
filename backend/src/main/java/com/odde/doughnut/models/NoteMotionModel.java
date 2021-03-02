package com.odde.doughnut.models;

import com.odde.doughnut.entities.NoteEntity;
import com.odde.doughnut.entities.NoteMotionEntity;
import com.odde.doughnut.exceptions.CyclicLinkDetectedException;
import com.odde.doughnut.services.ModelFactoryService;

public class NoteMotionModel {
    private final NoteMotionEntity noteMotionEntity;
    private final NoteEntity subject;
    private final ModelFactoryService modelFactoryService;

    public NoteMotionModel(NoteMotionEntity noteMotionEntity, NoteEntity subject, ModelFactoryService modelFactoryService) {
        this.noteMotionEntity = noteMotionEntity;
        this.subject = subject;
        this.modelFactoryService = modelFactoryService;
    }

    public void execute() throws CyclicLinkDetectedException {
        TreeNodeModel treeNodeModel = modelFactoryService.toTreeNodeModel(noteMotionEntity.getRelativeToNote());

        if(treeNodeModel.getAncestors().contains(subject)) {
            throw new CyclicLinkDetectedException();
        }
        subject.setParentNote(noteMotionEntity.getNewParent());
        Long newSiblingOrder = treeNodeModel.theSiblingOrderItTakesToMoveRelativeToMe(noteMotionEntity.isAsFirstChildOfNote());
        if (newSiblingOrder != null) {
            subject.setSiblingOrder(newSiblingOrder);
        }
        modelFactoryService.noteRepository.save(subject);
    }

}
