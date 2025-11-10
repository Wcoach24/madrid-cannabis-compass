import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if data already exists
    const { data: existingClubs } = await supabase.from('clubs').select('id').limit(1);
    
    if (existingClubs && existingClubs.length > 0) {
      return new Response(
        JSON.stringify({ message: 'Data already seeded' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // Seed clubs
    const clubsData = [
      {
        slug: 'vallehermoso-club-social-madrid',
        name: 'Vallehermoso Club Social Madrid',
        short_name: 'Vallehermoso CSC',
        description: 'A sophisticated cannabis social club in the heart of Chamberí, Vallehermoso Club Social Madrid offers a refined atmosphere for responsible cannabis enthusiasts. This private cultural association focuses on education, community, and safe consumption practices. Members enjoy a modern, comfortable space with knowledgeable staff who can discuss various strains and consumption methods. The club maintains strict membership protocols and prioritizes creating a welcoming environment for both Spanish and international members.',
        summary: 'Refined cannabis social club in Chamberí focused on education and responsible use',
        address: 'Calle Vallehermoso 34',
        district: 'Chamberí',
        postal_code: '28015',
        latitude: 40.436789,
        longitude: -3.711234,
        instagram_url: 'https://instagram.com/vallehermoso',
        main_image_url: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1280',
        languages: ['es', 'en'],
        is_tourist_friendly: true,
        rating_editorial: 4.8,
        rating_safety: 4.9,
        rating_ambience: 4.7,
        rating_location: 4.8,
        is_verified: true,
        is_featured: true,
        status: 'active'
      },
      {
        slug: 'la-latina-social-club',
        name: 'La Latina Social Club',
        short_name: 'La Latina CSC',
        description: 'Located in the vibrant Centro district, La Latina Social Club embodies the cultural spirit of Madrid\'s most historic neighborhood. This cannabis social club combines traditional Spanish hospitality with modern cannabis culture, offering members a cozy atmosphere perfect for socializing and relaxation. The club is particularly known for its friendly staff who speak multiple languages and its commitment to educating members about responsible consumption practices. Popular with tourists and expats.',
        summary: 'Cultural cannabis club in historic Centro with multilingual staff',
        address: 'Calle de Toledo 86',
        district: 'Centro',
        postal_code: '28005',
        latitude: 40.410256,
        longitude: -3.708965,
        instagram_url: 'https://instagram.com/lalatina',
        main_image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1280',
        languages: ['es', 'en', 'fr'],
        is_tourist_friendly: true,
        rating_editorial: 4.6,
        rating_safety: 4.7,
        rating_ambience: 4.5,
        rating_location: 4.8,
        is_verified: true,
        is_featured: true,
        status: 'active'
      },
      {
        slug: 'chamberi-green-house',
        name: 'Chamberí Green House',
        short_name: 'Green House',
        description: 'Chamberí Green House stands out for its botanical aesthetic and commitment to organic, sustainable cannabis cultivation. This private association attracts members who appreciate quality and environmental consciousness. The space features natural lighting, living plants, and a calm atmosphere conducive to mindful consumption. Staff members are passionate about cannabis education and are happy to share knowledge about different strains, terpenes, and consumption methods. English-speaking staff available.',
        summary: 'Botanical-inspired cannabis club with focus on organic, sustainable cultivation',
        address: 'Calle de Fuencarral 121',
        district: 'Chamberí',
        postal_code: '28010',
        latitude: 40.431567,
        longitude: -3.702345,
        main_image_url: 'https://images.unsplash.com/photo-1598928636135-d146006ff4be?w=1280',
        languages: ['es', 'en'],
        is_tourist_friendly: true,
        rating_editorial: 4.5,
        rating_safety: 4.6,
        rating_ambience: 4.8,
        rating_location: 4.5,
        is_verified: true,
        is_featured: true,
        status: 'active'
      },
      {
        slug: 'retiro-botanico-club',
        name: 'Retiro Botánico Club',
        short_name: 'Retiro Botánico',
        description: 'Adjacent to Madrid\'s famous Retiro Park, this cannabis social club offers a premium experience for discerning members. Retiro Botánico Club features an upscale, lounge-like atmosphere with carefully curated cannabis selections. The club emphasizes quality over quantity, maintaining a selective membership to ensure a refined environment. Perfect for those seeking a sophisticated setting to enjoy cannabis culture. The location near Retiro Park makes it ideal for members who appreciate nature and tranquility.',
        summary: 'Premium cannabis club near Retiro Park with upscale atmosphere',
        address: 'Calle de Alfonso XII 42',
        district: 'Retiro',
        postal_code: '28014',
        latitude: 40.413890,
        longitude: -3.684123,
        instagram_url: 'https://instagram.com/retirobotanico',
        languages: ['es', 'en'],
        is_tourist_friendly: false,
        rating_editorial: 4.7,
        rating_safety: 4.8,
        rating_ambience: 4.9,
        rating_location: 4.6,
        is_verified: true,
        is_featured: false,
        status: 'active'
      },
      {
        slug: 'malasana-private-club',
        name: 'Malasaña Private Club',
        short_name: 'Malasaña PC',
        description: 'In the heart of Madrid\'s trendiest neighborhood, Malasaña Private Club attracts a young, creative crowd. This cannabis social club reflects the artistic spirit of its surroundings with regularly rotating art exhibitions and a music-focused atmosphere. The club is popular with local artists, musicians, and creative professionals. Members appreciate the relaxed vibe and the club\'s support for Madrid\'s independent art scene. English spoken by most staff members.',
        summary: 'Artistic cannabis club in trendy Malasaña with creative atmosphere',
        address: 'Calle de San Vicente Ferrer 23',
        district: 'Malasaña',
        postal_code: '28004',
        latitude: 40.426789,
        longitude: -3.701234,
        instagram_url: 'https://instagram.com/malasanaclub',
        languages: ['es', 'en'],
        is_tourist_friendly: true,
        rating_editorial: 4.4,
        rating_safety: 4.5,
        rating_ambience: 4.6,
        rating_location: 4.7,
        is_verified: true,
        is_featured: false,
        status: 'active'
      }
    ];

    const { error: clubsError } = await supabase.from('clubs').insert(clubsData);
    
    if (clubsError) {
      throw clubsError;
    }

    // Seed FAQ data
    const faqData = [
      {
        slug: 'what-is-cannabis-club',
        question: 'What is a cannabis social club?',
        answer_markdown: 'A cannabis social club (CSC) is a private, non-profit cultural association where members can legally consume cannabis in a safe, controlled environment. These clubs operate under Spanish association law and are not commercial businesses. They exist to provide members with a responsible alternative to the illegal market.',
        language: 'en',
        category: 'basics',
        priority: 10
      },
      {
        slug: 'are-clubs-legal-madrid',
        question: 'Are cannabis clubs legal in Madrid?',
        answer_markdown: 'Cannabis social clubs exist in a legal gray area in Spain. While personal cannabis consumption and cultivation for private use is decriminalized, these clubs operate as private associations under the right to freedom of association. They are not explicitly legal nor illegal, but must follow strict guidelines to avoid prosecution. Clubs must be truly private, non-profit, and serve only registered members.',
        language: 'en',
        category: 'law',
        priority: 20
      },
      {
        slug: 'can-tourists-join',
        question: 'Can tourists join a cannabis club in Spain?',
        answer_markdown: 'Yes, tourists can join cannabis social clubs in Madrid, though the process varies by club. You typically need a valid ID or passport, must be over 18 (or 21 at some clubs), and require an invitation from an existing member. Some clubs are more tourist-friendly than others. It\'s important to contact clubs in advance to understand their specific membership requirements.',
        language: 'en',
        category: 'membership',
        priority: 30
      },
      {
        slug: 'membership-requirements',
        question: 'What are the requirements to become a member?',
        answer_markdown: 'Requirements vary by club but generally include: being over 18 or 21 years old, having a valid ID or passport, receiving an invitation from a current member, completing a membership application, and paying a membership fee. Some clubs require proof of residency in Spain, while others accept tourists. All members must agree to the club\'s rules and regulations regarding responsible use.',
        language: 'en',
        category: 'membership',
        priority: 40
      },
      {
        slug: 'clubs-vs-dispensaries',
        question: 'How are cannabis clubs different from dispensaries?',
        answer_markdown: 'Cannabis clubs are fundamentally different from commercial dispensaries. Clubs are private, non-profit associations where members collectively cultivate or purchase cannabis for personal consumption. There is no "buying" or "selling" - members contribute to costs and receive their share of the collective\'s cannabis. Dispensaries, by contrast, are commercial businesses that sell cannabis products to customers. This distinction is crucial to understanding how clubs operate legally in Spain.',
        language: 'en',
        category: 'basics',
        priority: 50
      },
      {
        slug: 'public-consumption-legal',
        question: 'Is it legal to consume cannabis in public in Spain?',
        answer_markdown: 'No. While personal use is decriminalized in Spain, consuming cannabis in public spaces is illegal and can result in fines. Cannabis consumption is only permitted in private spaces, including within licensed cannabis social clubs. This is why clubs exist - to provide members with a legal, private space for consumption. Public consumption remains subject to administrative penalties.',
        language: 'en',
        category: 'law',
        priority: 60
      },
      {
        slug: 'what-to-bring-joining',
        question: 'What should I bring when joining a club?',
        answer_markdown: 'When visiting a cannabis club for the first time, bring a valid government-issued ID or passport, cash for membership fees (most clubs don\'t accept cards), and contact information for your referral/invitation if required. It\'s also recommended to bring an open mind and respect for the club\'s rules. Some clubs may request additional documentation depending on their specific requirements.',
        language: 'en',
        category: 'membership',
        priority: 70
      },
      {
        slug: 'clubs-safe-regulated',
        question: 'Are cannabis clubs safe and regulated?',
        answer_markdown: 'Reputable cannabis clubs prioritize member safety and follow responsible practices, though they are not officially regulated like commercial establishments. Quality clubs test their cannabis for contaminants, maintain clean facilities, train staff on harm reduction, and create rules to prevent abuse. However, the level of professionalism varies between clubs. This guide highlights verified clubs known for maintaining high safety and quality standards.',
        language: 'en',
        category: 'safety',
        priority: 80
      }
    ];

    const { error: faqError } = await supabase.from('faq').insert(faqData);
    
    if (faqError) {
      throw faqError;
    }

    return new Response(
      JSON.stringify({ 
        message: 'Database seeded successfully',
        clubs: clubsData.length,
        faq: faqData.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error('Error seeding data:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
