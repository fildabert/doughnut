package com.odde.doughnut.models;

import java.sql.Timestamp;

import com.odde.doughnut.entities.Note;
import com.odde.doughnut.factoryServices.ModelFactoryService;

public class NoteModel {
    protected final Note entity;
    protected final ModelFactoryService modelFactoryService;

    public NoteModel(Note note, ModelFactoryService modelFactoryService) {
        this.entity = note;
        this.modelFactoryService = modelFactoryService;
    }

    private void updateDeletedAt(Timestamp time) {
        if (entity.getNotebook() != null) {
            if (entity.getNotebook().getHeadNote() == entity) {        
                entity.getNotebook().setDeletedAt(time);
                modelFactoryService.notebookRepository.save(entity.getNotebook());
            }
        }
        entity.setDeletedAt(time);
        modelFactoryService.noteRepository.save(entity);
    }
    
    public void destroy() {
        Timestamp now = new Timestamp(System.currentTimeMillis());

        entity.traverseBreadthFirst(child -> modelFactoryService.toNoteModel(child).destroy());
        updateDeletedAt(now);
    }
    
    public void restore() {
        entity.traverseBreadthFirst(child -> modelFactoryService.toNoteModel(child).restore());
        updateDeletedAt(null);
    }
}
