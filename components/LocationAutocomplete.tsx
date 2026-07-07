"use client";

import { importLibrary, setOptions } from "@googlemaps/js-api-loader";
import { useEffect, useRef } from "react";
import { parsePlace, type LocationData } from "@/lib/parse-place";

interface LocationAutocompleteProps {
  onLocationSelect: (location: LocationData | null) => void;
  disabled?: boolean;
}

export default function LocationAutocomplete({
  onLocationSelect,
  disabled = false,
}: LocationAutocompleteProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const autocompleteRef = useRef<google.maps.places.PlaceAutocompleteElement | null>(
    null,
  );

  useEffect(() => {
    onLocationSelect(null);
  }, [onLocationSelect]);

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

      autocompleteRef.current = autocomplete;
      hostRef.current.innerHTML = "";
      hostRef.current.appendChild(autocomplete);

      const handleSelect = async (event: Event) => {
        const selectEvent = event as Event & {
          placePrediction: { toPlace: () => google.maps.places.Place };
        };
        const place = selectEvent.placePrediction.toPlace();

        await place.fetchFields({
          fields: [
            "addressComponents",
            "location",
            "displayName",
            "formattedAddress",
            "types",
            "primaryType",
          ],
        });

        onLocationSelect(parsePlace(place));
      };

      autocomplete.addEventListener("gmp-select", handleSelect);
      autocomplete.addEventListener("gmp-placeselect", handleSelect);
      autocomplete.addEventListener("gmp-clear", () => onLocationSelect(null));
    })().catch(() => {
      if (!cancelled) {
        onLocationSelect(null);
      }
    });

    return () => {
      cancelled = true;
      autocompleteRef.current = null;
    };
  }, [onLocationSelect]);

  useEffect(() => {
    const element = autocompleteRef.current;
    if (!element) return;

    if (disabled) {
      element.setAttribute("disabled", "");
    } else {
      element.removeAttribute("disabled");
    }
  }, [disabled]);

  return <div ref={hostRef} className="location-autocomplete-host" aria-label="Location" />;
}
