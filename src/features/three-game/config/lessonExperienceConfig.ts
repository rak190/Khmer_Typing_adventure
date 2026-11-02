export type ExperienceType =
  | 'finger-sanctuary' // Level 1: Ancient Finger Sanctuary (F, D, S, A Stelas Quadrangle)
  | 'lotus-garden'     // Level 2: Enchanted Lotus Garden (J, K, L, ; Lotus stepping platforms)
  | 'twin-bridges'     // Level 3: Twin Bridges (Left & Right Causeway halves joining across chasm)
  | 'crossroads'       // Level 4: Jungle Crossroads (Branching paths for G & H reaches)
  | 'tower-climb'      // Level 5: Climbing Temple Tower (Vertical terrace ascension)
  | 'sky-platforms'    // Level 6: Sky Platforms (Floating stone platforms)
  | 'crystal-cave'     // Level 7: Crystal Cave (Illuminating cavern crystals)
  | 'river-crossing'   // Level 8: Sacred River Crossing (Magical boat across baray)
  | 'boss-encounter';  // World 1 Boss: Temple Guardian

export interface StationConfig {
  stageIndex: number;
  stageId: string;
  position: [number, number, number];
  stationTitleKh: string;
  stationTitleEn: string;
  missionPromptKh: string;
  missionPromptEn: string;
  interactionRadius?: number;
  guideBeaconColor?: string;
  transformationType:
    | 'awaken-stela'
    | 'open-mechanism'
    | 'extend-bridge'
    | 'raise-stairs'
    | 'reveal-sanctuary'
    | 'bloom-lotus'
    | 'align-platforms'
    | 'ignite-crystal'
    | 'advance-boat'
    | 'shatter-shield';
}

export interface LessonExperienceConfig {
  lessonId: number | 'boss' | string;
  experienceType: ExperienceType;
  titleKh: string;
  titleEn: string;
  themeDescriptionKh: string;
  themeDescriptionEn: string;
  initialPlayerPosition: [number, number, number];
  courtyardBounds: [number, number, number, number]; // [minX, maxX, minZ, maxZ]
  cameraPreset?: {
    offsetBack: number;
    offsetUp: number;
    lookUp: number;
    lookAheadZ: number;
    damping?: number;
  };
  stations: StationConfig[];
  ambientColor?: string;
  skyTint?: string;
}

/**
 * Data-driven registry mapping World 1 lessons to their unique 3D experience identities.
 */
