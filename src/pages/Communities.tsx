import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { MapPin, Phone, ExternalLink } from "lucide-react";

import imgBienville from "@/assets/community-bienville.jpg";
import imgColumbia from "@/assets/community-columbia.jpg";
import imgHeritage from "@/assets/community-heritage.jpg";
import imgEstates from "@/assets/community-estates.jpg";
import imgGuste from "@/assets/community-guste.jpg";
import imgHarmony from "@/assets/community-harmony.jpg";
import imgLafitte from "@/assets/community-lafitte.jpg";
import imgLafitteSenior from "@/assets/community-lafitte-senior.jpg";
import imgMarrero from "@/assets/community-marrero.jpg";
import imgFlorida from "@/assets/community-florida.jpg";
import imgRiverGarden from "@/assets/community-rivergarden.jpg";
import imgFischer from "@/assets/community-fischer.jpg";

const communities = [
  {
    name: "Bienville Basin",
    image: imgBienville,
    address: "401 Treme Street, New Orleans, LA 70112",
    phone: "(504) 522-9078",
    website: "http://www.bienvillebasinapartments.com/",
    summary:
      "Located in the historic Tremé neighborhood, Bienville Basin offers modern mixed-income housing in one of America's oldest African-American communities. The development blends contemporary living with the rich cultural heritage of the surrounding area.",
  },
  {
    name: "Columbia Parc",
    image: imgColumbia,
    address: "1400 Milton Street, New Orleans, LA 70122",
    phone: "(504) 284-4769",
    website: "https://www.columbiares.com/apartments-in-new-orleans/columbia-parc-at-the-bayou-district/",
    summary:
      "Columbia Parc at the Bayou District is a vibrant mixed-income community featuring townhomes and apartments surrounded by green spaces. The community includes a children's play area, community center, and easy access to local schools and parks.",
  },
  {
    name: "Heritage Senior",
    image: imgHeritage,
    address: "1401 Caton Street, New Orleans, LA 70122",
    phone: "(504) 282-0082",
    website: "https://www.columbiares.com/senior-apartments-in-new-orleans/heritage-senior-residences-at-columbia-parc/",
    summary:
      "Heritage Senior Residences provides quality housing specifically designed for seniors within the Columbia Parc at the Bayou District. The community offers accessible one- and two-bedroom apartments with supportive services and a welcoming courtyard.",
  },
  {
    name: "The Estates",
    image: imgEstates,
    address: "3450 Betty Parker Pl, New Orleans, LA 70126",
    phone: "(504) 940-3060",
    website: "http://www.liveatsavoyplace.com/",
    summary:
      "The Estates, also known as Savoy Place, is a modern mixed-income community in New Orleans East. Featuring resort-style amenities including a pool, fitness center, and clubhouse, this development offers spacious apartments and townhomes for families of all sizes.",
  },
  {
    name: "Guste Homes",
    image: imgGuste,
    address: "1301 Simon Bolivar Avenue, New Orleans, LA 70113",
    phone: "(504) 529-3392",
    summary:
      "Guste Homes is one of HANO's most recognizable communities, featuring a distinctive high-rise tower alongside low-rise family units in the Central City neighborhood. The community provides affordable housing with on-site management and community services.",
  },
  {
    name: "Harmony Oaks",
    image: imgHarmony,
    address: "3320 Clara Street, New Orleans, LA 70113",
    phone: "(504) 894-8828",
    website: "http://www.harmonyoaksapts.com/",
    summary:
      "Harmony Oaks is a beautifully redeveloped mixed-income community in Central City, built on the former C.J. Peete public housing site. The tree-lined streets feature shotgun-style homes with front porches that foster a strong sense of neighborhood and community.",
  },
  {
    name: "Faubourg Lafitte",
    image: imgLafitte,
    address: "2200 Lafitte Street, New Orleans, LA 70119",
    phone: "(504) 821-6687",
    website: "https://www.faubourglafitteapts.com/",
    summary:
      "Faubourg Lafitte is a mixed-income community in the historic Tremé/Lafitte neighborhood. Redeveloped through the HUD HOPE VI program, it features colorful homes reflecting New Orleans' architectural traditions, with a community center and green spaces.",
  },
  {
    name: "Lafitte Senior",
    image: imgLafitteSenior,
    address: "700 N. Galvez Street, New Orleans, LA 70119",
    phone: "(504) 518-4799",
    website: "https://www.faubourglafitteapts.com/",
    summary:
      "Lafitte Senior provides dedicated housing for elderly residents in the Tremé/Lafitte neighborhood. The multi-story building features accessible apartments, a landscaped courtyard, and on-site supportive services for independent senior living.",
  },
  {
    name: "Marrero Commons",
    image: imgMarrero,
    address: "1100 S. Tonti Street, New Orleans, LA 70125",
    phone: "(504) 524-9011",
    website: "http://www.marrerocommons.com/",
    summary:
      "Marrero Commons is a mixed-income community in the Central City neighborhood, developed on the former B.W. Cooper public housing site. The community features renovated townhomes with covered porches beneath mature oak trees, creating a charming residential atmosphere.",
  },
  {
    name: "New Florida",
    image: imgFlorida,
    address: "2521 Independence Street, New Orleans, LA 70117",
    phone: "(504) 558-4664",
    summary:
      "Originally constructed in 1946, the New Florida Development underwent a major redevelopment completed in 2017. This revitalization resulted in 52 modern housing units designed to create a comfortable and sustainable living environment for residents in the Upper Ninth Ward.",
  },
  {
    name: "River Garden",
    image: imgRiverGarden,
    address: "913 Felicity Street, New Orleans, LA 70130",
    phone: "(504) 412-8219",
    website: "http://www.rivergardenneworleans.com/",
    summary:
      "River Garden is a mixed-income community in the Lower Garden District, built on the former St. Thomas public housing site. The elegant development features apartments and townhomes with classic New Orleans architectural details, wrought iron gates, and lush landscaping.",
  },
  {
    name: "William J. Fischer",
    image: imgFischer,
    address: "1915 L.B. Landry Avenue, New Orleans, LA 70114",
    phone: "(504) 266-2503",
    summary:
      "Originally built in 1964, the William J. Fischer community underwent a transformative redevelopment as part of the HUD HOPE VI initiative, completed in 2008. Now featuring 326 modern units with Energy Star-rated homes, a Senior Village, community center, and walking paths.",
  },
];

