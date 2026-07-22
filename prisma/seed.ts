import { PrismaClient, type Prisma } from "@prisma/client";

const prisma = new PrismaClient();

function photos(seed: string, count: number): string[] {
  return Array.from(
    { length: count },
    (_, i) => `https://picsum.photos/seed/${seed}-${i}/800/600`
  );
}

// Placeholder/fixture data only - not a real listings import, per
// ROADMAP.md Phase 0 decision #3 and SCHEMA.md §5. Prices are in INR
// paise (see SCHEMA.md §3) and kept well under Postgres Int4's ~2.14bn
// ceiling (~INR 2.14cr). Locations are real Surat-area neighborhoods;
// roughly a third are left ungeocoded (latitude/longitude null) to
// exercise the map view's "not yet geocoded" case per SCHEMA.md §3.
const properties: Prisma.PropertyCreateManyInput[] = [
  {
    title: "2BHK Apartment in Adajan",
    description:
      "Bright and airy 2BHK in a well-maintained society close to Adajan's main market and schools.",
    price: 4_500_000_00,
    type: "apartment",
    bedrooms: 2,
    bathrooms: 2,
    area: 1050,
    location: "Adajan, Surat",
    latitude: 21.1953,
    longitude: 72.7871,
    amenities: ["Parking", "Lift", "Power Backup", "Security"],
    photos: photos("adajan-2bhk", 3),
    status: "published",
  },
  {
    title: "4BHK Villa in Vesu",
    description:
      "Spacious independent villa with private garden and covered parking for two cars.",
    price: 1_75_00_000_00,
    type: "villa",
    bedrooms: 4,
    bathrooms: 4,
    area: 3200,
    location: "Vesu, Surat",
    latitude: 21.1349,
    longitude: 72.7797,
    amenities: ["Parking", "Garden", "Security", "Power Backup", "Clubhouse"],
    photos: photos("vesu-villa", 4),
    status: "published",
  },
  {
    title: "1BHK Apartment in Piplod",
    description:
      "Compact 1BHK ideal for a small family or working professional, walking distance to VR Mall.",
    price: 2_800_000_00,
    type: "apartment",
    bedrooms: 1,
    bathrooms: 1,
    area: 550,
    location: "Piplod, Surat",
    latitude: null,
    longitude: null,
    amenities: ["Lift", "Security"],
    photos: photos("piplod-1bhk", 3),
    status: "draft",
  },
  {
    title: "3BHK Independent House in City Light",
    description:
      "Well-ventilated independent house on a quiet street in City Light, close to restaurants and cafes.",
    price: 9_500_000_00,
    type: "house",
    bedrooms: 3,
    bathrooms: 3,
    area: 1800,
    location: "City Light, Surat",
    latitude: 21.1667,
    longitude: 72.75,
    amenities: ["Parking", "Power Backup"],
    photos: photos("city-light-house", 3),
    status: "published",
  },
  {
    title: "2BHK Apartment in Athwa",
    description:
      "Modern 2BHK in a gated society, close to Athwa Gate and the riverfront.",
    price: 5_200_000_00,
    type: "apartment",
    bedrooms: 2,
    bathrooms: 2,
    area: 1100,
    location: "Athwa, Surat",
    latitude: null,
    longitude: null,
    amenities: ["Parking", "Lift", "Gym", "Security"],
    photos: photos("athwa-2bhk", 3),
    status: "published",
  },
  {
    title: "3BHK House in Katargam",
    description:
      "Family home with a small courtyard, close to Katargam's textile market.",
    price: 6_800_000_00,
    type: "house",
    bedrooms: 3,
    bathrooms: 2,
    area: 1600,
    location: "Katargam, Surat",
    latitude: 21.2167,
    longitude: 72.8333,
    amenities: ["Parking", "Power Backup"],
    photos: photos("katargam-house", 3),
    status: "draft",
  },
  {
    title: "2BHK Apartment in Varachha",
    description:
      "Affordable 2BHK close to Varachha's diamond market, ideal for first-time buyers.",
    price: 3_900_000_00,
    type: "apartment",
    bedrooms: 2,
    bathrooms: 2,
    area: 950,
    location: "Varachha, Surat",
    latitude: 21.2167,
    longitude: 72.85,
    amenities: ["Lift", "Parking", "Security"],
    photos: photos("varachha-2bhk", 3),
    status: "published",
  },
  {
    title: "5BHK Villa in Rander",
    description:
      "Premium riverside villa with a private garden, ideal for large families.",
    price: 1_65_00_000_00,
    type: "villa",
    bedrooms: 5,
    bathrooms: 5,
    area: 3800,
    location: "Rander, Surat",
    latitude: null,
    longitude: null,
    amenities: ["Parking", "Garden", "Swimming Pool", "Security", "Clubhouse"],
    photos: photos("rander-villa", 4),
    status: "draft",
  },
  {
    title: "3BHK Apartment in Adajan",
    description:
      "Corner-unit 3BHK with extra ventilation, close to Adajan Gam bus stand.",
    price: 6_200_000_00,
    type: "apartment",
    bedrooms: 3,
    bathrooms: 3,
    area: 1350,
    location: "Adajan, Surat",
    latitude: 21.1953,
    longitude: 72.7871,
    amenities: ["Parking", "Lift", "Power Backup", "Gym"],
    photos: photos("adajan-3bhk", 3),
    status: "published",
  },
  {
    title: "1BHK Apartment in Vesu",
    description:
      "Cozy 1BHK in a high-rise tower near VNSGU, popular with students and young professionals.",
    price: 3_200_000_00,
    type: "apartment",
    bedrooms: 1,
    bathrooms: 1,
    area: 620,
    location: "Vesu, Surat",
    latitude: null,
    longitude: null,
    amenities: ["Lift", "Security", "Gym"],
    photos: photos("vesu-1bhk", 3),
    status: "published",
  },
  {
    title: "4BHK Villa in Piplod",
    description:
      "Elegant villa close to Piplod's main road, with dedicated staff quarters.",
    price: 1_45_00_000_00,
    type: "villa",
    bedrooms: 4,
    bathrooms: 4,
    area: 2900,
    location: "Piplod, Surat",
    latitude: 21.1667,
    longitude: 72.7833,
    amenities: ["Parking", "Garden", "Power Backup", "Security"],
    photos: photos("piplod-villa", 4),
    status: "published",
  },
  {
    title: "2BHK Apartment in City Light",
    description: "Newly built 2BHK, still finalizing photos before publishing.",
    price: 5_800_000_00,
    type: "apartment",
    bedrooms: 2,
    bathrooms: 2,
    area: 1080,
    location: "City Light, Surat",
    latitude: 21.1667,
    longitude: 72.75,
    amenities: ["Parking", "Lift"],
    photos: photos("city-light-2bhk", 2),
    status: "draft",
  },
  {
    title: "3BHK House in Athwa",
    description:
      "Traditional house with a modern renovation, close to Athwa Lines market.",
    price: 8_400_000_00,
    type: "house",
    bedrooms: 3,
    bathrooms: 3,
    area: 1750,
    location: "Athwa, Surat",
    latitude: null,
    longitude: null,
    amenities: ["Parking", "Power Backup", "Security"],
    photos: photos("athwa-house", 3),
    status: "published",
  },
  {
    title: "2BHK Apartment in Katargam",
    description:
      "Well-priced 2BHK close to Katargam Darwaja, good rental yield in the area.",
    price: 3_600_000_00,
    type: "apartment",
    bedrooms: 2,
    bathrooms: 2,
    area: 980,
    location: "Katargam, Surat",
    latitude: 21.2167,
    longitude: 72.8333,
    amenities: ["Lift", "Parking", "Security"],
    photos: photos("katargam-2bhk", 3),
    status: "published",
  },
];

async function main() {
  await prisma.property.deleteMany({});
  const { count } = await prisma.property.createMany({ data: properties });
  console.log(`Seeded ${count} properties.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });
