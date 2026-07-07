import type { Sighting } from "./sightings";

export function formatSubmitterName(name: string | null): string {
  return name?.trim() || "Someone";
}

export function formatLocationDisplay(sighting: Pick<Sighting, "locationName" | "city" | "state" | "country">): string {
  if (sighting.locationName?.trim()) return sighting.locationName.trim();
  if (sighting.state) return `${sighting.city}, ${sighting.state}`;
  if (sighting.country) return `${sighting.city}, ${sighting.country}`;
  return sighting.city;
}

export function formatSightingDate(createdAt: Date | null): string {
  if (!createdAt) return "";
  return createdAt.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export function formatHeroCaption(sighting: Pick<Sighting, "notes" | "name">): string {
  const submitter = formatSubmitterName(sighting.name);
  if (sighting.notes?.trim()) {
    return `"${sighting.notes.trim()}" — submitted by ${submitter}`;
  }
  return `Submitted by ${submitter}`;
}

export function formatSightingAlt(sighting: Sighting): string {
  return `Shady Duck sighting: ${formatSubmitterName(sighting.name)}, ${formatLocationDisplay(sighting)}`;
}
