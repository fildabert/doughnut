CREATE TABLE note_version (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    note_id INT UNSIGNED NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT `fk_notes_version_note_id`
        FOREIGN KEY (note_id) REFERENCES note (id)
        ON DELETE CASCADE
        ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 AUTO_INCREMENT=1;