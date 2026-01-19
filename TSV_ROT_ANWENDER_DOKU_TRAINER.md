# 🏃 TSV Rot Turnen - Trainer-App
## Anwender-Dokumentation für Trainer

**Version:** 2.11.1  
**Stand:** 18. Januar 2026  
**Für:** Alle Trainer der TSV Rot Turnabteilung

---

## 📱 Zugang zur App

### **URL:**
```
https://trainer.tsvrot.de
```

### **Login:**
- **Benutzername:** `Trainer` (für alle Trainer gleich)
- **Passwort:** `TSVRot2024`

💡 **Hinweis:** Alle Trainer nutzen die gleichen Login-Daten.

💡 **Tipp:** Speichere die Seite als Lesezeichen auf deinem Handy!

---

## 🎯 Was kann die App?

Die Trainer-App hilft dir bei:
- ✅ **Wochenplanung** ansehen und bearbeiten
- ✅ **Trainer verwalten** in Kursen (hinzufügen/entfernen)
- ✅ **Notizen erstellen** für Kurse (intern oder für Eltern)
- ✅ **Ausfälle melden** wenn Kurse nicht stattfinden
- ✅ **Stunden einsehen** automatisches Tracking deiner Trainingszeiten
- ✅ **Kursplan teilen** mit Eltern über WhatsApp oder QR-Code

---

## 📅 1. WOCHENPLANUNG (Hauptfunktion)

### **So kommst du zur Wochenplanung:**
1. Nach dem Login siehst du direkt die **aktuelle Woche**
2. Oben rechts steht die **Kalenderwoche (KW)** und das Jahr

### **Navigation:**
- **◀️ Vorherige Woche:** Pfeil links
- **▶️ Nächste Woche:** Pfeil rechts
- **🗓️ Heute:** Springt zurück zur aktuellen Woche

### **Was siehst du?**
Die Woche ist in **7 Spalten** (Mo-So) unterteilt. 

**Kurse** werden als **Box** angezeigt mit:
- **Kursname** (z.B. "Mini-Turnen")
- **Uhrzeit** (z.B. "15:00-16:00")
- **Halle** (z.B. "Halle A")
- **Trainer-Namen** 👤
- **Status-Anzeige** (✅ grün = findet statt, ❌ rot = fällt aus)
- **Notiz-Badges** (🔒 intern, 📢 für Eltern)

**Sonderaktivitäten** (🎉 Wettkämpfe, Events, etc.) werden ebenfalls in der Woche angezeigt.

---

## 👤 2. TRAINER VERWALTEN

### **So verwaltest du Trainer:**

**Schritt 1:** Klicke auf einen Kurs
- Der Kurs klappt auf und zeigt Details

**Schritt 2:** Im aufgeklappten Bereich siehst du:
- **Standard-Trainer**
  - Sind **initial** bei jeder neuen Woche für diesen Kurs gesetzt
  - Können aus einzelnen Sessions entfernt werden
  - **Wenn entfernt:** Nicht mehr in der Trainer-Liste
- **Zusätzliche Trainer**
  - Manuell für diese Session hinzugefügt
  - Beim nächsten Termin nicht dabei

💡 **Unterscheidung:** In der Kurs-Verwaltung kannst du sehen, welche Trainer als Standard-Trainer festgelegt sind.

**Schritt 3:** Trainer hinzufügen:
1. Klicke auf **"+ Trainer hinzufügen"**
2. Wähle einen Trainer aus der Liste
3. Klicke **"Hinzufügen"**
4. Der Trainer erscheint sofort in der Liste

**Schritt 4:** Trainer entfernen:
- Klicke auf das **❌** neben dem Trainer-Namen
- **Alle Trainer** können aus einzelnen Sessions entfernt werden
- Wenn entfernt, bleibt der Trainer für diese Session entfernt
- Die Änderung gilt nur für diese **eine Session** (z.B. "Montag 15:00 Mini-Turnen")
- Andere Sessions in der Woche sind **nicht** betroffen

💡 **Wichtig:** 
- Änderungen werden **sofort gespeichert**
- Alle Trainer sehen die Änderungen nach dem Neuladen
- Änderungen gelten **nur für diese eine Session**
- Entfernte Trainer bleiben entfernt

