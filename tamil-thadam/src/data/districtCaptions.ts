export type DistrictCaption = {
  tamil: string;
  caption: string;
};

/**
 * Placeholder captions keyed by English district name (GeoJSON `district` property).
 * Replace these later with field-collected lines.
 */
export const districtCaptions: Record<string, DistrictCaption> = {
  Ariyalur: {
    tamil: "அரியலூர்",
    caption:
      "Limestone country and temple tanks hold quiet harvest memories.\nElders still speak of Gangaikonda Cholapuram’s living stone.",
  },
  Chengalpattu: {
    tamil: "செங்கல்பட்டு",
    caption:
      "Palar river farms and old choultries sit between city and coast.\nNight markets remember salt, silk, and monsoon carts.",
  },
  Chennai: {
    tamil: "சென்னை",
    caption:
      "Marina winds carry film songs, harbour horns, and filter coffee.\nNeighbourhood streets keep a city’s many mother tongues.",
  },
  Coimbatore: {
    tamil: "கோயம்புத்தூர்",
    caption:
      "Kongu speech, mill sirens, and Western Ghats rain share this air.\nGrandmothers still greet the young with ஏனுங்க என்னங்க.",
  },
  Cuddalore: {
    tamil: "கடலூர்",
    caption:
      "Backwaters, silver beaches, and old port stories meet here.\nFishing hamlets count the tide before they count the clock.",
  },
  Dharmapuri: {
    tamil: "தருமபுரி",
    caption:
      "Mango orchards and hill paths season the everyday table.\nWells and cattle fairs still set the village calendar.",
  },
  Dindigul: {
    tamil: "திண்டுக்கல்",
    caption:
      "Locksmiths, palmyra sweets, and fort silhouettes mark the town.\nKodaikanal mist begins just beyond the plains.",
  },
  Erode: {
    tamil: "ஈரோடு",
    caption:
      "Turmeric hills and loom towns colour the Kongu belt.\nMarket mornings smell of spice sacks and wet earth.",
  },
  Kallakurichi: {
    tamil: "கள்ளக்குறிச்சி",
    caption:
      "A young district with old tank-irrigation wisdom.\nPaddy song and palmyra shade still frame the roads.",
  },
  Kancheepuram: {
    tamil: "காஞ்சிபுரம்",
    caption:
      "Silk looms click beside temple corridors and tank steps.\nWeavers keep colour recipes that never entered a book.",
  },
  Kanyakumari: {
    tamil: "கன்னியாகுமரி",
    caption:
      "Three seas meet where sunrise sermons begin the day.\nCoastal kitchens mix coconut, fish, and pilgrimage talk.",
  },
  Karur: {
    tamil: "கரூர்",
    caption:
      "Amaravathi banks and textile yards share one workday rhythm.\nHome looms still outlast factory clocks in family stories.",
  },
  Krishnagiri: {
    tamil: "கிருஷ்ணகிரி",
    caption:
      "Mango belts and granite hills guard the northern pass.\nFort ruins watch over orchards that feed the plains.",
  },
  Madurai: {
    tamil: "மதுரை",
    caption:
      "Temple drums, jasmine stalls, and night markets never sleep.\nThe city’s speech is as warm as its jiggered coffee.",
  },
  Mayiladuthurai: {
    tamil: "மயிலாடுதுறை",
    caption:
      "Cauvery delta temples and boat songs share the same tide.\nHarvest festivals still dress the riverbanks in lamps.",
  },
  Nagapattinam: {
    tamil: "நாகப்பட்டினம்",
    caption:
      "A port of many faiths, nets, and monsoon memories.\nShore temples keep watch over returning boats.",
  },
  Namakkal: {
    tamil: "நாமக்கல்",
    caption:
      "Egg baskets, lorry horns, and hill temples share the town.\nAnjaneya’s rock still orients travellers at dusk.",
  },
  Perambalur: {
    tamil: "பெரம்பலூர்",
    caption:
      "Fossil soil and onion fields hold an older Tamil Nadu.\nTank bunds still decide who plants and when.",
  },
  Pudukkottai: {
    tamil: "புதுக்கோட்டை",
    caption:
      "Cave beds, palace courtyards, and dryland farms endure.\nStorytellers still name every tank as if it were kin.",
  },
  Ramanathapuram: {
    tamil: "இராமநாதபுரம்",
    caption:
      "Gulf winds, pearl talk, and pilgrimage roads braid together.\nRamnad kitchens keep chilli and memory in equal measure.",
  },
  Ranipet: {
    tamil: "இராணிப்பேட்டை",
    caption:
      "A new name on an old Palar industrial shore.\nLeather yards and river villages still share one dawn.",
  },
  Salem: {
    tamil: "சேலம்",
    caption:
      "Mango, steel, and hill stations meet in one district breath.\nMarket Tamil here is quick, salty, and kind.",
  },
  Sivagangai: {
    tamil: "சிவகங்கை",
    caption:
      "Maravar country of palaces, tanks, and dryland courage.\nChettinad kitchens nearby perfume the evening air.",
  },
  Tenkasi: {
    tamil: "தென்காசி",
    caption:
      "Courtallam mist walks down to paddy and temple streets.\nWestern Ghats rain writes the year’s first sentence.",
  },
  Thanjavur: {
    tamil: "தஞ்சாவூர்",
    caption:
      "Delta gold, bronze lamps, and veena notes fill the palace town.\nEvery harvest still bows toward the Brihadeeswara tower.",
  },
  "The Nilgiris": {
    tamil: "நீலகிரி",
    caption:
      "Tea slopes, Toda memory, and monsoon clouds share the ridges.\nValley towns keep many languages around one hearth.",
  },
  Theni: {
    tamil: "தேனி",
    caption:
      "Cardamom wind and Cumbum grapes cool the western edge.\nHill markets open before the plains have warmed.",
  },
  Thiruvarur: {
    tamil: "திருவாரூர்",
    caption:
      "Temple cars, tyagaraja soil, and endless paddy meet here.\nCarnatic phrases still hitch a ride with the breeze.",
  },
  Thoothukudi: {
    tamil: "தூத்துக்குடி",
    caption:
      "Salt pans, harbour cranes, and pearl-coast speech spark the air.\nUppalam wind still seasons every conversation.",
  },
  Tiruchirappalli: {
    tamil: "திருச்சிராப்பள்ளி",
    caption:
      "Rockfort watches a city of railways, cigars, and river islands.\nCauvery talk begins before breakfast and ends after dusk.",
  },
  Tirunelveli: {
    tamil: "திருநெல்வேலி",
    caption:
      "Halwa shops, Tamirabarani ghats, and dry wit define the south.\nNellai speech can scold and bless in the same breath.",
  },
  Tirupathur: {
    tamil: "திருப்பத்தூர்",
    caption:
      "Sandal slopes and fort towns guard the Javadi edge.\nA young district carrying Vellore’s older stories.",
  },
  Tiruppur: {
    tamil: "திருப்பூர்",
    caption:
      "Knitwear nights and Kongu mornings share the same shift.\nNoyyal stories still surface between factory gates.",
  },
  Tiruvallur: {
    tamil: "திருவள்ளூர்",
    caption:
      "Temple tanks and industrial parks sit on Chennai’s shoulder.\nVillage fairs still arrive on the city’s doorstep.",
  },
  Tiruvannamalai: {
    tamil: "திருவண்ணாமலை",
    caption:
      "Arunachala’s girivalam lamps rewrite the mountain each month.\nAshram silence and market noise walk the same street.",
  },
  Vellore: {
    tamil: "வேலூர்",
    caption:
      "Fort moats, leather yards, and hospital corridors share the town.\nPalar memory still shapes the food and the jokes.",
  },
  Viluppuram: {
    tamil: "விழுப்புரம்",
    caption:
      "Rail junctions, Gingee hills, and sugarcane belts open the south.\nPilgrim roads to the coast still pause here for tea.",
  },
  Virudhunagar: {
    tamil: "விருதுநகர்",
    caption:
      "Chilli sacks, match-works, and Chettinad roads meet in heat.\nTown squares still argue politics over filter coffee.",
  },
};

export const MISSING_CAPTION_FALLBACK: DistrictCaption = {
  tamil: "மாவட்டம்",
  caption:
    "A Tamil Nadu district waiting for its oral history note.\nReplace this placeholder with a field-collected caption.",
};

export function getDistrictCaption(districtName: string): DistrictCaption {
  if (districtCaptions[districtName]) {
    return districtCaptions[districtName];
  }
  const match = Object.keys(districtCaptions).find(
    (key) => key.toLowerCase() === districtName.toLowerCase()
  );
  return match ? districtCaptions[match] : MISSING_CAPTION_FALLBACK;
}
