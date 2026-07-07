import Link from "next/link";
import Navbar from "@/components/Navbar";
import {
  formatHeroCaption,
  formatLocationDisplay,
  formatSightingAlt,
  formatSightingDate,
  formatSubmitterName,
} from "@/lib/format-sighting";
import { LOGO_SRC } from "@/lib/logo";
import { getHomepageSightings } from "@/lib/sightings";

export const revalidate = 60;

export default async function HomePage() {
  const sightings = await getHomepageSightings();
  const hero = sightings[0] ?? null;
  const recent = sightings.slice(1);

  return (
    <>
      <Navbar currentLink="home" />
      <section className="hero">
        <div className="wrap hero-top">
          <div>
            <p className="eyebrow">Just spotted</p>
            <h1 className="headline">
              The Shady Duck
              <br />
              was found again.
            </h1>
            <p className="lede">
              Every time someone sends in a sighting, it lands right here automatically — no more
              waiting on us to update the gallery. This is where the newest one always shows up
              first.
            </p>
            <div className="btnrow">
              <Link className="btn primary" href="/upload">
                Send Us Your Sighting
              </Link>
              <a className="btn ghost" href="#recent">
                See Past Sightings
              </a>
            </div>
          </div>
          <div className="logo-big">
            <img src={LOGO_SRC} alt="The Shady Duck logo" />
          </div>
        </div>

        {hero ? (
          <div className="wrap feature-wrap">
            <div className="feature-photo">
              <div className="frame">
                <img src={hero.photoUrl} alt={formatSightingAlt(hero)} />
                <figcaption>{formatHeroCaption(hero)}</figcaption>
              </div>
              <div className="postmark">
                <div className="inner">
                  <div className="name">{formatSubmitterName(hero.name)}</div>
                  <div className="loc">{formatLocationDisplay(hero)}</div>
                  <div className="date">{formatSightingDate(hero.createdAt)}</div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="wrap empty-state">
            <p className="lede">
              No sightings yet — be the first to find the Shady Duck!
            </p>
            <div className="btnrow">
              <Link className="btn primary" href="/upload">
                Send Us Your Sighting
              </Link>
            </div>
          </div>
        )}
      </section>

      {recent.length > 0 ? (
        <section className="recent" id="recent">
          <div className="wrap">
            <div className="section-head">
              <h2 className="section-title">Recent Sightings</h2>
              <Link href="/gallery">View all spottings →</Link>
            </div>
            <div className="grid grid-12">
              {recent.map((sighting) => (
                <div className="card" key={sighting.id}>
                  <img src={sighting.photoUrl} alt={formatSightingAlt(sighting)} />
                  <div className="cap">
                    <div className="who">{formatSubmitterName(sighting.name)}</div>
                    <div className="where">{formatLocationDisplay(sighting)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="how" id="upload">
        <div className="wrap">
          <h2 className="section-title">Found the Shady Duck? Here&apos;s What Happens Next</h2>
          <div className="steps">
            <div className="step">
              <div className="num">01</div>
              <h3>Snap a photo</h3>
              <p>
                Found the Shady Duck out in the wild? Take a picture right where you found it.
              </p>
            </div>
            <div className="step">
              <div className="num">02</div>
              <h3>Tell us who and where</h3>
              <p>
                Upload it below with your name (or your crew&apos;s) and your location. Takes about
                a minute.
              </p>
            </div>
            <div className="step">
              <div className="num">03</div>
              <h3>See yourself right here</h3>
              <p>
                Your sighting becomes the featured photo at the top of this page, then moves into
                Recent Sightings as new ones come in.
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer>
        <img
          src={LOGO_SRC}
          alt="The Shady Duck logo"
          style={{ width: "70px", height: "auto", borderRadius: "6px" }}
        />
        <div className="fine">The Shady Duck · theshadyduck.com</div>
      </footer>
    </>
  );
}
