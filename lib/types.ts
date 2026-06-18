export type Inserat = {
  id: string;
  is24_inserat_id: string;
  titel: string;
  adresse: string;
  zimmer: number;
  flaeche_qm: number;
  kaltmiete_eur: number;
  status: string;
  is24_url: string | null;
  created_at: string;
  updated_at: string;
};

export type Besichtigungsslot = {
  id: string;
  inserat_id: string;
  adresse: string;
  datum: string;
  uhrzeit: string;
  dauer_minuten: number;
  kapazitaet: number;
  belegt: number;
  slot_status: "frei" | "reserviert" | "confirmed" | string;
  reserviert_lead_uuid: string | null;
  reserviert_bis: string | null;
  created_at: string;
};

export type BesichtigungsslotWithInserat = Besichtigungsslot & {
  inserate: Pick<Inserat, "titel" | "is24_inserat_id"> | null;
};

export type Lead = {
  id: string;
  uuid: string;
  name: string;
  inserat_id: string;
  email: string | null;
  telefon: string | null;
  status: string;
  mistral_score: number | null;
  mindestanforderung_ok: boolean | null;
  fehlende_dokumente: unknown;
  dokumente_eingereicht_at: string | null;
  nachricht_text: string | null;
  mitarbeiter_notiz: string | null;
  is24_contact_id: string | null;
  landing_page_url: string | null;
  entscheidung_at: string | null;
  created_at: string;
};

export type SlotStatusFilter = "all" | "frei" | "reserviert" | "confirmed";