export const WORLD1_LESSON_EXPERIENCES: Record<string, LessonExperienceConfig> = {
  // -------------------------------------------------------------------------
  // LEVEL 1: Ancient Finger Sanctuary
  // Quadrangle courtyard where left-hand keys awaken 4 sacred stelas and central sundial
  // -------------------------------------------------------------------------
  '1:1': {
    lessonId: 1,
    experienceType: 'finger-sanctuary',
    titleKh: 'វិហារម្រាមបុរាណ (Ancient Finger Sanctuary)',
    titleEn: 'Ancient Finger Sanctuary',
    themeDescriptionKh: 'រុករកសិលាស្តម្ភស្នូលទាំង ៤ (F D S A) និងដាស់យន្តការប្រាសាទកណ្តាល',
    themeDescriptionEn: 'Awaken the 4 sacred home-row stelas and unlock the central temple sundial',
    initialPlayerPosition: [0, 0, -4.5],
    courtyardBounds: [-10.0, 10.0, -8.0, 12.0],
    cameraPreset: {
      offsetBack: -5.8,
      offsetUp: 2.4,
      lookUp: 1.8,
      lookAheadZ: 1.8,
      damping: 4.8,
    },
    stations: [
      {
        stageIndex: 0,
        stageId: 'w1-l1-s1',
        position: [3.2, 0, -1.0], // East Altar (F & D focus)
        stationTitleKh: 'អាសនៈខាងកើត (East Altar — F & D)',
        stationTitleEn: 'East Altar — F & D Key Recall',
        missionPromptKh: 'ដើរទៅអាសនៈខាងកើត [D/Right] ដើម្បីដាស់សិលា F (ថ) និង D (ដ)',
        missionPromptEn: 'Walk to the East Altar to awaken the F and D key stelas',
        interactionRadius: 3.5,
        guideBeaconColor: '#F59E0B',
        transformationType: 'awaken-stela',
      },
      {
        stageIndex: 1,
        stageId: 'w1-l1-s2',
        position: [-3.2, 0, -1.0], // West Altar (S & A focus)
        stationTitleKh: 'អាសនៈខាងលិច (West Altar — S & A)',
        stationTitleEn: 'West Altar — S & A Key Recall',
        missionPromptKh: 'ដើរឆ្លងទៅអាសនៈខាងលិច [A/Left] ដើម្បីដាស់សិលា S (ស) និង A (ា)',
        missionPromptEn: 'Cross to the West Altar to awaken the S and A key stelas',
        interactionRadius: 3.5,
        guideBeaconColor: '#38BDF8',
        transformationType: 'awaken-stela',
      },
      {
        stageIndex: 2,
        stageId: 'w1-l1-s3',
        position: [0, 0, 4.5], // Central Sundial Altar
        stationTitleKh: 'យន្តការនាឡិកាថ្ងៃកណ្តាល (Central Temple Sundial)',
        stationTitleEn: 'Central Sanctuary Sundial',
        missionPromptKh: 'ឈានទៅកាន់យន្តការកណ្តាល [W/Forward] ដើម្បីបើកផ្លូវប្រាសាទ',
        missionPromptEn: 'Step to the Central Sundial to activate the ancient temple mechanism',
        interactionRadius: 3.6,
        guideBeaconColor: '#10B981',
        transformationType: 'open-mechanism',
      },
    ],
  },

  // -------------------------------------------------------------------------
  // LEVEL 2: Enchanted Lotus Garden
  // Shallow reflective lotus pool courtyard where right-hand keys bloom traversable paths
  // -------------------------------------------------------------------------
  '1:2': {
    lessonId: 2,
    experienceType: 'lotus-garden',
    titleKh: 'សួនផ្កាឈូកទិព្វ (Enchanted Lotus Garden)',
    titleEn: 'Enchanted Lotus Garden',
    themeDescriptionKh: 'បណ្តុះផ្កាឈូកទិព្វ J K L ; ដើម្បីបង្កើតស្ពានឆ្លងកាត់ស្រះមន្តអាគម',
    themeDescriptionEn: 'Cultivate enchanted lotus blooms with right-hand keys to span the sacred pool',
    initialPlayerPosition: [0, 0, -5.0],
    courtyardBounds: [-9.0, 9.0, -8.0, 16.0],
    stations: [
      {
        stageIndex: 0,
        stageId: 'w1-l2-s1',
        position: [0, 0, -1.5],
        stationTitleKh: 'អាសនៈស្រះឈូកទី ១ (Lotus Pond Altar 1)',
        stationTitleEn: 'Lotus Pond Altar 1 — J & K Practice',
        missionPromptKh: 'ដើរទៅមាត់ស្រះ [W/Forward] ដើម្បីបណ្តុះផ្កាឈូក J (់) និង K (ក)',
        missionPromptEn: 'Walk to the pond shore to cultivate lotus pads with J and K keys',
        interactionRadius: 3.5,
        transformationType: 'bloom-lotus',
      },
      {
        stageIndex: 1,
        stageId: 'w1-l2-s2',
        position: [0, 0, 5.5],
        stationTitleKh: 'អាសនៈស្រះឈូកទី ២ (Lotus Pond Altar 2)',
        stationTitleEn: 'Lotus Pond Altar 2 — L & Semicolon',
        missionPromptKh: 'ដើរឆ្លងលើផ្កាឈូក [W] ទៅអាសនៈកណ្តាលស្រះ ដើម្បីបណ្តុះផ្កាឈូក L (ល) និង ; (ើ)',
        missionPromptEn: 'Step across the lotus blooms to activate L and Semicolon keys',
        interactionRadius: 3.5,
        transformationType: 'bloom-lotus',
      },
      {
        stageIndex: 2,
        stageId: 'w1-l2-s3',
        position: [0, 0, 12.0],
        stationTitleKh: 'ទ្វារពន្លឺមាត់ស្រះ (Sanctuary Garden Gate)',
        stationTitleEn: 'Sanctuary Garden Gate — Garden Passage',
        missionPromptKh: 'ដើរទៅកាន់ទ្វារពន្លឺចុងស្រះ ដើម្បីបញ្ចប់ផ្លូវឆ្លងកាត់សួនផ្កាឈូក',
        missionPromptEn: 'Reach the garden sanctuary portal to complete the crossing',
        interactionRadius: 3.6,
        transformationType: 'reveal-sanctuary',
      },
    ],
  },

  // -------------------------------------------------------------------------
  // LEVEL 3: Twin Bridges
  // Deep stone chasm spanned by twin parallel causeways that unite through bilateral typing
  // -------------------------------------------------------------------------
  '1:3': {
    lessonId: 3,
    experienceType: 'twin-bridges',
    titleKh: 'ស្ពានភ្លោះអង្គរ (Angkor Twin Bridges)',
    titleEn: 'Angkor Twin Bridges',
    themeDescriptionKh: 'សម្របសម្រួលដៃទាំងពីរ ដើម្បីភ្ជាប់ស្ពានថ្មភ្លោះឆ្លងកាត់ជ្រលងជ្រៅ',
    themeDescriptionEn: 'Coordinate left and right hands to join twin stone causeways across the chasm',
    initialPlayerPosition: [0, 0, -5.5],
    courtyardBounds: [-8.0, 8.0, -8.0, 26.0],
    cameraPreset: {
      offsetBack: -6.4,
      offsetUp: 2.8,
      lookUp: 2.0,
      lookAheadZ: 2.4,
      damping: 4.5,
    },
    stations: [
      {
        stageIndex: 0,
        stageId: 'w1-l3-s1',
        position: [0, 0, 0.0], // Bridgehead Entrance
        stationTitleKh: 'ក្បាលស្ពានភ្លោះ (Bridgehead Pier — Left/Right Balance)',
        stationTitleEn: 'Twin Bridgehead — Alternation',
        missionPromptKh: 'ឈានទៅក្បាលស្ពានភ្លោះ ដើម្បីដាស់គ្រឹះស្ពានដៃឆ្វេង និងដៃស្តាំ',
        missionPromptEn: 'Advance to the bridgehead to anchor the left and right causeway foundations',
        interactionRadius: 3.5,
        guideBeaconColor: '#38BDF8',
        transformationType: 'extend-bridge',
      },
      {
        stageIndex: 1,
        stageId: 'w1-l3-s2',
        position: [0, 0, 10.5], // Mid-Chasm Pier Platform
        stationTitleKh: 'វេទិកាកណ្តាលជ្រលង (Mid-Chasm Pier — Rhythm Pairs)',
        stationTitleEn: 'Mid-Chasm Pier — Consonant-Vowel Pairs',
        missionPromptKh: 'ដើរតាមស្ពានថ្មទៅកណ្តាលជ្រលង ដើម្បីពង្រីកធ្នូថ្មតភ្ជាប់ស្ពានទាំងពីរ',
        missionPromptEn: 'Walk out onto the mid-chasm pier to extend the cantilever stone arches',
        interactionRadius: 3.5,
        guideBeaconColor: '#F59E0B',
        transformationType: 'extend-bridge',
      },
      {
        stageIndex: 2,
        stageId: 'w1-l3-s3',
        position: [0, 0, 20.0], // Grand Keystone Altar
        stationTitleKh: 'ថ្មសោស្ពានរាជ (Royal Keystone Convergence)',
        stationTitleEn: 'Royal Keystone Altar — First Words',
        missionPromptKh: 'ឈានទៅចុងស្ពាន ដើម្បីទម្លាក់ថ្មសោបិទបញ្ចប់ស្ពានរាជតភ្ជាប់ត្រើយ',
        missionPromptEn: 'Reach the far bank to lock the royal keystone and unite the bridges',
        interactionRadius: 3.6,
        guideBeaconColor: '#10B981',
        transformationType: 'reveal-sanctuary',
      },
    ],
  },

  // -------------------------------------------------------------------------
  // LEVEL 4: Jungle Crossroads
  // Branching jungle paths where G and H reaches connect pathways to a central shrine
  // -------------------------------------------------------------------------
  '1:4': {
    lessonId: 4,
    experienceType: 'crossroads',
    titleKh: 'ផ្លូវបំបែកព្រៃស្រោង (Jungle Crossroads)',
    titleEn: 'Jungle Crossroads',
    themeDescriptionKh: 'ឈោងម្រាមចង្អុល G និង H ដើម្បីតភ្ជាប់ផ្លូវបំបែកទាំងសងខាងឆ្ពោះទៅប្រាសាទ',
    themeDescriptionEn: 'Reach index fingers to G and H to illuminate branching paths toward the shrine',
    initialPlayerPosition: [0, 0, -5.0],
    courtyardBounds: [-11.0, 11.0, -8.0, 24.0],
    stations: [
      {
        stageIndex: 0,
        stageId: 'w1-l4-s1',
        position: [0, 0, -0.5],
        stationTitleKh: 'ប្រសព្វផ្លូវព្រៃ (Crossroads Junction)',
        stationTitleEn: 'Crossroads Junction — Index Reaches',
        missionPromptKh: 'ដើរទៅកាន់ចំណុចប្រសព្វផ្លូវព្រៃ ដើម្បីដាស់សញ្ញាផ្លូវ G (ង) និង H (ហ)',
        missionPromptEn: 'Step to the junction to reveal the G and H jungle trail markers',
        interactionRadius: 3.5,
        transformationType: 'awaken-stela',
      },
      {
        stageIndex: 1,
        stageId: 'w1-l4-s2',
        position: [-3.5, 0, 9.0],
        stationTitleKh: 'អាសនៈជ្រលងខាងឆ្វេង (West Grove Altar)',
        stationTitleEn: 'West Grove Altar — G Reach Flow',
        missionPromptKh: 'បត់ឆ្វេងតាមផ្លូវព្រៃ [A] ទៅអាសនៈជ្រលង ដើម្បីតភ្ជាប់ផ្លូវដៃឆ្វេង',
        missionPromptEn: 'Branch left along the jungle path to connect the western grove trail',
        interactionRadius: 3.5,
        transformationType: 'extend-bridge',
      },
      {
        stageIndex: 2,
        stageId: 'w1-l4-s3',
        position: [3.5, 0, 18.0],
        stationTitleKh: 'អាសនៈប្រសព្វធំ (Central Jungle Shrine)',
        stationTitleEn: 'Central Shrine — Vocabulary Mastery',
        missionPromptKh: 'បត់ស្តាំឆ្ពោះទៅប្រាសាទកណ្តាលព្រៃ ដើម្បីបើកទ្វារធំចូលព្រៃអាថ៌កំបាំង',
        missionPromptEn: 'Advance to the central shrine to open the deep jungle sanctuary',
        interactionRadius: 3.6,
        transformationType: 'reveal-sanctuary',
      },
    ],
  },

  // -------------------------------------------------------------------------
  // LEVEL 5: Climbing Temple Tower
  // Vertical stepped terrace ascension rising up to the high Angkorian Bakan sanctuary
  // -------------------------------------------------------------------------
  '1:5': {
    lessonId: 5,
    experienceType: 'tower-climb',
    titleKh: 'ការឡើងប្រាសាទកំពូល (Climbing Temple Tower)',
    titleEn: 'Climbing Temple Tower',
    themeDescriptionKh: 'ឈោងម្រាមឡើងជួរលើដៃឆ្វេង ដើម្បីដំឡើងកាំជណ្តើរថ្មឡើងទៅកំពូលបាកាណ',
    themeDescriptionEn: 'Reach up to the upper row to construct stone staircases ascending the sacred tower',
    initialPlayerPosition: [0, 0, -5.0],
    courtyardBounds: [-8.0, 8.0, -8.0, 26.0],
    cameraPreset: {
      offsetBack: -6.6,
      offsetUp: 3.2,
      lookUp: 2.8,
      lookAheadZ: 2.2,
      damping: 4.2,
    },
    stations: [
      {
        stageIndex: 0,
        stageId: 'w1-l5-s1',
        position: [0, 0, -1.0], // Base Courtyard Altar (Y = 0)
        stationTitleKh: 'ជើងជណ្តើរទី ១ (Tower Base Altar — Y = 0m)',
        stationTitleEn: 'Tower Base Altar — Upper Left Reaches',
        missionPromptKh: 'ដើរទៅជើងជណ្តើរប្រាសាទ ដើម្បីដំឡើងកាំជណ្តើរថ្មឡើងទៅថ្នាក់ទី ១',
        missionPromptEn: 'Walk to the tower base altar to raise the first flight of stone steps',
        interactionRadius: 3.5,
        guideBeaconColor: '#F59E0B',
        transformationType: 'raise-stairs',
      },
      {
        stageIndex: 1,
        stageId: 'w1-l5-s2',
        position: [0, 2.2, 9.5], // Terrace 1 Altar (Y = 2.2)
        stationTitleKh: 'ថ្នាក់ទី ១ នៃប្រាសាទ (First Terrace — Y = 2.2m)',
        stationTitleEn: 'First Terrace Platform — Reach Pairs',
        missionPromptKh: 'ឡើងតាមកាំជណ្តើរថ្មទៅថ្នាក់ទី ១ [W] ដើម្បីលើកកាំជណ្តើរឡើងទៅថ្នាក់ទី ២',
        missionPromptEn: 'Ascend the newly formed steps to the first terrace platform',
        interactionRadius: 3.5,
        guideBeaconColor: '#38BDF8',
        transformationType: 'raise-stairs',
      },
      {
        stageIndex: 2,
        stageId: 'w1-l5-s3',
        position: [0, 4.4, 20.0], // High Overlook Terrace (Y = 4.4)
        stationTitleKh: 'វេទិកាកំពូលបាកាណ (Crown Sanctuary Overlook — Y = 4.4m)',
        stationTitleEn: 'High Bakan Platform — Upper Row Words',
        missionPromptKh: 'ឡើងទៅកាន់វេទិកាកំពូលបាកាណ ដើម្បីបើកទិដ្ឋភាពប្រាសាទព្រៃទាំងមូល',
        missionPromptEn: 'Climb to the summit platform to reveal the panoramic temple jungle vista',
        interactionRadius: 3.6,
        guideBeaconColor: '#10B981',
        transformationType: 'reveal-sanctuary',
      },
    ],
  },

  // -------------------------------------------------------------------------
  // LEVEL 6: Sky Platforms
  // -------------------------------------------------------------------------
  '1:6': {
    lessonId: 6,
    experienceType: 'sky-platforms',
    titleKh: 'វេទិកាវេហាស៍ (Sky Platforms)',
    titleEn: 'Sky Platforms',
    themeDescriptionKh: 'ដាស់ថ្មអណ្តែតវេហាស៍ដោយប្រើគ្រាប់ចុចជួរលើដៃស្តាំ (Y U I O P)',
    themeDescriptionEn: 'Activate suspended floating platforms with right upper row keys',
    initialPlayerPosition: [0, 0, -5.0],
    courtyardBounds: [-8.0, 8.0, -8.0, 26.0],
    stations: [
      {
        stageIndex: 0,
        stageId: 'w1-l6-s1',
        position: [0, 0, -1.0],
        stationTitleKh: 'ទ្វារវេទិកាវេហាស៍ (Sky Causeway Gate)',
        stationTitleEn: 'Sky Causeway Gate — Right Upper Reaches',
        missionPromptKh: 'ឈានទៅកាន់ទ្វារវេទិកាវេហាស៍ ដើម្បីដាស់ថ្មអណ្តែតទី ១',
        missionPromptEn: 'Advance to the sky causeway portal to align the first floating platform',
        interactionRadius: 3.5,
        guideBeaconColor: '#38BDF8',
        transformationType: 'align-platforms',
      },
      {
        stageIndex: 1,
        stageId: 'w1-l6-s2',
        position: [0, 0, 10.0],
        stationTitleKh: 'វេទិកាកណ្តាលវេហាស៍ (Floating Terrace Station)',
        stationTitleEn: 'Floating Terrace Station — Syllables',
        missionPromptKh: 'ដើរតាមថ្មអណ្តែតទៅកាន់វេទិកាកណ្តាលវេហាស៍',
        missionPromptEn: 'Walk across floating platforms to the mid-air celestial terrace',
        interactionRadius: 3.5,
        guideBeaconColor: '#F59E0B',
        transformationType: 'align-platforms',
      },
      {
        stageIndex: 2,
        stageId: 'w1-l6-s3',
        position: [0, 0, 20.0],
        stationTitleKh: 'វិមានមេឃ (Celestial Overlook Sanctuary)',
        stationTitleEn: 'Celestial Overlook Sanctuary — Vocabulary',
        missionPromptKh: 'ឈានទៅវេទិកាខ្ពស់បំផុត ដើម្បីបើកទ្វារមេឃ',
        missionPromptEn: 'Step to the highest overlook to open the celestial portal',
        interactionRadius: 3.6,
        guideBeaconColor: '#10B981',
        transformationType: 'reveal-sanctuary',
      },
    ],
  },

  // -------------------------------------------------------------------------
  // LEVEL 7: Crystal Cave
  // -------------------------------------------------------------------------
  '1:7': {
    lessonId: 7,
    experienceType: 'crystal-cave',
    titleKh: 'រូងថ្មគ្រីស្តាល់ (Crystal Cave)',
    titleEn: 'Crystal Cave',
    themeDescriptionKh: 'រុករករូងថ្មបុរាណ និងបំភ្លឺគ្រីស្តាល់ទិព្វដោយប្រើជួរក្រោមដៃឆ្វេង (Z X C V)',
    themeDescriptionEn: 'Explore the ancient shaded shrine and ignite glowing crystal clusters',
    initialPlayerPosition: [0, 0, -5.0],
    courtyardBounds: [-8.0, 8.0, -8.0, 26.0],
    stations: [
      {
        stageIndex: 0,
        stageId: 'w1-l7-s1',
        position: [0, 0, -1.0],
        stationTitleKh: 'មាត់រូងថ្ម (Cavern Entrance Portal)',
        stationTitleEn: 'Cavern Entrance Portal — Lower Left Reaches',
        missionPromptKh: 'ដើរចូលមាត់រូងថ្ម ដើម្បីបំភ្លឺគ្រីស្តាល់ Z (ឋ) និង X (ខ)',
        missionPromptEn: 'Enter the cavern threshold to ignite the Z and X crystals',
        interactionRadius: 3.5,
        guideBeaconColor: '#6366F1',
        transformationType: 'ignite-crystal',
      },
      {
        stageIndex: 1,
        stageId: 'w1-l7-s2',
        position: [0, 0, 9.5],
        stationTitleKh: 'បន្ទប់កណ្តាលរូង (Inner Gem Chamber)',
        stationTitleEn: 'Inner Gem Chamber — C & V Practice',
        missionPromptKh: 'ដើរតាមពន្លឺត្បូងទៅកាន់បន្ទប់កណ្តាលរូង ដើម្បីដុតបំភ្លឺគ្រីស្តាល់ C (ច) និង V (វ)',
        missionPromptEn: 'Follow the jewel light to ignite the C and V crystal clusters',
        interactionRadius: 3.5,
        guideBeaconColor: '#EC4899',
        transformationType: 'ignite-crystal',
      },
      {
        stageIndex: 2,
        stageId: 'w1-l7-s3',
        position: [0, 0, 19.5],
        stationTitleKh: 'បេះដូងរូងគ្រីស្តាល់ (Luminescent Sanctuary Core)',
        stationTitleEn: 'Luminescent Sanctuary Core — Lower Row Words',
        missionPromptKh: 'ឈានទៅបេះដូងរូងគ្រីស្តាល់ ដើម្បីបើកផ្លូវថ្មអាថ៌កំបាំង',
        missionPromptEn: 'Reach the cavern heart to open the ancient underground passage',
        interactionRadius: 3.6,
        guideBeaconColor: '#10B981',
        transformationType: 'reveal-sanctuary',
      },
    ],
  },

  // -------------------------------------------------------------------------
  // LEVEL 8: Sacred River Crossing
  // -------------------------------------------------------------------------
  '1:8': {
    lessonId: 8,
    experienceType: 'river-crossing',
    titleKh: 'ការឆ្លងកាត់ស្ទឹងស័ក្តិសិទ្ធិ (Sacred River Crossing)',
    titleEn: 'Sacred River Crossing',
    themeDescriptionKh: 'ជិះទូកនាគទិព្វឆ្លងកាត់បារាយណ៍ស័ក្តិសិទ្ធិឆ្ពោះទៅប្រាសាទម្ចាស់ការពារ',
    themeDescriptionEn: 'Advance a ceremonial dragon boat across the sacred baray waters',
    initialPlayerPosition: [0, 0, -5.5],
    courtyardBounds: [-8.0, 8.0, -8.0, 26.0],
    stations: [
      {
        stageIndex: 0,
        stageId: 'w1-l8-s1',
        position: [0, 0, -1.0],
        stationTitleKh: 'កំពង់ទឹក (Water Pier Altar)',
        stationTitleEn: 'Water Pier Altar — Right Lower Keys',
        missionPromptKh: 'ឈានទៅកាន់កំពង់ទឹក ដើម្បីដាស់ទូកនាគទិព្វ',
        missionPromptEn: 'Step to the waterside pier to awaken the ceremonial dragon barge',
        interactionRadius: 3.5,
        guideBeaconColor: '#F59E0B',
        transformationType: 'advance-boat',
      },
      {
        stageIndex: 1,
        stageId: 'w1-l8-s2',
        position: [0, 0, 9.5],
        stationTitleKh: 'កោះកណ្តាលបារាយណ៍ (Mid-Baray Island Pier)',
        stationTitleEn: 'Mid-Baray Island Pier — Punctuation Khan',
        missionPromptKh: 'ដើរឆ្លងលើវេទិកាកោះកណ្តាលបារាយណ៍ ដើម្បីបន្តដំណើរកាត់ទឹក',
        missionPromptEn: 'Cross to the mid-lake island to navigate deeper across the baray',
        interactionRadius: 3.5,
        guideBeaconColor: '#38BDF8',
        transformationType: 'advance-boat',
      },
      {
        stageIndex: 2,
        stageId: 'w1-l8-s3',
        position: [0, 0, 19.5],
        stationTitleKh: 'ត្រើយម្ខាងទៀត (Guardian Shore Entrance)',
        stationTitleEn: 'Guardian Shore Entrance — Complete Keyboard',
        missionPromptKh: 'ឈានដល់ត្រើយម្ខាងទៀត ដើម្បីបើកទ្វារធំចូលជួបម្ចាស់ប្រាសាទព្រៃ',
        missionPromptEn: 'Reach the far shore to unlock the gate before the Temple Guardian',
        interactionRadius: 3.6,
        guideBeaconColor: '#10B981',
        transformationType: 'reveal-sanctuary',
      },
    ],
  },
};