---

## 📝 3. NOTIZEN ERSTELLEN

### **Was sind Notizen?**
Notizen helfen dir, wichtige Infos zu Kursen festzuhalten. Es gibt **zwei Arten**:

| Symbol | Typ | Wer sieht es? |
|--------|-----|---------------|
| 🔒 | **Intern** | Nur Trainer (im Admin-Bereich) |
| 📢 | **Für Eltern** | Trainer + Eltern (auch auf Kursplan) |

### **So erstellst du eine Notiz:**

**Schritt 1:** Klicke auf einen Kurs

**Schritt 2:** Klicke auf **"📝 Notiz hinzufügen"**

**Schritt 3:** Im Notiz-Modal:
1. Wähle den **Typ**:
   - 🔒 **Intern** - Nur für Trainer
   - 📢 **Für Eltern** - Auch im öffentlichen Kursplan sichtbar
2. Schreibe deine **Notiz**
3. Klicke **"Speichern"**

**Schritt 4:** Die Notiz erscheint:
- Als **Badge** im Kurs-Header (z.B. 🔒1 📢2)
- In der **Notiz-Liste** im aufgeklappten Kurs

### **Notizen bearbeiten/löschen:**
- Klicke auf **✏️ Bearbeiten** oder **🗑️ Löschen** in der Notiz-Liste

### **Beispiele:**

**🔒 Interne Notizen:**
```
"Lisa hat Knieprobleme - vorsichtig mit Sprüngen!"
"Geräte in Halle B defekt - nicht benutzen"
"Max fehlt heute wegen Arzttermin"
```

**📢 Notizen für Eltern:**
```
"Heute bitte Turnschläppchen mitbringen!"
"Training findet ausnahmsweise in Halle C statt"
"Nächste Woche Eltern-Kind-Turnen"
```

⚠️ **Achtung:** Bei "Für Eltern" wird eine Warnung angezeigt - alle Eltern können diese Notiz sehen!

---

## ❌ 4. KURSE ALS AUSGEFALLEN MARKIEREN

### **So meldest du einen Ausfall:**

**Schritt 1:** Klicke auf den betroffenen Kurs

**Schritt 2:** Klicke auf **"❌ Kurs ausfallen lassen"**

**Schritt 3:** Bestätige im Dialog mit **"Ja, ausfallen lassen"**

**Was passiert dann?**
- Der Kurs wird **rot** markiert
- Status zeigt **"❌ Fällt aus"**
- **Keine Stunden** werden für diesen Kurs gezählt
- Eltern sehen den Ausfall im öffentlichen Kursplan

### **Ausfall wieder aufheben:**
- Klicke auf den ausgefallenen Kurs
- Klicke **"✅ Ausfall aufheben"**
- Der Kurs wird wieder grün

💡 **Tipp:** Erstelle zusätzlich eine Notiz für Eltern, wenn ein Kurs ausfällt!

---

## 🏠 5. KURSE VERWALTEN

### **Kurse ansehen:**
1. Klicke oben auf **"Kurse"**
2. Du siehst alle Kurse mit:
   - Name
   - Wochentag
   - Uhrzeit
   - Halle
   - Standard-Trainer

### **Neuen Kurs anlegen:**
1. Klicke **"+ Neuer Kurs"**
2. Fülle alle Felder aus:
   - Kursname
   - Wochentag
   - Startzeit & Endzeit
   - Halle
   - Anzahl Trainer (Soll-Besetzung)
3. Klicke **"Speichern"**

### **Kurs bearbeiten:**
- Klicke auf **✏️** beim Kurs
- Ändere die Daten
- Klicke **"Speichern"**

### **Standard-Trainer festlegen:**
- Klicke **"Standard-Trainer festlegen"**
- Wähle Trainer aus der Liste
- Diese Trainer werden **initial** gesetzt, wenn eine neue Woche erstellt wird

---

## 🎉 6. SONDERAKTIVITÄTEN

### **Was sind Sonderaktivitäten?**
Wettkämpfe, Fortbildungen, Ausflüge, Aufführungen, etc. - alle besonderen Events, die nicht zu den regulären Kursen gehören.

