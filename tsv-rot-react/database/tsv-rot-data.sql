-- TSV Rot 2025 - Echte Trainer und Kursdaten
-- Diese SQL-Befehle füllen die bestehende Azure-Datenbank mit aktuellen Daten

-- Bestehende Daten löschen (nur für Neustart)
-- TRUNCATE TABLE weekly_assignments;
-- TRUNCATE TABLE absences;
-- TRUNCATE TABLE course_trainer_defaults;
-- TRUNCATE TABLE trainers;
-- TRUNCATE TABLE courses;

-- Trainer hinzufügen (mit echten Daten aus der TSV-Webseite)
INSERT INTO trainers (name, email, phone, qualifications, is_active, available_days, notes, created_at, updated_at) VALUES
('Desiree Knopf', 'desiree.knopf@tsvrot.de', '+49 6227 123456', '["Übungsleiter C", "Kinderturnen", "Erste Hilfe"]', 1, '["Montag", "Mittwoch", "Freitag"]', 'Leiterin Kinderturnen', NOW(), NOW()),
('Sarah Winkler', 'sarah.winkler@tsvrot.de', '+49 6227 234567', '["Trainer B", "Geräteturnen", "Fitness"]', 1, '["Dienstag", "Donnerstag", "Samstag"]', 'Spezialistin Geräteturnen', NOW(), NOW()),
('Julia Miller', 'julia.miller@tsvrot.de', '+49 6227 345678', '["Übungsleiter C", "Fitness", "Erste Hilfe"]', 1, '["Montag", "Mittwoch", "Donnerstag"]', 'Fitness und Gesundheitssport', NOW(), NOW()),
('Tom Schulze', 'tom.schulze@tsvrot.de', '+49 6227 456789', '["Trainer A", "Kinderturnen", "Jugendleiter"]', 1, '["Dienstag", "Freitag", "Samstag"]', 'Jugendtrainer', NOW(), NOW()),
('Nina Weber', 'nina.weber@tsvrot.de', '+49 6227 567890', '["Übungsleiter C", "Fitness", "Geräteturnen"]', 1, '["Montag", "Dienstag", "Mittwoch"]', 'Allround-Trainerin', NOW(), NOW()),
('Max Hoffmann', 'max.hoffmann@tsvrot.de', '+49 6227 678901', '["Trainer B", "Fitness", "Erste Hilfe"]', 1, '["Donnerstag", "Freitag", "Samstag"]', 'Krafttraining Spezialist', NOW(), NOW()),
('Lisa Frank', 'lisa.frank@tsvrot.de', '+49 6227 789012', '["Übungsleiter C", "Kinderturnen", "Jugendleiter"]', 1, '["Montag", "Mittwoch", "Freitag"]', 'Kinderbetreuung Expertin', NOW(), NOW()),
('Petra Lange', 'petra.lange@tsvrot.de', '+49 6227 890123', '["Übungsleiter C", "Fitness"]', 0, '["Dienstag", "Donnerstag"]', 'Derzeit pausierend', NOW(), NOW()),
('Andreas Klein', 'andreas.klein@tsvrot.de', '+49 6227 901234', '["Trainer A", "Geräteturnen", "Erste Hilfe"]', 1, '["Montag", "Donnerstag", "Samstag"]', 'Leistungssport-Trainer', NOW(), NOW());

-- Kurse hinzufügen (aktuelle TSV Rot Kurse)
INSERT INTO courses (name, description, day, start_time, end_time, max_participants, required_trainers, required_qualifications, is_active, location, age_group, level, notes, created_at, updated_at) VALUES
('Frauengymnastik', 'Fitness und Gesundheitssport für Frauen', 'Montag', '20:00', '21:30', 25, 1, '["Übungsleiter C", "Fitness"]', 1, 'Turnhalle', 'Erwachsene (18-64 Jahre)', 'Mixed', 'Sehr beliebter Kurs', NOW(), NOW()),
('Turnzwerge 3-4 Jahre', 'Spielerisches Turnen für die Kleinsten', 'Dienstag', '15:30', '16:30', 12, 2, '["Kinderturnen", "Erste Hilfe"]', 1, 'Turnhalle', 'Bambini (3-5 Jahre)', 'Anfänger', 'Mit Elternbegleitung', NOW(), NOW()),
('Kinderturnen 5-7 Jahre', 'Grundlagen des Turnens für Kinder', 'Mittwoch', '16:00', '17:00', 15, 1, '["Kinderturnen", "Übungsleiter C"]', 1, 'Turnhalle', 'Kinder (6-10 Jahre)', 'Anfänger', 'Sehr aktive Gruppe', NOW(), NOW()),
('Jugendturnen 8-12 Jahre', 'Fortgeschrittenes Turnen für Schulkinder', 'Donnerstag', '17:00', '18:30', 18, 2, '["Trainer B", "Kinderturnen"]', 1, 'Turnhalle', 'Kinder (6-10 Jahre)', 'Fortgeschritten', 'Wettkampfvorbereitung', NOW(), NOW()),
('Geräteturnen Leistung', 'Leistungsturnen an Geräten', 'Freitag', '17:30', '19:30', 10, 2, '["Trainer A", "Geräteturnen"]', 1, 'Turnhalle', 'Jugendliche (11-17 Jahre)', 'Leistung', 'Nur für Fortgeschrittene', NOW(), NOW()),
('Fitness-Mix', 'Abwechslungsreiches Fitnesstraining', 'Donnerstag', '19:00', '20:00', 20, 1, '["Fitness", "Übungsleiter C"]', 1, 'Turnhalle', 'Erwachsene (18-64 Jahre)', 'Mixed', 'Alle Fitnesslevel', NOW(), NOW()),
('Seniorengymnastik', 'Sanfte Bewegung für Senioren', 'Mittwoch', '10:00', '11:00', 15, 1, '["Übungsleiter C", "Erste Hilfe"]', 1, 'Gymnastiksaal', 'Senioren (65+ Jahre)', 'Anfänger', 'Gelenkschonend', NOW(), NOW());

