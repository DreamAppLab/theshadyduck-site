"use client";

import { importLibrary, setOptions } from "@googlemaps/js-api-loader";
import { useEffect, useRef } from "react";
import { parseAddress, type AddressData } from "@/lib/parse-address";

interface AddressAutocompleteProps {
  onAddressSelect: (address: AddressData | null) => void;
  disabled?: boolean;
}

export default function AddressAutocomplete({
  onAddressSelect,
  disabled = false,
}: AddressAutocompleteProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const autocompleteRef = useRef<google.maps.places.PlaceAutocompleteElement | null>(
    null,
  );

  useEffect(() => {
    onAddressSelect(null);
  }, [onAddressSelect]);

  useEffect(() => {
    let cancelled = false;
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;
    const host = hostRef.current;

    if (!apiKey || !host) return;

    setOptions({
      key: apiKey,
      v: "weekly",
    });

    void (async () => {
      const { PlaceAutocompleteElement } = await importLibrary("places");
      if (cancelled || !hostRef.current) return;

      const autocomplete = new PlaceAutocompleteElement();
      autocomplete.includedPrimaryTypes = [
        "street_address",
        "premise",
        "subpremise",
        "route",
      ];

      autocompleteRef.current = autocomplete;
      hostRef.current.innerHTML = "";
      hostRef.current.appendChild(autocomplete);

      const handleSelect = async (event: Event) => {
        const selectEvent = event as Event & {
          placePrediction: { toPlace: () => google.maps.places.Place };
        };
        const place = selectEvent.placePrediction.toPlace();

        await place.fetchFields({
          fields: ["addressComponents", "displayName", "formattedAddress", "types"],
        });

        onAddressSelect(parseAddress(place));
      };

      autocomplete.addEventListener("gmp-select", handleSelect);
      autocomplete.addEventListener("gmp-placeselect", handleSelect);
      autocomplete.addEventListener("gmp-clear", () => onAddressSelect(null));
    })().catch(() => {
      if (!cancelled) {
        onAddressSelect(null);
      }
    });

    return () => {
      cancelled = true;
      autocompleteRef.current = null;
    };
  }, [onAddressSelect]);

  useEffect(() => {
    const element = autocompleteRef.current;
    if (!element) return;

    if (disabled) {
      element.setAttribute("disabled", "");
    } else {
      element.removeAttribute("disabled");
    }
  }, [disabled]);

  return <div ref={hostRef} className="location-autocomplete-host" aria-label="Address" />;
}
