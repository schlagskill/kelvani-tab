# KelvaniTab

KelvaniTab ersetzt die Neuer-Tab-Seite in Chrome oder Edge durch ein persönliches Widget-Dashboard. Version 0.3.1: blaue Hintergründe, ruhige Karten und ein veränderbares Raster. Kostenlos, MIT-lizenziert, ohne Konto. Dies ist eine installierbare Entwicklungsversion; noch kein Store-Release.

## Dein Dashboard

Zwölf Widgets: analoge/digitale Uhr mit Begrüßung, Websuche, gruppierte Schnellzugriffe, Monatskalender, Aufgaben, automatisch gespeicherte Notizen, Fokus-Timer, Wetter, Weltuhr, Rechner, Countdown und Tagesimpuls. Sieben sind anfangs sichtbar; weitere lassen sich über **＋ Widgets** hinzufügen. Keine Beispielaufgaben oder Beispiel-Links werden in deine Daten geschrieben.

Mit **Layout bearbeiten** ziehst du Karten am Griff auf das 12-Spalten-Raster. Gleich große Karten tauschen an einem belegten Platz ihre Position; andere betroffene Karten weichen nach unten aus. Ziehe den Pfeil **unten rechts** zum Vergrößern oder Verkleinern: Breite und Höhe rasten ins Raster ein, Nachbarn machen automatisch Platz. Die Pfeiltasten am jeweiligen Griff verschieben bzw. ändern die Größe ebenfalls. Positionen, Größen und Sichtbarkeit werden gespeichert; Ausblenden löscht Inhalte nicht. Unter 900 px werden Karten in lesbaren Spalten angeordnet. Ziehe eine Karte über eine andere, um die Reihenfolge zu ändern, oder verwende die Pfeiltasten. Breite wird dort für die Lesbarkeit angepasst, die eingestellte Größe bleibt für die breite Ansicht gespeichert.

**Anpassen** bietet Aurora, eine selbst gezeichnete Bergsee-Illustration, einen schlichten Hintergrund, fünf lokale Pixabay-Fotos und eigene lokale Fotos. Fotos werden verkleinert und lokal gespeichert. Karten-Deckkraft, Begrüßungsname sowie Hell/Dunkel/System sind einstellbar. Der Fokus-Timer bleibt beim Neuladen erhalten. Wetter wird erst nach bewusster Ortsauswahl oder Aktualisierung abgefragt; alte Werte zeigen ihren Zeitstand.

## Installation und Aktualisierung

1. Erweiterungspaket herunterladen und entpacken.
2. `chrome://extensions` oder `edge://extensions` öffnen, **Entwicklermodus** einschalten.
3. **Entpackt laden** wählen und den Ordner mit `manifest.json` auswählen.
4. Einen neuen Tab öffnen; die Änderung bestätigen, falls der Browser nachfragt. Andere Neuer-Tab-Erweiterungen können kollidieren.

Zum Aktualisieren zuerst ein Backup exportieren, Dateien im selben Erweiterungsordner austauschen und die Erweiterung neu laden. Ein anderer Ordner kann getrennte Daten erzeugen. Chrome behält zunächst den Fokus in der Adressleiste; Inkognito-Neuer-Tab wird nicht ersetzt.

## Datenschutz und Rechte

Grundberechtigung: `storage`. Keine History- oder Bookmark-Rechte. Das Wetter-Widget kann optional Zugriff auf `api.open-meteo.com` und `geocoding-api.open-meteo.com` anfordern. Es übermittelt die eingegebene Ortssuche und die Koordinaten des ausgewählten Orts, verwendet aber keine GPS-Ortung. Ohne Nutzung erfolgen keine Wetteranfragen. Anbieter: [Open-Meteo](https://open-meteo.com/en/docs), mit dessen Nutzungsbedingungen.

Suche übermittelt den Suchbegriff erst beim Absenden an den gewählten Anbieter. Schnellzugriffe verwenden lokale Initialen; keine Favicon-Dienste. Assets und Schriften sind lokal. Keine Telemetrie, Remote-Scripts, Remote-Fonts oder Cloud-Synchronisierung. Markenlink und gespeicherte Websites werden nur beim Öffnen kontaktiert. Fotos werden nicht hochgeladen.

Deinstallation löscht Erweiterungsdaten: vorher exportieren. Backups enthalten persönliche Links, Notizen, Einstellungen und gegebenenfalls dein Hintergrundfoto und sollten privat bleiben. Nur HTTP(S)-URLs ohne eingebettete Zugangsdaten sind erlaubt.

## Daten und Grenzen

100 Links, 100 Aufgaben, 20.000 Notizzeichen, Import bis 2 MB. v0.1- und v0.2-Daten bleiben erhalten; alte Links gehören zu Alltag. Backups enthalten auch Layout und Hintergrund. Import ersetzt Daten erst nach Vorschau und Bestätigung. Notizen speichern nach 350 ms Tipp-Pause oder Fokuswechsel. Vor dem Schließen Speicherstatus prüfen. Bei konkurrierenden Änderungen bleiben beide Notizversionen sichtbar.

## Entwicklung

Kein Build-Schritt oder Bibliotheksinstallation nötig. Node.js 22+: `npm test`.

HTTP-Vorschau: `python -m http.server 8080 --bind 127.0.0.1`, dann http://127.0.0.1:8080 öffnen. Vorschau nutzt localStorage, Erweiterung chrome.storage.local. Ihre Daten sind getrennt. Direktes Öffnen als Datei wird nicht unterstützt. Web Locks serialisieren Änderungen mehrerer App-Tabs.

48 Tests prüfen Daten, Speicherung, Migration, Notizkonflikte, Rasterkollisionen, Rechner, Kalender, Timer und Wetterdaten. Browser-Vorschau ersetzt keinen Installationstest. Ergebnisse und offene native Prüfungen: [TESTING.md](TESTING.md).

## Herkunft

Eigenständiger Kelvani-Code für schlagskill mit OpenAI-Coding-Unterstützung. Original-Logo vom Projektinhaber, unverändert. Bergsee-SVG und Aurora-Hintergrund wurden für dieses Projekt erstellt. Referenzbilder inspirierten die Anordnung; deren Bilder und Code werden nicht mitgeliefert. Keine fremde Repository-Historie oder fremden Spendenlinks.

Inter: https://rsms.me/inter/ · SIL Open Font License 1.1, siehe assets/Inter-OFL.txt. Code: MIT, siehe LICENSE. Die Logo-Datei ist für die Marke mitgeliefert; die Code-Lizenz ist keine Erlaubnis, als Kelvani aufzutreten. Store-Assets stehen noch aus. Die fünf Fotografien sind separat unter der Pixabay-Inhaltslizenz lizenziert, nicht MIT; Fotografen, Quellen und Bedingungen stehen in [assets/wallpapers/CREDITS.md](assets/wallpapers/CREDITS.md).

Issues mit Browser-Version und reproduzierbaren Schritten sind willkommen. Keine privaten Backups veröffentlichen.

Weitere Widget-Ideen und Prioritäten: [WIDGET-IDEAS.md](WIDGET-IDEAS.md).
