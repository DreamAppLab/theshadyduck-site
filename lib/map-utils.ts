import type { Sighting } from "./sightings";

export const US_STATE_TOTAL = 50;
export const WORLD_COUNTRY_TOTAL = 195;

const US_COUNTRY_NAMES = new Set([
  "United States",
  "United States of America",
  "USA",
  "U.S.A.",
  "US",
]);

const COUNTRY_NAME_ALIASES: Record<string, string> = {
  "United States": "United States of America",
  "USA": "United States of America",
  "U.S.A.": "United States of America",
  "US": "United States of America",
  "UK": "United Kingdom",
  "Great Britain": "United Kingdom",
};

export function isUSSighting(sighting: Pick<Sighting, "country" | "lat" | "lng">): boolean {
  if (US_COUNTRY_NAMES.has(sighting.country)) return true;
  return sighting.lat >= 18 && sighting.lat <= 72 && sighting.lng >= -170 && sighting.lng <= -65;
}

export function normalizeCountryName(country: string): string {
  return COUNTRY_NAME_ALIASES[country] ?? country;
}

export function matchesGeoCountry(sightingCountry: string, geoName: string): boolean {
  const normalizedSighting = normalizeCountryName(sightingCountry).toLowerCase();
  const normalizedGeo = geoName.toLowerCase();

  return (
    normalizedSighting === normalizedGeo ||
    normalizedGeo.includes(normalizedSighting) ||
    normalizedSighting.includes(normalizedGeo)
  );
}

export interface MapStats {
  statesVisited: number;
  statesToGo: number;
  countriesVisited: number;
  countriesToGo: number;
}

export function computeMapStats(sightings: Sighting[]): MapStats {
  const usStates = new Set<string>();
  const countries = new Set<string>();

  for (const sighting of sightings) {
    countries.add(normalizeCountryName(sighting.country));

    if (isUSSighting(sighting) && sighting.state) {
      usStates.add(sighting.state.toUpperCase());
    }
  }

  const statesVisited = usStates.size;
  const countriesVisited = countries.size;

  return {
    statesVisited,
    statesToGo: Math.max(US_STATE_TOTAL - statesVisited, 0),
    countriesVisited,
    countriesToGo: Math.max(WORLD_COUNTRY_TOTAL - countriesVisited, 0),
  };
}

export interface CountrySummary {
  country: string;
  sightingCount: number;
  stateCount: number | null;
  sampleLocation: string | null;
}

export function summarizeCountries(sightings: Sighting[]): CountrySummary[] {
  const groups = new Map<string, Sighting[]>();

  for (const sighting of sightings) {
    const country = normalizeCountryName(sighting.country);
    const existing = groups.get(country) ?? [];
    existing.push(sighting);
    groups.set(country, existing);
  }

  return [...groups.entries()]
    .map(([country, countrySightings]) => {
      const states = new Set(
        countrySightings
          .filter(isUSSighting)
          .map((sighting) => sighting.state)
          .filter((state): state is string => Boolean(state)),
      );

      const sample = countrySightings[0];
      const sampleLocation = sample.locationName ?? sample.city ?? null;

      return {
        country,
        sightingCount: countrySightings.length,
        stateCount: isUSSighting(sample) ? states.size : null,
        sampleLocation,
      };
    })
    .sort((left, right) => right.sightingCount - left.sightingCount);
}

export interface MarkerCluster {
  key: string;
  sightings: Sighting[];
  lat: number;
  lng: number;
}

export function clusterSightings(sightings: Sighting[]): MarkerCluster[] {
  const groups = new Map<string, Sighting[]>();

  for (const sighting of sightings) {
    const key = `${sighting.lat.toFixed(2)},${sighting.lng.toFixed(2)}`;
    const existing = groups.get(key) ?? [];
    existing.push(sighting);
    groups.set(key, existing);
  }

  return [...groups.entries()].map(([key, clusterSightings]) => {
    const lat =
      clusterSightings.reduce((sum, sighting) => sum + sighting.lat, 0) /
      clusterSightings.length;
    const lng =
      clusterSightings.reduce((sum, sighting) => sum + sighting.lng, 0) /
      clusterSightings.length;

    return { key, sightings: clusterSightings, lat, lng };
  });
}

export function offsetMarkerCoordinates(
  lat: number,
  lng: number,
  index: number,
  total: number,
): [number, number] {
  if (total <= 1) return [lng, lat];

  const angle = (2 * Math.PI * index) / total;
  const radius = 0.35;
  return [lng + radius * Math.cos(angle), lat + radius * Math.sin(angle)];
}

export function getVisitedGeoIds(
  sightings: Sighting[],
  geographies: Array<{ id?: string | number; properties?: { name?: string } }>,
  contains: (geo: unknown, point: [number, number]) => boolean,
  matchCountry?: (sightingCountry: string, geoName: string) => boolean,
): Set<string> {
  const visited = new Set<string>();

  for (const geo of geographies) {
    const geoId = String(geo.id ?? geo.properties?.name ?? "");
    const geoName = geo.properties?.name ?? "";

    for (const sighting of sightings) {
      if (matchCountry && geoName && !matchCountry(sighting.country, geoName)) {
        continue;
      }

      if (contains(geo, [sighting.lng, sighting.lat])) {
        visited.add(geoId);
        break;
      }
    }
  }

  return visited;
}
