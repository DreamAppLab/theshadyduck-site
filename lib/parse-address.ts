export interface AddressData {
  streetAddress: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  displayName: string;
}

function componentText(
  component: google.maps.places.AddressComponent,
  preferShort = false,
): string {
  return (preferShort ? component.shortText : component.longText) ?? "";
}

export function formatAddressPreview(address: AddressData): string {
  const line2 = [address.city, address.state, address.postalCode].filter(Boolean).join(", ");
  return `${address.streetAddress}, ${line2}, ${address.country}`;
}

export function parseAddress(place: google.maps.places.Place): AddressData | null {
  const components = place.addressComponents;
  if (!components?.length) return null;

  let streetNumber = "";
  let route = "";
  let city = "";
  let state = "";
  let postalCode = "";
  let country = "";

  for (const component of components) {
    const types = component.types;
    if (types.includes("street_number")) {
      streetNumber = componentText(component);
    } else if (types.includes("route")) {
      route = componentText(component);
    } else if (types.includes("locality")) {
      city = componentText(component);
    } else if (types.includes("postal_town") && !city) {
      city = componentText(component);
    } else if (types.includes("administrative_area_level_3") && !city) {
      city = componentText(component);
    } else if (types.includes("administrative_area_level_2") && !city) {
      city = componentText(component);
    } else if (types.includes("administrative_area_level_1")) {
      state = componentText(component, true) || componentText(component);
    } else if (types.includes("postal_code")) {
      postalCode = componentText(component);
    } else if (types.includes("country")) {
      country = componentText(component);
    }
  }

  let streetAddress = [streetNumber, route].filter(Boolean).join(" ");
  if (!streetAddress) {
    streetAddress = place.displayName ?? "";
  }

  if (!streetAddress || !city || !state || !country) return null;

  return {
    streetAddress,
    city,
    state,
    postalCode,
    country,
    displayName: place.formattedAddress ?? formatAddressPreview({
      streetAddress,
      city,
      state,
      postalCode,
      country,
      displayName: "",
    }),
  };
}