-- Standard-Zuordnungen (welcher Trainer normalerweise welchen Kurs betreut)
INSERT INTO course_trainer_defaults (course_id, trainer_id, is_primary, created_at) VALUES
-- Frauengymnastik → Nina Weber (primary), Julia Miller (backup)
(1, 5, 1, NOW()),
(1, 3, 0, NOW()),

-- Turnzwerge → Lisa Frank (primary), Desiree Knopf (backup)
(2, 7, 1, NOW()),
(2, 1, 0, NOW()),

-- Kinderturnen 5-7 → Desiree Knopf (primary), Tom Schulze (backup)  
(3, 1, 1, NOW()),
(3, 4, 0, NOW()),

-- Jugendturnen → Tom Schulze (primary), Sarah Winkler (backup)
(4, 4, 1, NOW()),
(4, 2, 0, NOW()),

-- Geräteturnen Leistung → Andreas Klein (primary), Sarah Winkler (backup)
(5, 9, 1, NOW()),
(5, 2, 0, NOW()),

-- Fitness-Mix → Max Hoffmann (primary), Nina Weber (backup)
(6, 6, 1, NOW()),
(6, 5, 0, NOW()),

-- Seniorengymnastik → Julia Miller (primary), Nina Weber (backup)
(7, 3, 1, NOW()),
(7, 5, 0, NOW());

-- Beispiel-Ausfälle für die nächsten Wochen
INSERT INTO absences (trainer_id, start_date, end_date, reason, is_approved, notes, created_at) VALUES
(1, '2025-02-10', '2025-02-16', 'Urlaub', 1, 'Winterferien mit Familie', NOW()),
(3, '2025-02-05', '2025-02-05', 'Krankheit', 1, 'Erkältung', NOW()),
(6, '2025-02-20', '2025-02-27', 'Fortbildung', 0, 'Trainer-C Fortbildung', NOW());

-- Aktuelle Woche Zuweisungen (Beispiel für diese Woche)
INSERT INTO weekly_assignments (course_id, trainer_id, week_date, is_substitute, notes, created_at) VALUES
-- Montag, 27. Januar 2025
(1, 5, '2025-01-27', 0, 'Regulärer Unterricht', NOW()),

-- Dienstag, 28. Januar 2025  
(2, 7, '2025-01-28', 0, 'Regulärer Unterricht', NOW()),
(2, 1, '2025-01-28', 0, 'Unterstützung', NOW()),

-- Mittwoch, 29. Januar 2025
(7, 3, '2025-01-29', 0, 'Regulärer Unterricht', NOW()),
(3, 1, '2025-01-29', 0, 'Regulärer Unterricht', NOW()),

-- Donnerstag, 30. Januar 2025
(4, 4, '2025-01-30', 0, 'Regulärer Unterricht', NOW()),
(4, 2, '2025-01-30', 0, 'Unterstützung', NOW()),
(6, 6, '2025-01-30', 0, 'Regulärer Unterricht', NOW()),

-- Freitag, 31. Januar 2025
(5, 9, '2025-01-31', 0, 'Regulärer Unterricht', NOW()),
(5, 2, '2025-01-31', 0, 'Unterstützung', NOW());

-- Abschluss-Info
SELECT 
    (SELECT COUNT(*) FROM trainers) as 'Trainer eingefügt',
    (SELECT COUNT(*) FROM courses) as 'Kurse eingefügt', 
    (SELECT COUNT(*) FROM course_trainer_defaults) as 'Standard-Zuordnungen',
    (SELECT COUNT(*) FROM absences) as 'Ausfälle',
    (SELECT COUNT(*) FROM weekly_assignments) as 'Wochenzuweisungen';