/**
 * Returns the experience configuration for a given lesson, falling back to a standard
 * causeway layout for lessons not yet given a unique spatial theme.
 */
export function getLessonExperienceConfig(lessonId: number | 'boss' | string): LessonExperienceConfig {
  const key = `1:${lessonId}`;
  if (WORLD1_LESSON_EXPERIENCES[key]) {
    return WORLD1_LESSON_EXPERIENCES[key];
  }

  const isBoss = lessonId === 'boss';
  return {
    lessonId,
    experienceType: isBoss ? 'boss-encounter' : 'finger-sanctuary',
    titleKh: isBoss ? 'ម្ចាស់ប្រាសាទព្រៃ' : `មេរៀនទី ${lessonId}`,
    titleEn: isBoss ? 'Temple Guardian' : `Lesson ${lessonId}`,
    themeDescriptionKh: 'ផ្លូវប្រាសាទបុរាណអង្គរ',
    themeDescriptionEn: 'Ancient Angkor temple causeway',
    initialPlayerPosition: [0, 0, isBoss ? 24.0 : -6.0],
    courtyardBounds: isBoss ? [-8.0, 8.0, 18.0, 30.5] : [-13.0, 13.0, -14.0, 30.0],
    stations: [
      {
        stageIndex: 0,
        stageId: `w1-l${lessonId}-s1`,
        position: [0, 0, isBoss ? 24.0 : 3.6],
        stationTitleKh: 'អាសនៈទី ១',
        stationTitleEn: 'Stage 1 Altar',
        missionPromptKh: isBoss ? 'ឈានទៅមុខដើម្បីប្រឈមមុខនឹងម្ចាស់ប្រាសាទព្រៃ' : 'ដើរទៅកាន់អាសនៈទី ១ ដើម្បីចាប់ផ្តើម',
        missionPromptEn: isBoss ? 'Advance to face the Temple Guardian' : 'Walk to the first altar to begin',
        interactionRadius: isBoss ? 10.5 : 3.6,
        transformationType: isBoss ? 'shatter-shield' : 'awaken-stela',
      },
      {
        stageIndex: 1,
        stageId: `w1-l${lessonId}-s2`,
        position: [0, 0, isBoss ? 24.0 : 13.6],
        stationTitleKh: 'អាសនៈទី ២',
        stationTitleEn: 'Stage 2 Altar',
        missionPromptKh: isBoss ? 'បន្តវាយប្រហារបំបែកខែលជុំទី ២ របស់ម្ចាស់ប្រាសាទ' : 'ដើរទៅកាន់អាសនៈទី ២ នៅវេទិកាកណ្តាល',
        missionPromptEn: isBoss ? 'Strike the guardian’s second concentric shield' : 'Walk forward to the second stage altar',
        interactionRadius: isBoss ? 10.5 : 3.6,
        transformationType: isBoss ? 'shatter-shield' : 'extend-bridge',
      },
      {
        stageIndex: 2,
        stageId: `w1-l${lessonId}-s3`,
        position: [0, 0, isBoss ? 24.0 : 23.6],
        stationTitleKh: 'អាសនៈទី ៣',
        stationTitleEn: 'Stage 3 Altar',
        missionPromptKh: isBoss ? 'បញ្ចប់ Wave ទី ៣ ដើម្បីដោះសោពិភពទី ២!' : 'ឈានទៅអាសនៈចុងក្រោយ ដើម្បីបើកទ្វារប្រាសាទធំ',
        missionPromptEn: isBoss ? 'Overcome the final wave to defeat the Guardian!' : 'Step to the final altar to open the temple gate',
        interactionRadius: isBoss ? 10.5 : 3.6,
        transformationType: isBoss ? 'shatter-shield' : 'reveal-sanctuary',
      },
    ],
  };
}

export function isPilotExperience(lessonId: number | 'boss' | string | undefined): boolean {
  if (!lessonId) return false;
  const num = Number(lessonId);
  return num === 1 || num === 3 || num === 5;
}

export function isCustomExperienceSupported(lessonId: number | 'boss' | string | undefined): boolean {
  if (!lessonId) return false;
  if (lessonId === 'boss') return true;
  const num = Number(lessonId);
  return num >= 1 && num <= 8;
}
