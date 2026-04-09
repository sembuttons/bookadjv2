import { NextResponse } from "next/server";
import { customerTravelIndicationEuros } from "@/lib/customer-travel-indication";
import { haversineKm } from "@/lib/travel-distance";

function getServerMapsKey(): string | null {
  const k =
    (typeof process.env.GOOGLE_MAPS_API_KEY === "string"
      ? process.env.GOOGLE_MAPS_API_KEY
      : "") ||
    (typeof process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY === "string"
      ? process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY
      : "");
  const t = k.trim();
  return t || null;
}

type GeocodeResult = { lat: number; lng: number };

async function geocodeAddress(
  address: string,
  apiKey: string,
): Promise<{ ok: true; result: GeocodeResult } | { ok: false; status: string; message?: string }> {
  const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
  url.searchParams.set("address", address);
  url.searchParams.set("key", apiKey);
  url.searchParams.set("region", "nl");

  let res: Response;
  try {
    res = await fetch(url.toString());
  } catch (e) {
    console.error("[travel-cost] geocode fetch network error", e);
    return { ok: false, status: "FETCH_ERROR", message: String(e) };
  }

  const data = (await res.json()) as {
    status: string;
    error_message?: string;
    results?: { geometry: { location: { lat: number; lng: number } } }[];
  };

  if (data.status !== "OK" || !data.results?.[0]?.geometry?.location) {
    console.log("[travel-cost] geocode failed", {
      addressPreview: address.slice(0, 100),
      status: data.status,
      error_message: data.error_message,
    });
    return {
      ok: false,
      status: data.status,
      message: data.error_message,
    };
  }

  const loc = data.results[0].geometry.location;
  return { ok: true, result: { lat: loc.lat, lng: loc.lng } };
}

const ROAD_FACTOR_FROM_CROW = 1.3;

async function drivingOneWayKm(
  originLat: number,
  originLng: number,
  destLat: number,
  destLng: number,
  apiKey: string,
): Promise<number | null> {
  const url = new URL(
    "https://maps.googleapis.com/maps/api/distancematrix/json",
  );
  url.searchParams.set("origins", `${originLat},${originLng}`);
  url.searchParams.set("destinations", `${destLat},${destLng}`);
  url.searchParams.set("mode", "driving");
  url.searchParams.set("units", "metric");
  url.searchParams.set("key", apiKey);

  let res: Response;
  try {
    res = await fetch(url.toString());
  } catch (e) {
    console.error("[travel-cost] distance matrix fetch error", e);
    return null;
  }

  const data = (await res.json()) as {
    status: string;
    error_message?: string;
    rows?: { elements: { status: string; distance?: { value: number } }[] }[];
  };

  if (data.status !== "OK") {
    console.log("[travel-cost] distance matrix status", {
      status: data.status,
      error_message: data.error_message,
    });
    return null;
  }

  const el = data.rows?.[0]?.elements?.[0];
  if (
    el?.status === "OK" &&
    el.distance &&
    typeof el.distance.value === "number"
  ) {
    return el.distance.value / 1000;
  }
  console.log("[travel-cost] distance matrix element", el?.status);
  return null;
}

/**
 * Klantindicatie reiskosten: Distance Matrix (rijden) of haversine×wegfactor;
 * retour km × €0,23, gratis onder 30 km retour.
 */
export async function POST(req: Request) {
  console.log("[travel-cost] POST");

  const apiKey = getServerMapsKey();
  if (!apiKey) {
    console.error(
      "[travel-cost] Missing GOOGLE_MAPS_API_KEY and NEXT_PUBLIC_GOOGLE_MAPS_KEY",
    );
    return NextResponse.json(
      { error: "Maps API-sleutel ontbreekt op de server." },
      { status: 500 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    console.log("[travel-cost] invalid JSON body");
    return NextResponse.json({ error: "Ongeldige body." }, { status: 400 });
  }

  const venueAddress =
    typeof body.venueAddress === "string" ? body.venueAddress.trim() : "";
  const homeLat =
    typeof body.homeLat === "number" && Number.isFinite(body.homeLat)
      ? body.homeLat
      : null;
  const homeLng =
    typeof body.homeLng === "number" && Number.isFinite(body.homeLng)
      ? body.homeLng
      : null;
  const homeCity =
    typeof body.homeCity === "string" ? body.homeCity.trim() : "";

  if (!venueAddress) {
    console.log("[travel-cost] empty venueAddress");
    return NextResponse.json(
      { error: "venueAddress is verplicht." },
      { status: 400 },
    );
  }

  const venueGeocoded = await geocodeAddress(venueAddress, apiKey);
  if (!venueGeocoded.ok) {
    return NextResponse.json(
      {
        error: "Kon het adres van het evenement niet vinden. Kies een suggestie uit de lijst of vul een volledig adres in.",
        geocodeStatus: venueGeocoded.status,
      },
      { status: 422 },
    );
  }

  let originLat = homeLat;
  let originLng = homeLng;

  if (originLat == null || originLng == null) {
    if (!homeCity) {
      console.log(
        "[travel-cost] no homeLat/homeLng and no homeCity — cannot compute origin",
      );
      return NextResponse.json(
        {
          error:
            "Geen DJ-basis (stad of coördinaten) bekend om reiskosten te berekenen.",
        },
        { status: 422 },
      );
    }

    const homeGeocoded = await geocodeAddress(`${homeCity}, Nederland`, apiKey);
    if (!homeGeocoded.ok) {
      return NextResponse.json(
        {
          error: "Kon de woonplaats van de DJ niet vinden op de kaart.",
          geocodeStatus: homeGeocoded.status,
        },
        { status: 422 },
      );
    }
    originLat = homeGeocoded.result.lat;
    originLng = homeGeocoded.result.lng;
  }

  const vLat = venueGeocoded.result.lat;
  const vLng = venueGeocoded.result.lng;
  const oLat = originLat!;
  const oLng = originLng!;

  const matrixOneWay = await drivingOneWayKm(oLat, oLng, vLat, vLng, apiKey);
  const oneWayDriving =
    matrixOneWay ??
    haversineKm(oLat, oLng, vLat, vLng) * ROAD_FACTOR_FROM_CROW;

  const returnTripKm = 2 * oneWayDriving;
  const { costEuro, returnKmRounded } =
    customerTravelIndicationEuros(returnTripKm);

  console.log("[travel-cost] success", {
    returnKmRounded,
    costEuro,
    oneWayKm: Math.round(oneWayDriving * 10) / 10,
    usedMatrix: matrixOneWay != null,
  });

  return NextResponse.json({
    ok: true,
    distanceKm: returnKmRounded,
    costEuro,
  });
}
