INSERT INTO trainers (name, email) VALUES
('Desiree Knopf', 'desiree@tsvrot.de'),
('Sarah Winkler', 'sarah@tsvrot.de'),
('Julia Miller', 'julia@tsvrot.de'),
('Sabrina Grund', 'sabrina@tsvrot.de'),
('Irmgard Stegmüller', 'irmgard@tsvrot.de'),
('Ulrike Keßler', 'ulrike@tsvrot.de'),
('Josef Kahlenberg', 'josef@tsvrot.de'),
('Jasmin Ittensohn', 'jasmin@tsvrot.de'),
('Marvin Vögeli', 'marvin@tsvrot.de');

INSERT INTO courses (name, weekday, time, location, required_trainers) VALUES
('Frauengymnastik', 'Montag', '20:00:00', 'Mehrzweckhalle Rot', 1),
('Aerobic / Dance & mehr', 'Montag', '21:00:00', 'Mehrzweckhalle Rot', 1),
('Turnzwerge Gruppe 1', 'Dienstag', '15:00:00', 'Sporthalle Rot', 2),
('Turnzwerge Gruppe 2', 'Dienstag', '16:00:00', 'Sporthalle Rot', 2),
('Seniorengymnastik', 'Dienstag', '15:00:00', 'Mehrzweckhalle Rot', 1),
('Kinderturnen ab 5 Jahre', 'Freitag', '15:30:00', 'Sporthalle Rot', 2),
('Kinderturnen ab 8 Jahre', 'Freitag', '16:30:00', 'Sporthalle Rot', 2);

INSERT INTO course_trainer_defaults (course_id, trainer_id)
SELECT c.id, t.id FROM courses c, trainers t 
WHERE (c.name = 'Frauengymnastik' AND t.name = 'Irmgard Stegmüller')
   OR (c.name = 'Aerobic / Dance & mehr' AND t.name = 'Ulrike Keßler')
   OR (c.name = 'Turnzwerge Gruppe 1' AND t.name IN ('Desiree Knopf', 'Sarah Winkler'))
   OR (c.name = 'Turnzwerge Gruppe 2' AND t.name IN ('Julia Miller', 'Sabrina Grund'))
   OR (c.name = 'Seniorengymnastik' AND t.name = 'Irmgard Stegmüller')
   OR (c.name = 'Kinderturnen ab 5 Jahre' AND t.name IN ('Josef Kahlenberg', 'Jasmin Ittensohn'))
   OR (c.name = 'Kinderturnen ab 8 Jahre' AND t.name IN ('Jasmin Ittensohn', 'Marvin Vögeli'));
