"use client";

import { geoContains } from "d3-geo";
import { useMemo, useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from "react-simple-maps";
import {
  formatLocationDisplay,
  formatSightingDate,
  formatSubmitterName,
} from "@/lib/format-sighting";
import {
  clusterSightings,
  computeMapStats,
  getVisitedGeoIds,
  isUSSighting,
  matchesGeoCountry,
  offsetMarkerCoordinates,
  summarizeCountries,
  US_STATE_TOTAL,
  WORLD_COUNTRY_TOTAL,
  type MarkerCluster,
} from "@/lib/map-utils";
import type { Sighting } from "@/lib/sightings";

const US_GEO_URL = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";
const WORLD_GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const MAP_FILL_VISITED = "var(--gold)";
const MAP_FILL_DEFAULT = "#241D14";
const MAP_STROKE = "var(--line)";

interface SpottingsMapsProps {
  sightings: Sighting[];
}

interface PopoverState {
  sighting: Sighting;
  coordinates: [number, number];
}

function countryFlag(country: string): string {
  const flags: Record<string, string> = {
    "United States of America": "🇺🇸",
    "United States": "🇺🇸",
    Slovakia: "🇸🇰",
    "United Kingdom": "🇬🇧",
    Ireland: "🇮🇪",
    Canada: "🇨🇦",
    Mexico: "🇲🇽",
    France: "🇫🇷",
    Germany: "🇩🇪",
    Spain: "🇪🇸",
    Italy: "🇮🇹",
  };

  return flags[country] ?? "🌍";
}

function MarkerLayer({
  clusters,
  onSelect,
}: {
  clusters: MarkerCluster[];
  onSelect: (sighting: Sighting, coordinates: [number, number]) => void;
}) {
  return (
    <>
      {clusters.map((cluster) => {
        const count = cluster.sightings.length;

        return cluster.sightings.map((sighting, index) => {
          const [lng, lat] = offsetMarkerCoordinates(
            cluster.lat,
            cluster.lng,
            index,
            count,
          );

          return (
            <Marker key={`${cluster.key}-${sighting.id}`} coordinates={[lng, lat]}>
              <g
                className="map-marker"
                style={{ cursor: "pointer" }}
                onClick={() => onSelect(sighting, [lng, lat])}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onSelect(sighting, [lng, lat]);
                  }
                }}
                role="button"
                tabIndex={0}
                aria-label={`Sighting in ${formatLocationDisplay(sighting)}`}
              >
                <text y={4} textAnchor="middle" fontSize={14}>
                  🦆
                </text>
                {count > 1 && index === 0 ? (
                  <>
                    <circle cx={10} cy={-8} r={8} fill="var(--maroon)" />
                    <text
                      x={10}
                      y={-5}
                      textAnchor="middle"
                      fontSize={9}
                      fontWeight={700}
                      fill="#fff"
                    >
                      {count}
                    </text>
                  </>
                ) : null}
              </g>
            </Marker>
          );
        });
      })}
    </>
  );
}

export default function SpottingsMaps({ sightings }: SpottingsMapsProps) {
  const [popover, setPopover] = useState<PopoverState | null>(null);

  const stats = useMemo(() => computeMapStats(sightings), [sightings]);
  const countrySummaries = useMemo(() => summarizeCountries(sightings), [sightings]);
  const usSightings = useMemo(
    () => sightings.filter((sighting) => isUSSighting(sighting)),
    [sightings],
  );
  const usClusters = useMemo(() => clusterSightings(usSightings), [usSightings]);
  const worldClusters = useMemo(() => clusterSightings(sightings), [sightings]);

  const handleSelect = (sighting: Sighting, coordinates: [number, number]) => {
    setPopover({ sighting, coordinates });
  };

  return (
    <>
      <section className="stats">
        <div className="stat-card gold">
          <div className="big">
            {stats.statesVisited} <span className="sub">of {US_STATE_TOTAL}</span>
          </div>
          <div className="label">States Visited</div>
        </div>
        <div className="stat-card">
          <div className="big">{stats.statesToGo}</div>
          <div className="label">States To Go</div>
        </div>
        <div className="stat-card gold">
          <div className="big">
            {stats.countriesVisited}{" "}
            <span className="sub">of ~{WORLD_COUNTRY_TOTAL}</span>
          </div>
          <div className="label">Countries Visited</div>
        </div>
        <div className="stat-card">
          <div className="big">~{stats.countriesToGo}</div>
          <div className="label">Countries To Go</div>
        </div>
      </section>

      <section className="mapsection">
        <div className="wrap">
          <div className="mapcard">
            <h2 className="map-title">United States</h2>
            <ComposableMap
              projection="geoAlbersUsa"
              width={820}
              height={480}
              className="geo-map"
            >
              <Geographies geography={US_GEO_URL}>
                {({ geographies }) => {
                  const visitedIds = getVisitedGeoIds(
                    usSightings,
                    geographies,
                    (geo, point) => geoContains(geo as never, point),
                  );

                  return (
                    <>
                      {geographies.map((geo) => {
                        const geoId = String(geo.id);
                        const visited = visitedIds.has(geoId);

                        return (
                          <Geography
                            key={geo.rsmKey}
                            geography={geo}
                            fill={visited ? MAP_FILL_VISITED : MAP_FILL_DEFAULT}
                            stroke={visited ? "var(--dark)" : MAP_STROKE}
                            strokeWidth={0.75}
                            style={{
                              default: { outline: "none" },
                              hover: { outline: "none", opacity: 0.9 },
                              pressed: { outline: "none" },
                            }}
                          />
                        );
                      })}
                      <MarkerLayer clusters={usClusters} onSelect={handleSelect} />
                    </>
                  );
                }}
              </Geographies>
            </ComposableMap>
            <div className="maplegend">
              <div>
                <span className="swatch gold"></span> Visited — duck spotted here
              </div>
              <div>
                <span className="swatch white"></span> Not yet — waiting on you
              </div>
            </div>
          </div>

          <div className="mapcard mapcard-world">
            <h2 className="map-title">World</h2>
            <ComposableMap
              projection="geoEqualEarth"
              width={820}
              height={420}
              className="geo-map"
            >
              <Geographies geography={WORLD_GEO_URL}>
                {({ geographies }) => {
                  const visitedIds = getVisitedGeoIds(
                    sightings,
                    geographies,
                    (geo, point) => geoContains(geo as never, point),
                    matchesGeoCountry,
                  );

                  return (
                    <>
                      {geographies.map((geo) => {
                        const geoId = String(geo.id);
                        const visited = visitedIds.has(geoId);

                        return (
                          <Geography
                            key={geo.rsmKey}
                            geography={geo}
                            fill={visited ? MAP_FILL_VISITED : MAP_FILL_DEFAULT}
                            stroke={visited ? "var(--dark)" : MAP_STROKE}
                            strokeWidth={0.5}
                            style={{
                              default: { outline: "none" },
                              hover: { outline: "none", opacity: 0.9 },
                              pressed: { outline: "none" },
                            }}
                          />
                        );
                      })}
                      <MarkerLayer clusters={worldClusters} onSelect={handleSelect} />
                    </>
                  );
                }}
              </Geographies>
            </ComposableMap>
            <div className="maplegend">
              <div>
                <span className="swatch gold"></span> Visited — duck spotted here
              </div>
              <div>
                <span className="swatch white"></span> Not yet — waiting on you
              </div>
            </div>
          </div>

          {popover ? (
            <div className="map-popover" role="dialog" aria-label="Sighting details">
              <button
                type="button"
                className="map-popover-close"
                onClick={() => setPopover(null)}
                aria-label="Close"
              >
                ×
              </button>
              <div className="map-popover-name">
                {formatSubmitterName(popover.sighting.name)}
              </div>
              <div className="map-popover-location">
                {formatLocationDisplay(popover.sighting)}
              </div>
              <div className="map-popover-date">
                {formatSightingDate(popover.sighting.createdAt)}
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <section className="intl">
        <div className="wrap">
          <h2 className="section-title">International Sightings</h2>
          {countrySummaries.length > 0 ? (
            <div className="countrygrid">
              {countrySummaries.map((summary) => (
                <div key={summary.country} className="countrychip">
                  <div className="flag">{countryFlag(summary.country)}</div>
                  <div className="cname">{summary.country}</div>
                  <div className="ccount">
                    {summary.stateCount !== null
                      ? `${summary.stateCount} state${summary.stateCount === 1 ? "" : "s"}, ${summary.sightingCount} sighting${summary.sightingCount === 1 ? "" : "s"}`
                      : summary.sampleLocation
                        ? `${summary.sampleLocation} — ${summary.sightingCount} sighting${summary.sightingCount === 1 ? "" : "s"}`
                        : `${summary.sightingCount} sighting${summary.sightingCount === 1 ? "" : "s"}`}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="map-empty-note">No approved sightings yet — be the first!</p>
          )}
        </div>
      </section>
    </>
  );
}
