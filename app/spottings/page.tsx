import Navbar from "@/components/Navbar";
import SpottingsMaps from "@/components/SpottingsMaps";
import { getAllApprovedSightings } from "@/lib/sightings";

export const revalidate = 60;

export default async function SpottingsPage() {
  const sightings = await getAllApprovedSightings();


  return (
    <>
      <Navbar currentLink="spottings" />

      <section className="pagehead">
        <div className="wrap">
          <p className="eyebrow">Where&apos;s the duck been</p>
          <h1 className="headline">The Duck&apos;s Travel Map</h1>
          <p>
            Every sighting drops a duck on the map. Some spots have seen the Shady Duck more than
            once — those show a little badge with the count.
          </p>
        </div>
      </section>

      <SpottingsMaps sightings={sightings} />

      <footer>
        <div className="fine">The Shady Duck · theshadyduck.com</div>
      </footer>
    </>
  );
}
