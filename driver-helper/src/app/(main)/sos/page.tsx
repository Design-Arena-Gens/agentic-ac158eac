"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useJsApiLoader, GoogleMap, Marker } from "@react-google-maps/api";
import { Phone, AlertTriangle, MapPin, Loader2 } from "lucide-react";
import { useDriverStore } from "@/store/driver-store";

const containerStyle = {
  width: "100%",
  height: "260px",
  borderRadius: "20px",
};

export default function SOSPage() {
  const {
    sosContacts,
    addSOSContact,
    recordSOSEvent,
    sosEvents,
    profile,
    isReady,
  } = useDriverStore((state) => ({
    sosContacts: state.sosContacts,
    addSOSContact: state.addSOSContact,
    recordSOSEvent: state.recordSOSEvent,
    sosEvents: state.sosEvents,
    profile: state.profile,
    isReady: state.isReady,
  }));
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(
    () => typeof navigator !== "undefined" && !!navigator.geolocation
  );
  const [submitted, setSubmitted] = useState(false);
  const [contactForm, setContactForm] = useState({ name: "", phone: "", relation: "" });

  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;
  const { isLoaded } = useJsApiLoader({
    id: "google-maps-sos",
    googleMapsApiKey: googleMapsApiKey ?? "",
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLoadingLocation(false);
      },
      () => setLoadingLocation(false),
      { enableHighAccuracy: false, maximumAge: 60_000, timeout: 10_000 }
    );
  }, []);

  const handleSOS = async () => {
    setSubmitted(true);
    await recordSOSEvent({
      location_lat: location?.lat,
      location_lng: location?.lng,
      notes: "SOS triggered by driver",
    });
    setTimeout(() => setSubmitted(false), 4000);
  };

  const handleAddContact = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!contactForm.name.trim() || !contactForm.phone.trim()) return;
    await addSOSContact({
      name: contactForm.name.trim(),
      phone: contactForm.phone.trim(),
      relation: contactForm.relation.trim(),
    });
    setContactForm({ name: "", phone: "", relation: "" });
  };

  const lastEvent = sosEvents[0];
  const mapCenter = useMemo(
    () => location ?? { lat: 28.6139, lng: 77.209 },
    [location]
  );

  if (!isReady) {
    return <div className="card">Loading emergency tools…</div>;
  }

  return (
    <div className="space-y-6">
      <section className="card bg-gradient-to-r from-rose-500 via-red-500 to-orange-500 text-white">
        <div className="flex flex-col gap-3">
          <span className="badge bg-white/15 text-white/80">Emergency Mode</span>
          <h1 className="text-2xl font-semibold">Need help quickly, {profile?.name?.split(" ")[0] ?? "driver"}?</h1>
          <p className="text-sm text-white/85">
            Press SOS to alert your trusted contacts and log your location instantly. Works offline and syncs when you’re back online.
          </p>
          <button
            className="button-primary w-full justify-center bg-white/90 text-rose-600 shadow-lg hover:bg-white"
            style={{ boxShadow: "0 18px 35px rgba(255,255,255,0.2)" }}
            onClick={handleSOS}
          >
            {submitted ? (
              <>
                <Loader2 className="size-4 animate-spin text-rose-600" />
                SOS Triggered
              </>
            ) : (
              <>
                <AlertTriangle className="size-5" />
                SOS
              </>
            )}
          </button>
          {lastEvent && (
            <p className="text-xs text-white/75">
              Last SOS logged at {new Date(lastEvent.triggered_at).toLocaleString()}
            </p>
          )}
        </div>
      </section>

      <section className="card space-y-4">
        <div className="section-title">
          <h2>Live Map</h2>
          <span>{loadingLocation ? "Fetching location…" : "Auto refreshes"}</span>
        </div>
        {googleMapsApiKey && isLoaded ? (
          <GoogleMap center={mapCenter} zoom={12} mapContainerStyle={containerStyle}>
            {location && <Marker position={location} />}
          </GoogleMap>
        ) : (
          <div className="grid place-items-center rounded-3xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
            <MapPin className="mb-2 size-8 text-slate-400" />
            {googleMapsApiKey
              ? "Loading Google Maps…"
              : "Add NEXT_PUBLIC_GOOGLE_MAPS_KEY env to enable live map view."}
          </div>
        )}
      </section>

      <section className="card space-y-4">
        <div className="section-title">
          <h2>Trusted Contacts</h2>
          <span>Tap to call instantly</span>
        </div>
        <div className="grid gap-3">
          {sosContacts.map((contact) => (
            <a
              key={contact.id}
              href={`tel:${contact.phone}`}
              className="flex items-center justify-between rounded-2xl border border-slate-200/80 p-3 transition hover:bg-slate-50"
            >
              <div>
                <p className="font-semibold text-slate-800">{contact.name}</p>
                <p className="text-xs text-slate-500">
                  {contact.relation ? `${contact.relation} • ` : ""}
                  {contact.phone}
                </p>
              </div>
              <span className="pill flex items-center gap-1 bg-rose-100 text-rose-600">
                <Phone size={14} />
                Call
              </span>
            </a>
          ))}
        </div>

        <form onSubmit={handleAddContact} className="grid gap-3 rounded-2xl border border-slate-200/80 p-3">
          <p className="text-sm font-semibold text-slate-600">Add backup contact</p>
          <input
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
            placeholder="Name"
            value={contactForm.name}
            onChange={(event) => setContactForm((prev) => ({ ...prev, name: event.target.value }))}
            required
          />
          <input
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
            placeholder="Phone"
            value={contactForm.phone}
            onChange={(event) => setContactForm((prev) => ({ ...prev, phone: event.target.value }))}
            required
          />
          <input
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
            placeholder="Relation (optional)"
            value={contactForm.relation}
            onChange={(event) =>
              setContactForm((prev) => ({ ...prev, relation: event.target.value }))
            }
          />
          <button className="button-primary justify-center" type="submit">
            Add Contact
          </button>
        </form>
      </section>
    </div>
  );
}
