export interface LocationData {
  locationName: string | null;
  city: string;
  state: string | null;
  country: string;
  lat: number;
  lng: number;
  displayName: string;
}

const CITY_TYPES = new Set([
  "locality",
  "postal_town",
  "administrative_area_level_3",
  "administrative_area_level_2",
  "neighborhood",
  "sublocality",
]);

function componentText(
  component: google.maps.places.AddressComponent,
  preferShort = false,
): string {
  return (preferShort ? component.shortText : component.longText) ?? "";
}

function formatCityArea(city: string, state: string | null, country: string): string {
  if (state) return `${city}, ${state}`;
  if (country) return `${city}, ${country}`;
  return city;
}

function isCitySelection(place: google.maps.places.Place): boolean {
  const types = place.types ?? [];
  const primaryType = place.primaryType;

  if (primaryType && CITY_TYPES.has(primaryType)) return true;
  if (types.includes("establishment") || types.includes("point_of_interest")) return false;

  return types.some((type) => CITY_TYPES.has(type));
}

function buildLocationName(
  place: google.maps.places.Place,
  city: string,
  state: string | null,
  country: string,
): string | null {
  if (isCitySelection(place)) {
    return formatCityArea(city, state, country);
  }

  return place.displayName ?? null;
}

export function formatLocationPreview(location: LocationData): string {
  if (location.locationName) return location.locationName;
  return formatCityArea(location.city, location.state, location.country);
}

export function parsePlace(place: google.maps.places.Place): LocationData | null {
  const components = place.addressComponents;
  if (!place.location || !components?.length) return null;

  let city = "";
  let state: string | null = null;
  let country = "";

  for (const component of components) {
    const types = component.types;
    if (types.includes("locality")) {
      city = componentText(component);
    } else if (types.includes("postal_town") && !city) {
      city = componentText(component);
    } else if (types.includes("administrative_area_level_3") && !city) {
      city = componentText(component);
    } else if (types.includes("administrative_area_level_2") && !city) {
      city = componentText(component);
    } else if (types.includes("administrative_area_level_1")) {
      state = componentText(component, true) || null;
    } else if (types.includes("country")) {
      country = componentText(component);
    }
  }

  if (!city) {
    city = place.displayName ?? "";
  }

  if (!city || !country) return null;

  const latValue = place.location.lat;
  const lngValue = place.location.lng;
  const lat = typeof latValue === "function" ? latValue.call(place.location) : latValue;
  const lng = typeof lngValue === "function" ? lngValue.call(place.location) : lngValue;

  if (typeof lat !== "number" || typeof lng !== "number") return null;

  return {
    locationName: buildLocationName(place, city, state, country),
    city,
    state,
    country,
    lat,
    lng,
    displayName: place.formattedAddress ?? place.displayName ?? city,
  };
}
