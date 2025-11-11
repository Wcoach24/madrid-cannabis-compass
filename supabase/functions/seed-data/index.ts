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
        main_image_url: '/src/assets/club-vallehermoso.jpg',
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
        main_image_url: '/src/assets/club-latina.jpg',
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
        main_image_url: '/src/assets/club-greenhouse.jpg',
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
        main_image_url: '/src/assets/club-retiro.jpg',
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
        main_image_url: '/src/assets/club-malasana.jpg',
        languages: ['es', 'en'],
        is_tourist_friendly: true,
        rating_editorial: 4.4,
        rating_safety: 4.5,
        rating_ambience: 4.6,
        rating_location: 4.7,
        is_verified: true,
        is_featured: false,
        status: 'active'
      },
      {
        slug: 'norte-verde-association',
        name: 'Norte Verde Association',
        short_name: 'Norte Verde',
        description: 'Norte Verde Association serves the Tetuán neighborhood with a community-focused approach to cannabis culture. This local club emphasizes Spanish traditions and creates a welcoming space for neighborhood residents. The atmosphere is relaxed and friendly, with regular members who have built lasting connections. While less tourist-oriented than central clubs, Norte Verde offers an authentic experience of local Spanish cannabis culture. Staff primarily speaks Spanish with some English capability.',
        summary: 'Community-focused cannabis club in Tetuán for local members',
        address: 'Calle de Bravo Murillo 156',
        district: 'Tetuán',
        postal_code: '28020',
        latitude: 40.457890,
        longitude: -3.698765,
        main_image_url: '/src/assets/club-tetuan.jpg',
        languages: ['es', 'en'],
        is_tourist_friendly: false,
        rating_editorial: 4.2,
        rating_safety: 4.4,
        rating_ambience: 4.1,
        rating_location: 4.0,
        is_verified: true,
        is_featured: false,
        status: 'active'
      },
      {
        slug: 'lavapies-social-collective',
        name: 'Lavapiés Social Collective',
        short_name: 'Lavapiés SC',
        description: 'Reflecting the multicultural character of Lavapiés, this social collective brings together members from diverse backgrounds. The club celebrates cultural diversity and maintains a progressive, inclusive atmosphere. Members enjoy a laid-back environment where different perspectives on cannabis culture are welcomed and discussed. The location in one of Madrid\'s most diverse neighborhoods attracts an international crowd. Multiple languages spoken including Spanish, English, Arabic, and Portuguese.',
        summary: 'Multicultural cannabis collective in diverse Lavapiés neighborhood',
        address: 'Calle de Argumosa 28',
        district: 'Lavapiés',
        postal_code: '28012',
        latitude: 40.408123,
        longitude: -3.701456,
        languages: ['es', 'en', 'ar', 'pt'],
        is_tourist_friendly: true,
        rating_editorial: 4.3,
        rating_safety: 4.3,
        rating_ambience: 4.4,
        rating_location: 4.5,
        is_verified: true,
        is_featured: false,
        status: 'active'
      },
      {
        slug: 'chamberi-wellness-association',
        name: 'Chamberí Wellness Association',
        short_name: 'Wellness CSC',
        description: 'Chamberí Wellness Association integrates cannabis culture with holistic health practices. This unique club offers yoga sessions, meditation classes, and educational workshops on mindful consumption. The minimalist, calming design creates an environment conducive to wellness and self-care. Members interested in the therapeutic aspects of cannabis particularly appreciate this club. Staff includes certified wellness instructors who can guide members on responsible use aligned with health goals.',
        summary: 'Wellness-oriented cannabis club integrating holistic health practices',
        address: 'Calle de Santa Engracia 67',
        district: 'Chamberí',
        postal_code: '28010',
        latitude: 40.435678,
        longitude: -3.702345,
        main_image_url: '/src/assets/club-wellness.jpg',
        languages: ['es', 'en'],
        is_tourist_friendly: true,
        rating_editorial: 4.6,
        rating_safety: 4.7,
        rating_ambience: 4.8,
        rating_location: 4.4,
        is_verified: true,
        is_featured: false,
        status: 'active'
      },
      {
        slug: 'atocha-leaf-society',
        name: 'Atocha Leaf Society',
        short_name: 'Atocha LS',
        description: 'Conveniently located near Atocha train station, this cannabis social club caters to a mix of local professionals and international visitors. Atocha Leaf Society maintains professional standards while offering a comfortable, lounge-like atmosphere. The club is popular for after-work visits and weekend relaxation. English-speaking staff are always available, and the club has established a reputation for reliable service and quality products. The central location makes it easily accessible from most parts of Madrid.',
        summary: 'Professional cannabis club near Atocha with convenient central location',
        address: 'Calle de Atocha 115',
        district: 'Atocha',
        postal_code: '28012',
        latitude: 40.409876,
        longitude: -3.693210,
        instagram_url: 'https://instagram.com/atochaleaf',
        main_image_url: '/src/assets/club-atocha.jpg',
        languages: ['es', 'en'],
        is_tourist_friendly: true,
        rating_editorial: 4.5,
        rating_safety: 4.6,
        rating_ambience: 4.4,
        rating_location: 4.9,
        is_verified: true,
        is_featured: false,
        status: 'active'
      },
      {
        slug: 'gran-via-green-circle',
        name: 'Gran Vía Green Circle',
        short_name: 'Green Circle',
        description: 'Strategically positioned on Madrid\'s main thoroughfare, Gran Vía Green Circle offers premium cannabis club experience in the city center. This modern establishment attracts business professionals, tourists, and locals seeking convenience without compromising quality. The club features contemporary design, efficient service, and a curated selection of cannabis products. Its location makes it ideal for visitors staying in central hotels. Staff are multilingual and experienced in welcoming international members.',
        summary: 'Central premium cannabis club on Gran Vía for professionals and visitors',
        address: 'Gran Vía 42',
        district: 'Centro',
        postal_code: '28013',
        latitude: 40.420123,
        longitude: -3.707654,
        instagram_url: 'https://instagram.com/granviagreen',
        main_image_url: '/src/assets/club-granvia.jpg',
        languages: ['es', 'en', 'de'],
        is_tourist_friendly: true,
        rating_editorial: 4.7,
        rating_safety: 4.8,
        rating_ambience: 4.6,
        rating_location: 5.0,
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
      },
      {
        slug: 'membership-fees-cost',
        question: 'How much does it cost to join a cannabis club?',
        answer_markdown: 'Membership fees vary significantly between clubs. Typical annual membership ranges from €20 to €50, with some premium clubs charging up to €100. Most clubs also require an initial registration fee. Beyond membership, you\'ll contribute to the collective cost of cannabis based on your consumption. Total costs depend on usage but are generally comparable to or lower than illegal market prices, with the added benefits of quality assurance, safety, and legality.',
        language: 'en',
        category: 'membership',
        priority: 90
      },
      {
        slug: 'bring-cannabis-home',
        question: 'Can I take cannabis home from a club?',
        answer_markdown: 'Generally, yes. Spanish law allows personal possession of small amounts of cannabis in private spaces. However, transporting cannabis in public technically remains illegal, though penalties are usually administrative rather than criminal. Most clubs provide discreet packaging. The key is to carry reasonable amounts for personal use and transport discreetly. Never consume in public or attempt to take cannabis across international borders, which is a serious crime.',
        language: 'en',
        category: 'law',
        priority: 100
      },
      {
        slug: 'club-etiquette-rules',
        question: 'What are the etiquette rules in cannabis clubs?',
        answer_markdown: 'Respect other members\' space and privacy. Don\'t photograph people without permission. Follow the club\'s consumption rules (some areas may be non-smoking). Be discreet when entering and leaving. Don\'t discuss business outside the club or share your membership card. Tip staff if service is good. Clean up after yourself. Most importantly, never attempt to resell or distribute cannabis - clubs are for personal consumption only. Violations can result in membership termination.',
        language: 'en',
        category: 'basics',
        priority: 110
      },
      {
        slug: 'medical-cannabis-spain',
        question: 'Can I use cannabis clubs for medical purposes?',
        answer_markdown: 'While Spain doesn\'t have a formal medical cannabis program, many club members use cannabis for therapeutic purposes. Some clubs have staff knowledgeable about medical applications and can suggest appropriate strains for specific conditions. However, clubs cannot make medical claims or prescribe cannabis. If you\'re interested in medical use, look for clubs emphasizing education and wellness, and consider consulting with a healthcare provider familiar with cannabis therapeutics.',
        language: 'en',
        category: 'medical',
        priority: 120
      },
      {
        slug: 'different-consumption-methods',
        question: 'What consumption methods are available in clubs?',
        answer_markdown: 'Most clubs offer various consumption options including smoking (joints, pipes, bongs), vaporizing (flower or concentrates), and sometimes edibles. Vaporizers are increasingly popular as a healthier alternative to smoking. Some wellness-focused clubs particularly encourage vaporizing. Edibles availability varies by club and requires advance notice due to preparation time. Many clubs have designated areas for different consumption methods to accommodate member preferences.',
        language: 'en',
        category: 'basics',
        priority: 130
      },
      {
        slug: 'visiting-multiple-clubs',
        question: 'Can I be a member of multiple clubs?',
        answer_markdown: 'Yes, you can join multiple cannabis clubs in Madrid. Many members do this to experience different atmospheres, locations, or product selections. Each club requires separate membership and fees. However, being a member of one club can sometimes make it easier to get invitations to others through member referrals. Some people maintain memberships at multiple clubs for convenience based on their location at different times.',
        language: 'en',
        category: 'membership',
        priority: 140
      },
      {
        slug: 'clubs-vs-illegal-market',
        question: 'Why choose a club over the illegal market?',
        answer_markdown: 'Cannabis clubs offer numerous advantages: legal protection through membership in a registered association, quality-tested products free from contamination, knowledgeable staff who can provide guidance, a safe and comfortable environment, community and social connection, elimination of legal risks associated with street purchases, transparent pricing, and support for responsible consumption practices. While membership requires effort, the benefits significantly outweigh illegal market alternatives.',
        language: 'en',
        category: 'basics',
        priority: 150
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
