export interface LocationData {
  city: string;
  state: string | null;
  country: string;
  lat: number;
  lng: number;
  displayName: string;
}

function componentText(
  component: google.maps.places.AddressComponent,
  preferShort = false,
): string {
  return (preferShort ? component.shortText : component.longText) ?? "";
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
    city,
    state,
    country,
    lat,
    lng,
    displayName: place.formattedAddress ?? place.displayName ?? city,
  };
}
