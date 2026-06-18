-- Demo-Leads zur Veranschaulichung der HITL-Freigabe (/notifications)
-- Voraussetzung: 001_dashboard_schema.sql ausgeführt (inserate IS24-48291 vorhanden)
-- Nach GO/NO-GO erneut ausführbar (on conflict uuid do update)

insert into public.inserate (
  is24_inserat_id, titel, adresse, zimmer, flaeche_qm, kaltmiete_eur, status, is24_url
)
values (
  'IS24-DEMO-77102',
  'Moderne 2-Zi.-Wohnung — Koblenzer Str.',
  'Koblenzer Str. 8, 56626 Andernach',
  2,
  62,
  690,
  'aktiv',
  'https://www.immobilienscout24.de'
)
on conflict (is24_inserat_id) do nothing;

insert into public.leads (
  uuid,
  name,
  inserat_id,
  email,
  telefon,
  status,
  mistral_score,
  mindestanforderung_ok,
  fehlende_dokumente,
  dokumente_eingereicht_at,
  nachricht_text,
  mitarbeiter_notiz,
  entscheidung_at,
  landing_page_url
)
values
  (
    'demo-hitl-0001-aaaa-bbbb-cccc11111111',
    'Anna Schmidt',
    'IS24-48291',
    'anna.schmidt@example.com',
    '0151 23456789',
    'analyse_abgeschlossen',
    88,
    true,
    '[]'::jsonb,
    now() - interval '23 minutes',
    'Sehr geehrte Damen und Herren, ich interessiere mich für die Wohnung in der Mainzer Str.',
    'Mistral: Unterlagen vollständig, Bonität plausibel.',
    null,
    'https://landingpage-haller-immobilienberatu.vercel.app/upload?t=demo-hitl-0001-aaaa-bbbb-cccc11111111'
  ),
  (
    'demo-hitl-0002-aaaa-bbbb-cccc22222222',
    'Thomas Weber',
    'IS24-48291',
    'thomas.weber@example.com',
    '0176 98765432',
    'analyse_abgeschlossen',
    71,
    true,
    '[]'::jsonb,
    now() - interval '2 hours',
    'Ich würde gerne zeitnah einen Besichtigungstermin vereinbaren.',
    'Score knapp über Schwelle — Gehaltsnachweis Monat 3 fehlt optional.',
    null,
    'https://landingpage-haller-immobilienberatu.vercel.app/upload?t=demo-hitl-0002-aaaa-bbbb-cccc22222222'
  ),
  (
    'demo-hitl-0003-aaaa-bbbb-cccc33333333',
    'Lisa Müller',
    'IS24-DEMO-77102',
    'lisa.mueller@example.com',
    '0160 11223344',
    'analyse_abgeschlossen',
    52,
    false,
    '["entgelt_2.pdf","schufa.pdf"]'::jsonb,
    now() - interval '5 hours',
    'Hallo, die Wohnung klingt perfekt für mich.',
    'Unterlagen unvollständig — trotzdem manuell prüfen?',
    null,
    'https://landingpage-haller-immobilienberatu.vercel.app/upload?t=demo-hitl-0003-aaaa-bbbb-cccc33333333'
  ),
  (
    'demo-hitl-0004-aaaa-bbbb-cccc44444444',
    'Max Mustermann',
    'IS24-48291',
    'max.mustermann@example.com',
    '0152 99887766',
    'analyse_abgeschlossen',
    91,
    true,
    '[]'::jsonb,
    now() - interval '1 day',
    'Anfrage Mainzer Str. 12 — Unterlagen soeben hochgeladen.',
    null,
    null,
    'https://landingpage-haller-immobilienberatu.vercel.app/upload?t=demo-hitl-0004-aaaa-bbbb-cccc44444444'
  )
on conflict (uuid) do update set
  name = excluded.name,
  status = excluded.status,
  mistral_score = excluded.mistral_score,
  mindestanforderung_ok = excluded.mindestanforderung_ok,
  fehlende_dokumente = excluded.fehlende_dokumente,
  dokumente_eingereicht_at = excluded.dokumente_eingereicht_at,
  nachricht_text = excluded.nachricht_text,
  mitarbeiter_notiz = excluded.mitarbeiter_notiz,
  entscheidung_at = excluded.entscheidung_at;