**Beispiele:**
- 🏆 Vereinswettkampf
- 📚 Trainer-Fortbildung
- 🎭 Jahresaufführung
- 🚌 Ausflug zum Trampolinpark
- 🎉 Weihnachtsfeier

### **So erstellst du eine Aktivität:**

**Schritt 1:** Klicke oben auf **"Aktivitäten"**

**Schritt 2:** Klicke **"+ Neue Aktivität"**

**Schritt 3:** Fülle aus:
- **Titel** (z.B. "Vereinswettkampf")
- **Typ** (Wettkampf, Fortbildung, Ausflug, Sonstiges)
- **Datum** (wann findet es statt?)
- **Startzeit & Endzeit**
- **Ort**
- **Beschreibung**
- **Trainer** (wer nimmt teil?)

**Schritt 4:** Klicke **"Speichern"**

### **Was passiert dann?**
- Die Aktivität erscheint in der **Aktivitäten-Liste**
- Die Aktivität erscheint auch in der **Wochenplanung** (am entsprechenden Tag)
- Die Aktivität ist auch für **Eltern im öffentlichen Kursplan** sichtbar
- Stunden werden **automatisch** den Trainern gutgeschrieben

💡 **Tipp:** Sonderaktivitäten sind perfekt, um Eltern über Wettkämpfe, Aufführungen oder Events zu informieren!

---

## 🌐 7. ÖFFENTLICHEN KURSPLAN TEILEN

### **Was ist der öffentliche Kursplan?**
Eine **öffentlich zugängliche** Seite, die Eltern und Teilnehmer sehen können - **ohne Login!**

### **URL:**
```
https://trainer.tsvrot.de/kursplan
```

### **Was sehen Eltern dort?**
- ✅ Alle Kurse der Woche (grün = findet statt)
- ❌ Ausgefallene Kurse (rot = fällt aus)
- 👤 Trainer-Namen
- 🎉 **Sonderaktivitäten** (Wettkämpfe, Events, etc.)
- 🏖️ Ferien-Hinweis
- 📢 **Öffentliche Notizen** (die mit 📢 markiert wurden)
- ◀️ ▶️ Navigation durch Wochen

### **So teilst du den Kursplan:**

**Option 1: Link kopieren**
1. Gehe auf den öffentlichen Kursplan
2. Klicke **"🔗 Link kopieren"**
3. Füge den Link ein wo du willst (E-Mail, WhatsApp, etc.)

**Option 2: WhatsApp**
1. Klicke **"💬 WhatsApp teilen"**
2. Wähle Kontakt oder Gruppe
3. Vorformatierte Nachricht wird eingefügt

**Option 3: QR-Code**
1. Klicke **"📱 QR-Code"**
2. QR-Code wird angezeigt
3. Drucke ihn aus für Schwarzes Brett

### **Vorlagen-Nachricht für WhatsApp:**
```
🏃 TSV Rot Turnen - Kursplan

Hier könnt ihr immer den aktuellen Trainingsplan sehen:
👉 https://trainer.tsvrot.de/kursplan

Dort seht ihr:
✅ Welche Kurse stattfinden
❌ Welche Kurse ausfallen
👤 Wer trainiert
📢 Wichtige Hinweise

Der Plan wird automatisch aktualisiert!
```

---

## ⚙️ 8. EINSTELLUNGEN

### **Abmelden:**
- Klicke oben rechts auf **"Abmelden"**
- Du wirst ausgeloggt und zurück zum Login geleitet

💡 **Tipp:** Nach dem Abmelden werden keine Änderungen mehr gespeichert.

---

## 🆘 HÄUFIGE FRAGEN (FAQ)

### **❓ Warum haben alle Trainer die gleichen Login-Daten?**
- **Vereinfachung:** Kein individuelles Passwort-Management nötig
- **Schneller Zugang:** Alle können sofort starten
- **Gemeinsames System:** Jeder sieht die gleiche Wochenplanung

### **❓ Wie werden meine Stunden gezählt?**
**Automatisch!** Die App zählt:
- ✅ Alle Kurse mit dir als Standard-Trainer
- ✅ Alle Kurse wo du manuell hinzugefügt wurdest
- ✅ Sonderaktivitäten wo du teilnimmst
- ❌ **NICHT** ausgefallene Kurse
- ❌ **NICHT** Ferienwochen (außer Kurs-Ausnahmen)

### **❓ Wann werden Stunden gebucht?**
- **Automatisch** wenn eine Woche vorbei ist
- **Tagesgenau** basierend auf dem Kurs-Datum
- **Synchronisation** läuft nachts

### **❓ Was sind Standard-Trainer?**
- **Standard-Trainer** sind in den Kurs-Einstellungen festgelegt
- Sie werden **initial** gesetzt, wenn eine neue Woche erstellt wird
- Du kannst sie aus einzelnen **Sessions** entfernen (❌)
- Wenn entfernt, sind sie nicht mehr in der Trainer-Liste

**Beispiel:**
- Standard-Trainer für "Mini-Turnen Mo 15:00" ist Lisa
- In KW 2 wird die Woche erstellt → Lisa ist initial dabei
- Du entfernst Lisa am 8.1. → Lisa ist nicht mehr in der Liste
- In KW 3 wird die neue Woche erstellt → Lisa ist wieder initial dabei
- Andere Sessions (z.B. "Kinderturnen Di 16:00") sind nicht betroffen

### **❓ Ich sehe meine Änderungen nicht?**
- **Seite neu laden** (F5 oder Reload-Button)
- Änderungen sind sofort gespeichert
- Andere Trainer müssen auch neu laden

### **❓ Kann ich vergangene Sessions ändern?**
- **Ja!** Du kannst in die Vergangenheit navigieren
- Trainer zu einzelnen Sessions hinzufügen/entfernen
- Notizen erstellen oder bearbeiten
- Kurse als ausgefallen markieren
- Stunden werden automatisch neu berechnet

### **❓ Was passiert bei Ferienwochen?**
- Kurse werden automatisch **ausgegraut**
- **Keine Stunden** werden gezählt
- Ausnahme: Kurse die trotz Ferien stattfinden (Admin-Einstellung)

### **❓ Unterschied 🔒 intern vs 📢 für Eltern?**
| Typ | Sichtbar für | Verwendung |
|-----|-------------|------------|
| 🔒 **Intern** | Nur Trainer | Gesundheit, Probleme, interne Infos |
| 📢 **Für Eltern** | Trainer + Eltern | Wichtige Hinweise, Änderungen, Infos |

### **❓ Wer kann was sehen?**
| Bereich | Trainer (Admin-App) | Eltern (Kursplan) |
|---------|---------|-------------------|
| Wochenplanung bearbeiten | ✅ | ❌ |
| Wochenplan ansehen | ✅ | ✅ (auf /kursplan) |
| Kurse & Zeiten | ✅ | ✅ |
| Standard-Trainer | ✅ | ✅ (nur Namen) |
| Zusätzliche Trainer | ✅ | ✅ (nur Namen) |
| 🔒 Interne Notizen | ✅ | ❌ |
| 📢 Öffentliche Notizen | ✅ | ✅ |
| 🎉 Sonderaktivitäten | ✅ | ✅ |
| Ausfälle | ✅ | ✅ |
| Ferien-Hinweis | ✅ | ✅ |
| Stunden-Tracking | ✅ | ❌ |
| Trainer hinzufügen/entfernen | ✅ | ❌ |

### **❓ Kann ich auf dem Handy arbeiten?**
- **Ja!** Die App ist mobile-optimiert
- Funktioniert auf **allen Geräten**
- Am besten mit **Chrome, Safari oder Firefox**

---

## 📱 9. MOBILE NUTZUNG (TIPPS)

### **App zum Home-Screen hinzufügen:**

**iPhone/iPad:**
1. Öffne https://trainer.tsvrot.de in Safari
2. Tippe auf **Teilen-Button** (📤)
3. Wähle **"Zum Home-Bildschirm"**
4. App-Icon erscheint wie eine normale App

**Android:**
1. Öffne https://trainer.tsvrot.de in Chrome
2. Tippe auf **Menü** (⋮)
3. Wähle **"Zum Startbildschirm hinzufügen"**
4. App-Icon erscheint auf dem Home-Screen

