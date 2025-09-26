-- Initiale Daten für TSV Rot
USE `tsvrot2025-database`;

-- Trainer einfügen
INSERT INTO trainers (name, email) VALUES
('Desiree Knopf', 'desiree@tsvrot.de'),
('Sarah Winkler', 'sarah@tsvrot.de'),
('Julia Miller', 'julia@tsvrot.de'),
('Sabrina Grund', 'sabrina@tsvrot.de'),
('Irmgard Stegmüller', 'irmgard@tsvrot.de'),
('Ulrike Keßler', 'ulrike@tsvrot.de'),
('Josef Kahlenberg', 'josef@tsvrot.de'),
('Jasmin Ittensohn', 'jasmin@tsvrot.de'),
('Marvin Vögeli', 'marvin@tsvrot.de')
ON DUPLICATE KEY UPDATE email=VALUES(email);

-- Kurse einfügen
INSERT INTO courses (name, weekday, time, location, required_trainers) VALUES
('Frauengymnastik', 'Montag', '20:00:00', 'Mehrzweckhalle Rot', 1),
('Aerobic / Dance & mehr', 'Montag', '21:00:00', 'Mehrzweckhalle Rot', 1),
('Turnzwerge Gruppe 1', 'Dienstag', '15:00:00', 'Sporthalle Rot', 2),
('Turnzwerge Gruppe 2', 'Dienstag', '16:00:00', 'Sporthalle Rot', 2),
('Seniorengymnastik', 'Dienstag', '15:00:00', 'Mehrzweckhalle Rot', 1),
('Kinderturnen ab 5 Jahre', 'Freitag', '15:30:00', 'Sporthalle Rot', 2),
('Kinderturnen ab 8 Jahre', 'Freitag', '16:30:00', 'Sporthalle Rot', 2)
ON DUPLICATE KEY UPDATE location=VALUES(location);

-- Admin-User erstellen (Passwort: TSVAdmin2024)
INSERT INTO users (username, password_hash, role) VALUES
('admin', SHA2('TSVAdmin2024', 256), 'admin'),
('trainer', SHA2('TSVRot2024', 256), 'trainer')
ON DUPLICATE KEY UPDATE role=VALUES(role);