const Communities = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Header */}
        <section className="bg-primary text-primary-foreground py-16">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl sm:text-4xl font-serif font-bold mb-3">HANO Communities</h1>
            <p className="text-primary-foreground/85 max-w-2xl text-base sm:text-lg leading-relaxed">
              The Housing Authority of New Orleans provides housing opportunities in safe, sustainable, pedestrian-oriented communities across the city. Explore our mixed-income neighborhoods below.
            </p>
          </div>
        </section>

        {/* Communities grid */}
        <section className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {communities.map((c) => (
              <article
                key={c.name}
                className="bg-card rounded-lg border overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={c.image}
                    alt={`${c.name} community in New Orleans`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="p-5">
                  <h2 className="font-serif font-bold text-foreground text-xl mb-2">{c.name}</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">{c.summary}</p>
                  <div className="space-y-1.5 text-sm">
                    <p className="flex items-start gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <span>{c.address}</span>
                    </p>
                    <p className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-4 w-4 text-primary shrink-0" />
                      <a href={`tel:${c.phone.replace(/[^\d]/g, "")}`} className="hover:text-foreground transition-colors">
                        {c.phone}
                      </a>
                    </p>
                    {c.website && (
                      <p className="flex items-center gap-2 text-muted-foreground">
                        <ExternalLink className="h-4 w-4 text-primary shrink-0" />
                        <a
                          href={c.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-foreground transition-colors truncate"
                        >
                          Visit Website
                        </a>
                      </p>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Communities;