### **Vorteile:**
- ✅ Schneller Zugriff
- ✅ Funktioniert wie eine App
- ✅ Kein App-Store-Download nötig

---

## 🎯 10. BEST PRACTICES (Empfehlungen)

### **Für optimale Nutzung:**

**✅ DO:**
- 📅 **Wochenplanung regelmäßig checken** (min. 1x pro Woche)
- 📝 **Notizen nutzen** für wichtige Infos
- 📢 **Öffentliche Notizen** für Eltern-Kommunikation
- ❌ **Ausfälle sofort melden** damit Eltern Bescheid wissen
- 🔗 **Kursplan teilen** mit neuen Eltern

**❌ DON'T:**
- 🔒 **Keine sensiblen Daten** in öffentlichen Notizen
- ⏰ **Nicht warten** mit Ausfall-Meldungen
- 📱 **Nicht vergessen** andere Trainer zu informieren
- 🔄 **Nicht ohne Reload** erwarten dass Änderungen erscheinen

### **Workflow-Empfehlung:**

**Montag Morgen:**
1. ✅ Wochenplan checken
2. ✅ Trainer-Zuweisungen prüfen
3. ✅ Notizen lesen

**Während der Woche:**
1. ✅ Ausfälle sofort melden
2. ✅ Notizen erstellen wenn nötig
3. ✅ Trainer hinzufügen bei Vertretungen

---

## 📞 SUPPORT & KONTAKT

### **Bei Problemen:**

**Technische Probleme:**
- 🐛 **Bug melden:** Screenshot + Beschreibung an Admin
- 🔄 **Erst versuchen:** Seite neu laden (F5)
- 🌐 **Browser prüfen:** Chrome, Safari, Firefox empfohlen

**Fragen zur Nutzung:**
- 💬 **Andere Trainer fragen:** Viele kennen sich schon aus
- 📧 **Admin kontaktieren:** Für spezielle Fragen
- 📖 **Diese Doku lesen:** Meistens steht es hier 😊

**Fehlende Funktionen:**
- 💡 **Ideen sind willkommen!** Feedback-Button nutzen
- 🔧 **Verbesserungen:** Jederzeit möglich

---

## ✅ CHECKLISTE: ERSTE SCHRITTE

**Für neue Trainer:**

- [ ] Login mit gemeinsamen Zugangsdaten getestet (Trainer / TSVRot2024)
- [ ] Wochenplanung angeschaut
- [ ] Eigenen Namen in Kursen gefunden
- [ ] Einmal Trainer hinzugefügt
- [ ] Notiz erstellt (testweise)
- [ ] Öffentlichen Kursplan angeschaut
- [ ] App zum Home-Screen hinzugefügt (Handy)
- [ ] Diese Doku gelesen 😊

**Glückwunsch! Du bist bereit!** 🎉

---

## 📚 ANHANG: KURZ-REFERENZ

### **Wichtigste Funktionen auf einen Blick:**

| Funktion | Wo? | Wie? |
|----------|-----|------|
| **Trainer verwalten** | Wochenplanung | Kurs aufklappen → "+ Trainer hinzufügen" oder "❌" |
| **Notiz erstellen** | Wochenplanung | Kurs aufklappen → "📝 Notiz hinzufügen" |
| **Ausfall melden** | Wochenplanung | Kurs aufklappen → "❌ Ausfallen lassen" |
| **Kursplan teilen** | Kursplan | "🔗 Link" / "💬 WhatsApp" / "📱 QR-Code" |
| **Neuer Kurs** | Kurse | "+ Neuer Kurs" |
| **Aktivität** | Aktivitäten | "+ Neue Aktivität" |

### **Tastatur-Shortcuts:**

| Shortcut | Aktion |
|----------|--------|
| `F5` | Seite neu laden |
| `Esc` | Modal schließen |
| `←` / `→` | Vorherige/Nächste Woche (nur wenn fokussiert) |

---

**🏃 Viel Erfolg mit der Trainer-App!**

Bei Fragen: Einfach den Admin oder erfahrene Kollegen fragen! 😊

---

**Version:** 2.11.1  
**Letzte Aktualisierung:** 18. Januar 2026  
**Erstellt für:** TSV Rot Turnabteilung
