import GrowForm from "@/components/GrowForm";
import Navbar from "@/components/Navbar";

export default function HelpUsGrowPage() {
  return (
    <>
      <Navbar currentLink="grow" />
      <section className="pagehead">
        <div className="wrap">
          <p className="eyebrow">Spread the duck</p>
          <h1 className="headline">Help Us Grow</h1>
          <p>
            Fill this out and we&apos;ll send you 5 Shady Ducks to place where others will find
            them!
          </p>
        </div>
      </section>
      <section className="upload-section">
        <div className="wrap">
          <GrowForm />
        </div>
      </section>
      <footer>
        <div className="fine">The Shady Duck · theshadyduck.com</div>
      </footer>
    </>
  );
}
