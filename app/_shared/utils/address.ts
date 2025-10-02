type GeocodeResult = {
  formatted_address: string;
  address_components: Array<{
    long_name: string;
    short_name: string;
    types: string[];
  }>;
  geometry: {
    location: { lat: number; lng: number };
    location_type?: string;
    viewport?: {
      northeast: { lat: number; lng: number };
      southwest: { lat: number; lng: number };
    };
  };
  place_id?: string;
  plus_code?: {
    compound_code?: string;
    global_code?: string;
  };
  types?: string[];
};

function ensureRtRwComponents(
  components: GeocodeResult["address_components"],
  formatted: string
) {
  // Cari pola "RT.10/RW.11" atau "RT 10 / RW 11"
  const match = formatted.match(/RT\.?\s?(\d+)\s*\/\s*RW\.?\s?(\d+)/i);
  if (!match) return components;

  const [, rtNumber, rwNumber] = match;

  const hasRT = components.some((c) =>
    c.types.includes("administrative_area_level_7")
  );
  const hasRW = components.some((c) =>
    c.types.includes("administrative_area_level_6")
  );

  const next = [...components];
  if (!hasRT) {
    next.push({
      long_name: `RT ${rtNumber}`,
      short_name: `RT ${rtNumber}`,
      types: ["administrative_area_level_7", "political"],
    });
  }
  if (!hasRW) {
    next.push({
      long_name: `RW ${rwNumber}`,
      short_name: `RW ${rwNumber}`,
      types: ["administrative_area_level_6", "political"],
    });
  }
  return next;
}

export function buildBackendAddressPayload(
  raw: GeocodeResult,
  opts?: { injectRtRwFromFormatted?: boolean }
) {
  const components = opts?.injectRtRwFromFormatted
    ? ensureRtRwComponents(
        raw.address_components || [],
        raw.formatted_address || ""
      )
    : raw.address_components || [];

  return {
    address_components: components,
    formatted_address: raw.formatted_address,
    geometry: {
      location: {
        lat: raw.geometry?.location?.lat,
        lng: raw.geometry?.location?.lng,
      },
      // location_type hanya ada di Geocoding result (bisa undefined di Places Detail)
      location_type: raw.geometry?.location_type,
      viewport: raw.geometry?.viewport
        ? {
            northeast: {
              lat: raw.geometry.viewport.northeast.lat,
              lng: raw.geometry.viewport.northeast.lng,
            },
            southwest: {
              lat: raw.geometry.viewport.southwest.lat,
              lng: raw.geometry.viewport.southwest.lng,
            },
          }
        : undefined,
    },
    place_id: raw.place_id,
    plus_code: raw.plus_code,
    types: raw.types,
  };
}

// Ambil lat/lng & viewport aman dari Place Details atau Reverse Geocode
function extractGeometry(raw: any) {
  if (!raw?.geometry || !raw.geometry.location) {
    return {
      lat: undefined,
      lng: undefined,
      viewport: undefined,
      location_type: undefined,
    };
  }

  // PlaceDetails: geometry.location.lat() adalah function
  const isPlaceDetails = typeof raw.geometry.location.lat === "function";

  const lat = isPlaceDetails
    ? raw.geometry.location.lat()
    : raw.geometry.location.lat;

  const lng = isPlaceDetails
    ? raw.geometry.location.lng()
    : raw.geometry.location.lng;

  const viewport = raw.geometry.viewport
    ? isPlaceDetails
      ? {
          northeast: {
            lat: raw.geometry.viewport.getNorthEast().lat(),
            lng: raw.geometry.viewport.getNorthEast().lng(),
          },
          southwest: {
            lat: raw.geometry.viewport.getSouthWest().lat(),
            lng: raw.geometry.viewport.getSouthWest().lng(),
          },
        }
      : raw.geometry.viewport
    : undefined;

  const location_type = raw.geometry.location_type;
  return { lat, lng, viewport, location_type };
}

// Coba tarik route & street_number, kalau tidak ada, parse dari formatted_address
function extractStreet(raw: any) {
  const comps: any[] = raw?.address_components || [];
  const find = (type: string) => comps.find((c) => c.types?.includes(type));

  const route = find("route")
    ? {
        long_name: find("route")!.long_name,
        short_name: find("route")!.short_name || find("route")!.long_name,
        types: ["route"],
      }
    : null;

  const streetNumberComp = find("street_number")
    ? {
        long_name: find("street_number")!.long_name,
        short_name:
          find("street_number")!.short_name || find("street_number")!.long_name,
        types: ["street_number"],
      }
    : null;

  // fallback parsing "No.x" kalau street_number kosong
  let streetNumberFallback = null;
  if (!streetNumberComp && typeof raw?.formatted_address === "string") {
    const m = raw.formatted_address.match(/\b(No\.?\s*\d+)\b/i);
    if (m) {
      streetNumberFallback = {
        long_name: m[1],
        short_name: m[1],
        types: ["street_number"],
      };
    }
  }

  return { route, streetNumber: streetNumberComp || streetNumberFallback };
}

// Parse RT/RW dari formatted address, contoh: "RT.10/RW.11"
function extractRtRw(formatted: string | undefined) {
  if (!formatted) return [];
  const out: any[] = [];
  const rt = formatted.match(/\bRT[.\s]*0*(\d+)\b/i)?.[1];
  const rw = formatted.match(/\bRW[.\s]*0*(\d+)\b/i)?.[1];
  if (rt) {
    out.push({
      long_name: `RT ${rt}`,
      short_name: `RT ${rt}`,
      types: ["administrative_area_level_7", "political"],
    });
  }
  if (rw) {
    out.push({
      long_name: `RW ${rw}`,
      short_name: `RW ${rw}`,
      types: ["administrative_area_level_6", "political"],
    });
  }
  return out;
}

// Normalisasi ke struktur backend
export function normalizeAddressForBackend(raw: any) {
  const formatted_address = raw?.formatted_address || raw?.name || "";
  const { lat, lng, viewport, location_type } = extractGeometry(raw);
  const { route, streetNumber } = extractStreet(raw);

  // Ambil semua komponen asli
  const originalComps: any[] = (raw?.address_components || []).map(
    (c: any) => ({
      long_name: c.long_name,
      short_name: c.short_name || c.long_name,
      types: c.types,
    })
  );

  // Sisipkan route & street_number kalau belum ada
  const compsWithStreet = [
    ...(streetNumber ? [streetNumber] : []),
    ...(route ? [route] : []),
    ...originalComps,
  ];

  // Tambahkan RT/RW hasil parsing jika belum ada
  const rtRw = extractRtRw(formatted_address);
  // Hindari duplikasi berdasarkan types
  const typesKey = (c: any) => c.types.join("|") + "|" + c.long_name;
  const dedupMap = new Map<string, any>();
  [...compsWithStreet, ...rtRw].forEach((c) => dedupMap.set(typesKey(c), c));
  const address_components = Array.from(dedupMap.values());

  const payloadItem = {
    address_components,
    formatted_address,
    geometry: {
      location: { lat, lng },
      ...(location_type ? { location_type } : {}),
      ...(viewport ? { viewport } : {}),
    },
    ...(raw?.place_id ? { place_id: raw.place_id } : {}),
    ...(raw?.plus_code ? { plus_code: raw.plus_code } : {}),
    types: raw?.types || ["street_address"], // default aman
  };

  return payloadItem;
}
