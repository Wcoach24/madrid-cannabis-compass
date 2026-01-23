export type FeaturedClubSeed = {
  slug: string;
  name: string;
  district: string;
  rating_editorial: number;
  is_tourist_friendly: boolean;
  main_image_url: string;
  timetable: {
    monday?: { open: string; close: string; closed?: boolean };
    tuesday?: { open: string; close: string; closed?: boolean };
    wednesday?: { open: string; close: string; closed?: boolean };
    thursday?: { open: string; close: string; closed?: boolean };
    friday?: { open: string; close: string; closed?: boolean };
    saturday?: { open: string; close: string; closed?: boolean };
    sunday?: { open: string; close: string; closed?: boolean };
  } | null;
};

export const FEATURED_CLUBS_SEED: FeaturedClubSeed[] = [
  {
    slug: "vallehermoso-club-social-madrid",
    name: "Vallehermoso Club Social Madrid",
    district: "Chamberí",
    rating_editorial: 4.8,
    is_tourist_friendly: true,
    main_image_url: "/images/clubs/club-vallehermoso-v2.webp",
    timetable: {
      monday: { open: "11:00", close: "23:00", closed: false },
      tuesday: { open: "11:00", close: "23:00", closed: false },
      wednesday: { open: "11:00", close: "23:00", closed: false },
      thursday: { open: "11:00", close: "23:00", closed: false },
      friday: { open: "11:00", close: "01:00", closed: false },
      saturday: { open: "11:00", close: "01:00", closed: false },
      sunday: { open: "11:00", close: "01:00", closed: false }
    }
  },
  {
    slug: "meltz-club-social-madrid",
    name: "Meltz Club Social Madrid",
    district: "Fuencarral-El Pardo",
    rating_editorial: 4.2,
    is_tourist_friendly: true,
    main_image_url: "/images/clubs/meltz/meltz-featured.webp",
    timetable: {
      monday: { open: "10:00", close: "22:00" },
      tuesday: { open: "10:00", close: "22:00" },
      wednesday: { open: "10:00", close: "22:00" },
      thursday: { open: "11:00", close: "23:00" },
      friday: { open: "11:00", close: "23:00" },
      saturday: { open: "11:00", close: "23:00" },
      sunday: { open: "10:00", close: "22:00" }
    }
  }
];
