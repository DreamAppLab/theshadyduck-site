import Navbar from "@/components/Navbar";

export default function SpottingsPage() {
  return (
    <>
      <Navbar currentLink="spottings" />
      
      <section className="pagehead">
        <div className="wrap">
          <p className="eyebrow">Where's the duck been</p>
          <h1 className="headline">The Duck's Travel Map</h1>
          <p>Every sighting drops a duck on the map. Some spots have seen the Shady Duck more than once — those show a little badge with the count.</p>
        </div>
      </section>

      <section className="stats">
        <div className="stat-card gold">
          <div className="big">12 <span className="sub">of 50</span></div>
          <div className="label">States Visited</div>
        </div>
        <div className="stat-card">
          <div className="big">38</div>
          <div className="label">States To Go</div>
        </div>
        <div className="stat-card gold">
          <div className="big">4 <span className="sub">of ~195</span></div>
          <div className="label">Countries Visited</div>
        </div>
        <div className="stat-card">
          <div className="big">~191</div>
          <div className="label">Countries To Go</div>
        </div>
      </section>

      <section className="mapsection">
        <div className="wrap">
          <div className="mapcard">
            <svg viewBox="0 0 756 440" width="100%" style={{ maxWidth: '820px' }}>
      <g transform="translate(0,0)">
      <rect width="58" height="50" rx="7" fill="#241D14" stroke="var(--line)" strokeWidth="1.5"/>
      <text x="29.0" y="30.0" textAnchor="middle" className="tile-abbr-un">AK</text>
      </g>
      <g transform="translate(693,0)">
      <rect width="58" height="50" rx="7" fill="var(--gold)" stroke="var(--dark)" strokeWidth="1.5"/>
      <text x="29.0" y="20" textAnchor="middle" className="tile-abbr">ME</text>
      <text x="29.0" y="38" textAnchor="middle" className="tile-duck">🦆</text>
      </g>
      <g transform="translate(567,55)">
      <rect width="58" height="50" rx="7" fill="#241D14" stroke="var(--line)" strokeWidth="1.5"/>
      <text x="29.0" y="30.0" textAnchor="middle" className="tile-abbr-un">VT</text>
      </g>
      <g transform="translate(630,55)">
      <rect width="58" height="50" rx="7" fill="var(--gold)" stroke="var(--dark)" strokeWidth="1.5"/>
      <text x="29.0" y="20" textAnchor="middle" className="tile-abbr">NH</text>
      <text x="29.0" y="38" textAnchor="middle" className="tile-duck">🦆</text>
      </g>
      <g transform="translate(693,55)">
      <rect width="58" height="50" rx="7" fill="#241D14" stroke="var(--line)" strokeWidth="1.5"/>
      <text x="29.0" y="30.0" textAnchor="middle" className="tile-abbr-un">MA</text>
      </g>
      <g transform="translate(63,110)">
      <rect width="58" height="50" rx="7" fill="#241D14" stroke="var(--line)" strokeWidth="1.5"/>
      <text x="29.0" y="30.0" textAnchor="middle" className="tile-abbr-un">WA</text>
      </g>
      <g transform="translate(126,110)">
      <rect width="58" height="50" rx="7" fill="#241D14" stroke="var(--line)" strokeWidth="1.5"/>
      <text x="29.0" y="30.0" textAnchor="middle" className="tile-abbr-un">MT</text>
      </g>
      <g transform="translate(189,110)">
      <rect width="58" height="50" rx="7" fill="#241D14" stroke="var(--line)" strokeWidth="1.5"/>
      <text x="29.0" y="30.0" textAnchor="middle" className="tile-abbr-un">ND</text>
      </g>
      <g transform="translate(252,110)">
      <rect width="58" height="50" rx="7" fill="#241D14" stroke="var(--line)" strokeWidth="1.5"/>
      <text x="29.0" y="30.0" textAnchor="middle" className="tile-abbr-un">SD</text>
      </g>
      <g transform="translate(315,110)">
      <rect width="58" height="50" rx="7" fill="#241D14" stroke="var(--line)" strokeWidth="1.5"/>
      <text x="29.0" y="30.0" textAnchor="middle" className="tile-abbr-un">MN</text>
      </g>
      <g transform="translate(378,110)">
      <rect width="58" height="50" rx="7" fill="#241D14" stroke="var(--line)" strokeWidth="1.5"/>
      <text x="29.0" y="30.0" textAnchor="middle" className="tile-abbr-un">WI</text>
      </g>
      <g transform="translate(441,110)">
      <rect width="58" height="50" rx="7" fill="#241D14" stroke="var(--line)" strokeWidth="1.5"/>
      <text x="29.0" y="30.0" textAnchor="middle" className="tile-abbr-un">MI</text>
      </g>
      <g transform="translate(567,110)">
      <rect width="58" height="50" rx="7" fill="var(--gold)" stroke="var(--dark)" strokeWidth="1.5"/>
      <text x="29.0" y="20" textAnchor="middle" className="tile-abbr">NY</text>
      <text x="29.0" y="38" textAnchor="middle" className="tile-duck">🦆</text>
      <circle cx="48" cy="10" r="9" fill="var(--maroon)"/>
      <text x="48" y="13.5" textAnchor="middle" className="tile-count">5</text>
      </g>
      <g transform="translate(630,110)">
      <rect width="58" height="50" rx="7" fill="#241D14" stroke="var(--line)" strokeWidth="1.5"/>
      <text x="29.0" y="30.0" textAnchor="middle" className="tile-abbr-un">CT</text>
      </g>
      <g transform="translate(693,110)">
      <rect width="58" height="50" rx="7" fill="#241D14" stroke="var(--line)" strokeWidth="1.5"/>
      <text x="29.0" y="30.0" textAnchor="middle" className="tile-abbr-un">RI</text>
      </g>
      <g transform="translate(63,165)">
      <rect width="58" height="50" rx="7" fill="#241D14" stroke="var(--line)" strokeWidth="1.5"/>
      <text x="29.0" y="30.0" textAnchor="middle" className="tile-abbr-un">OR</text>
      </g>
      <g transform="translate(126,165)">
      <rect width="58" height="50" rx="7" fill="#241D14" stroke="var(--line)" strokeWidth="1.5"/>
      <text x="29.0" y="30.0" textAnchor="middle" className="tile-abbr-un">ID</text>
      </g>
      <g transform="translate(189,165)">
      <rect width="58" height="50" rx="7" fill="#241D14" stroke="var(--line)" strokeWidth="1.5"/>
      <text x="29.0" y="30.0" textAnchor="middle" className="tile-abbr-un">WY</text>
      </g>
      <g transform="translate(252,165)">
      <rect width="58" height="50" rx="7" fill="#241D14" stroke="var(--line)" strokeWidth="1.5"/>
      <text x="29.0" y="30.0" textAnchor="middle" className="tile-abbr-un">NE</text>
      </g>
      <g transform="translate(315,165)">
      <rect width="58" height="50" rx="7" fill="#241D14" stroke="var(--line)" strokeWidth="1.5"/>
      <text x="29.0" y="30.0" textAnchor="middle" className="tile-abbr-un">IA</text>
      </g>
      <g transform="translate(378,165)">
      <rect width="58" height="50" rx="7" fill="var(--gold)" stroke="var(--dark)" strokeWidth="1.5"/>
      <text x="29.0" y="20" textAnchor="middle" className="tile-abbr">IL</text>
      <text x="29.0" y="38" textAnchor="middle" className="tile-duck">🦆</text>
      <circle cx="48" cy="10" r="9" fill="var(--maroon)"/>
      <text x="48" y="13.5" textAnchor="middle" className="tile-count">3</text>
      </g>
      <g transform="translate(441,165)">
      <rect width="58" height="50" rx="7" fill="#241D14" stroke="var(--line)" strokeWidth="1.5"/>
      <text x="29.0" y="30.0" textAnchor="middle" className="tile-abbr-un">IN</text>
      </g>
      <g transform="translate(504,165)">
      <rect width="58" height="50" rx="7" fill="#241D14" stroke="var(--line)" strokeWidth="1.5"/>
      <text x="29.0" y="30.0" textAnchor="middle" className="tile-abbr-un">OH</text>
      </g>
      <g transform="translate(567,165)">
      <rect width="58" height="50" rx="7" fill="var(--gold)" stroke="var(--dark)" strokeWidth="1.5"/>
      <text x="29.0" y="20" textAnchor="middle" className="tile-abbr">PA</text>
      <text x="29.0" y="38" textAnchor="middle" className="tile-duck">🦆</text>
      <circle cx="48" cy="10" r="9" fill="var(--maroon)"/>
      <text x="48" y="13.5" textAnchor="middle" className="tile-count">5</text>
      </g>
      <g transform="translate(630,165)">
      <rect width="58" height="50" rx="7" fill="var(--gold)" stroke="var(--dark)" strokeWidth="1.5"/>
      <text x="29.0" y="20" textAnchor="middle" className="tile-abbr">NJ</text>
      <text x="29.0" y="38" textAnchor="middle" className="tile-duck">🦆</text>
      </g>
      <g transform="translate(0,220)">
      <rect width="58" height="50" rx="7" fill="#241D14" stroke="var(--line)" strokeWidth="1.5"/>
      <text x="29.0" y="30.0" textAnchor="middle" className="tile-abbr-un">CA</text>
      </g>
      <g transform="translate(63,220)">
      <rect width="58" height="50" rx="7" fill="#241D14" stroke="var(--line)" strokeWidth="1.5"/>
      <text x="29.0" y="30.0" textAnchor="middle" className="tile-abbr-un">NV</text>
      </g>
      <g transform="translate(126,220)">
      <rect width="58" height="50" rx="7" fill="#241D14" stroke="var(--line)" strokeWidth="1.5"/>
      <text x="29.0" y="30.0" textAnchor="middle" className="tile-abbr-un">UT</text>
      </g>
      <g transform="translate(189,220)">
      <rect width="58" height="50" rx="7" fill="#241D14" stroke="var(--line)" strokeWidth="1.5"/>
      <text x="29.0" y="30.0" textAnchor="middle" className="tile-abbr-un">CO</text>
      </g>
      <g transform="translate(252,220)">
      <rect width="58" height="50" rx="7" fill="#241D14" stroke="var(--line)" strokeWidth="1.5"/>
      <text x="29.0" y="30.0" textAnchor="middle" className="tile-abbr-un">KS</text>
      </g>
      <g transform="translate(315,220)">
      <rect width="58" height="50" rx="7" fill="#241D14" stroke="var(--line)" strokeWidth="1.5"/>
      <text x="29.0" y="30.0" textAnchor="middle" className="tile-abbr-un">MO</text>
      </g>
      <g transform="translate(378,220)">
      <rect width="58" height="50" rx="7" fill="#241D14" stroke="var(--line)" strokeWidth="1.5"/>
      <text x="29.0" y="30.0" textAnchor="middle" className="tile-abbr-un">KY</text>
      </g>
      <g transform="translate(441,220)">
      <rect width="58" height="50" rx="7" fill="var(--gold)" stroke="var(--dark)" strokeWidth="1.5"/>
      <text x="29.0" y="20" textAnchor="middle" className="tile-abbr">WV</text>
      <text x="29.0" y="38" textAnchor="middle" className="tile-duck">🦆</text>
      </g>
      <g transform="translate(504,220)">
      <rect width="58" height="50" rx="7" fill="#241D14" stroke="var(--line)" strokeWidth="1.5"/>
      <text x="29.0" y="30.0" textAnchor="middle" className="tile-abbr-un">DC</text>
      </g>
      <g transform="translate(567,220)">
      <rect width="58" height="50" rx="7" fill="var(--gold)" stroke="var(--dark)" strokeWidth="1.5"/>
      <text x="29.0" y="20" textAnchor="middle" className="tile-abbr">MD</text>
      <text x="29.0" y="38" textAnchor="middle" className="tile-duck">🦆</text>
      </g>
      <g transform="translate(630,220)">
      <rect width="58" height="50" rx="7" fill="#241D14" stroke="var(--line)" strokeWidth="1.5"/>
      <text x="29.0" y="30.0" textAnchor="middle" className="tile-abbr-un">DE</text>
      </g>
      <g transform="translate(126,275)">
      <rect width="58" height="50" rx="7" fill="#241D14" stroke="var(--line)" strokeWidth="1.5"/>
      <text x="29.0" y="30.0" textAnchor="middle" className="tile-abbr-un">AZ</text>
      </g>
      <g transform="translate(189,275)">
      <rect width="58" height="50" rx="7" fill="#241D14" stroke="var(--line)" strokeWidth="1.5"/>
      <text x="29.0" y="30.0" textAnchor="middle" className="tile-abbr-un">NM</text>
      </g>
      <g transform="translate(252,275)">
      <rect width="58" height="50" rx="7" fill="#241D14" stroke="var(--line)" strokeWidth="1.5"/>
      <text x="29.0" y="30.0" textAnchor="middle" className="tile-abbr-un">OK</text>
      </g>
      <g transform="translate(315,275)">
      <rect width="58" height="50" rx="7" fill="#241D14" stroke="var(--line)" strokeWidth="1.5"/>
      <text x="29.0" y="30.0" textAnchor="middle" className="tile-abbr-un">AR</text>
      </g>
      <g transform="translate(378,275)">
      <rect width="58" height="50" rx="7" fill="var(--gold)" stroke="var(--dark)" strokeWidth="1.5"/>
      <text x="29.0" y="20" textAnchor="middle" className="tile-abbr">TN</text>
      <text x="29.0" y="38" textAnchor="middle" className="tile-duck">🦆</text>
      <circle cx="48" cy="10" r="9" fill="var(--maroon)"/>
      <text x="48" y="13.5" textAnchor="middle" className="tile-count">3</text>
      </g>
      <g transform="translate(441,275)">
      <rect width="58" height="50" rx="7" fill="var(--gold)" stroke="var(--dark)" strokeWidth="1.5"/>
      <text x="29.0" y="20" textAnchor="middle" className="tile-abbr">VA</text>
      <text x="29.0" y="38" textAnchor="middle" className="tile-duck">🦆</text>
      <circle cx="48" cy="10" r="9" fill="var(--maroon)"/>
      <text x="48" y="13.5" textAnchor="middle" className="tile-count">2</text>
      </g>
      <g transform="translate(504,275)">
      <rect width="58" height="50" rx="7" fill="var(--gold)" stroke="var(--dark)" strokeWidth="1.5"/>
      <text x="29.0" y="20" textAnchor="middle" className="tile-abbr">NC</text>
      <text x="29.0" y="38" textAnchor="middle" className="tile-duck">🦆</text>
      </g>
      <g transform="translate(189,330)">
      <rect width="58" height="50" rx="7" fill="#241D14" stroke="var(--line)" strokeWidth="1.5"/>
      <text x="29.0" y="30.0" textAnchor="middle" className="tile-abbr-un">TX</text>
      </g>
      <g transform="translate(252,330)">
      <rect width="58" height="50" rx="7" fill="#241D14" stroke="var(--line)" strokeWidth="1.5"/>
      <text x="29.0" y="30.0" textAnchor="middle" className="tile-abbr-un">LA</text>
      </g>
      <g transform="translate(315,330)">
      <rect width="58" height="50" rx="7" fill="#241D14" stroke="var(--line)" strokeWidth="1.5"/>
      <text x="29.0" y="30.0" textAnchor="middle" className="tile-abbr-un">MS</text>
      </g>
      <g transform="translate(378,330)">
      <rect width="58" height="50" rx="7" fill="#241D14" stroke="var(--line)" strokeWidth="1.5"/>
      <text x="29.0" y="30.0" textAnchor="middle" className="tile-abbr-un">AL</text>
      </g>
      <g transform="translate(441,330)">
      <rect width="58" height="50" rx="7" fill="#241D14" stroke="var(--line)" strokeWidth="1.5"/>
      <text x="29.0" y="30.0" textAnchor="middle" className="tile-abbr-un">GA</text>
      </g>
      <g transform="translate(504,330)">
      <rect width="58" height="50" rx="7" fill="#241D14" stroke="var(--line)" strokeWidth="1.5"/>
      <text x="29.0" y="30.0" textAnchor="middle" className="tile-abbr-un">SC</text>
      </g>
      <g transform="translate(0,385)">
      <rect width="58" height="50" rx="7" fill="#241D14" stroke="var(--line)" strokeWidth="1.5"/>
      <text x="29.0" y="30.0" textAnchor="middle" className="tile-abbr-un">HI</text>
      </g>
      <g transform="translate(441,385)">
      <rect width="58" height="50" rx="7" fill="var(--gold)" stroke="var(--dark)" strokeWidth="1.5"/>
      <text x="29.0" y="20" textAnchor="middle" className="tile-abbr">FL</text>
      <text x="29.0" y="38" textAnchor="middle" className="tile-duck">🦆</text>
      <circle cx="48" cy="10" r="9" fill="var(--maroon)"/>
      <text x="48" y="13.5" textAnchor="middle" className="tile-count">16</text>
      </g>
            </svg>
            <div className="maplegend">
              <div><span className="swatch gold"></span> Visited — duck spotted here</div>
              <div><span className="swatch white"></span> Not yet — waiting on you</div>
            </div>
          </div>
          <div className="note">
            Note: this is a mock-up map (a "tile grid" layout, not literal geography) to show how visited-vs-not works. The real site will use an actual interactive map with true coordinates, so pins land on the exact city, not just the state.
          </div>
        </div>
      </section>

      <section className="intl">
        <div className="wrap">
          <h2 className="section-title">International Sightings</h2>
          <div className="countrygrid">
            <div className="countrychip">
              <div className="flag">🇺🇸</div>
              <div className="cname">United States</div>
              <div className="ccount">11 states, 30+ sightings</div>
            </div>
            <div className="countrychip">
              <div className="flag">🇸🇰</div>
              <div className="cname">Slovakia</div>
              <div className="ccount">1 sighting</div>
            </div>
            <div className="countrychip">
              <div className="flag">🇬🇧</div>
              <div className="cname">United Kingdom</div>
              <div className="ccount">Belfast — 1 sighting</div>
            </div>
            <div className="countrychip">
              <div className="flag">🇮🇪</div>
              <div className="cname">Ireland</div>
              <div className="ccount">Dublin — 2 sightings</div>
            </div>
          </div>
        </div>
      </section>

      <footer>
        <div className="fine">The Shady Duck · theshadyduck.com</div>
      </footer>
      
    </>
  );
}
