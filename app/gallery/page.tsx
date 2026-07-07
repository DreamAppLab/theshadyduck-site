import Link from "next/link";
import Navbar from "@/components/Navbar";
import {
  formatLocationDisplay,
  formatSightingAlt,
  formatSightingDate,
  formatSubmitterName,
} from "@/lib/format-sighting";
import { getGallerySightings } from "@/lib/sightings";

export const dynamic = "force-dynamic";

export default async function GalleryPage() {
  const sightings = await getGallerySightings();

  return (
    <>
      <Navbar />
      <div className="page-gallery">
        <section className="pagehead">
          <div className="wrap">
            <p className="eyebrow">The full archive</p>
            <h1 className="headline">All Sightings</h1>
            <p>
              Every sighting that&apos;s aged out of the homepage lands here — nothing gets lost,
              it just moves down the line as newer ones come in.
            </p>
          </div>
        </section>

        <section className="gallerywrap">
          <div className="wrap">
            {sightings.length > 0 ? (
              <div className="ggrid">
                {sightings.map((sighting) => (
                  <div className="gcard" key={sighting.id}>
                    <img src={sighting.photoUrl} alt={formatSightingAlt(sighting)} />
                    <div className="cap">
                      <div className="who">{formatSubmitterName(sighting.name)}</div>
                      <div className="where">{formatLocationDisplay(sighting)}</div>
                      <div className="when">{formatSightingDate(sighting.createdAt)}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>
                  No archive sightings yet — once more than 13 are approved, older ones will show up
                  here automatically.
                </p>
                <div className="btnrow">
                  <Link className="btn primary" href="/upload">
                    Send Us Your Sighting
                  </Link>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
