import Navbar from "@/components/Navbar";
import UploadForm from "@/components/UploadForm";

export default function UploadPage() {
  return (
    <>
      <Navbar currentLink="upload" />
      <section className="pagehead">
        <div className="wrap">
          <p className="eyebrow">Share your sighting</p>
          <h1 className="headline">Upload a Photo</h1>
          <p>
            Found the Shady Duck? Send us your photo and where you spotted it. We review every
            submission before it goes live.
          </p>
        </div>
      </section>
      <section className="upload-section">
        <div className="wrap">
          <UploadForm />
        </div>
      </section>
      <footer>
        <div className="fine">The Shady Duck · theshadyduck.com</div>
      </footer>
    </>
  );
}
