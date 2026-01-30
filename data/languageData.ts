// Country language data: maps ISO 3166-1 alpha-3 country codes to spoken languages
// Languages include both official and widely spoken/understood languages

export interface CountryLanguages {
  name: string;
  languages: string[];
}

export const countryLanguages: Record<string, CountryLanguages> = {
  // Africa
  DZA: { name: "Algeria", languages: ["Arabic", "French", "Berber"] },
  AGO: { name: "Angola", languages: ["Portuguese"] },
  BEN: { name: "Benin", languages: ["French"] },
  BWA: { name: "Botswana", languages: ["English", "Tswana"] },
  BFA: { name: "Burkina Faso", languages: ["French"] },
  BDI: { name: "Burundi", languages: ["French", "Kirundi", "Swahili"] },
  CPV: { name: "Cape Verde", languages: ["Portuguese"] },
  CMR: { name: "Cameroon", languages: ["French", "English"] },
  CAF: { name: "Central African Republic", languages: ["French", "Sango"] },
  TCD: { name: "Chad", languages: ["French", "Arabic"] },
  COM: { name: "Comoros", languages: ["French", "Arabic", "Comorian"] },
  COG: { name: "Congo", languages: ["French"] },
  COD: { name: "DR Congo", languages: ["French", "Swahili", "Lingala"] },
  CIV: { name: "Ivory Coast", languages: ["French"] },
  DJI: { name: "Djibouti", languages: ["French", "Arabic", "Somali"] },
  EGY: { name: "Egypt", languages: ["Arabic", "English"] },
  GNQ: { name: "Equatorial Guinea", languages: ["Spanish", "French", "Portuguese"] },
  ERI: { name: "Eritrea", languages: ["Tigrinya", "Arabic", "English"] },
  SWZ: { name: "Eswatini", languages: ["English", "Swazi"] },
  ETH: { name: "Ethiopia", languages: ["Amharic", "English", "Oromo"] },
  GAB: { name: "Gabon", languages: ["French"] },
  GMB: { name: "Gambia", languages: ["English"] },
  GHA: { name: "Ghana", languages: ["English"] },
  GIN: { name: "Guinea", languages: ["French"] },
  GNB: { name: "Guinea-Bissau", languages: ["Portuguese"] },
  KEN: { name: "Kenya", languages: ["English", "Swahili"] },
  LSO: { name: "Lesotho", languages: ["English", "Sotho"] },
  LBR: { name: "Liberia", languages: ["English"] },
  LBY: { name: "Libya", languages: ["Arabic", "English"] },
  MDG: { name: "Madagascar", languages: ["French", "Malagasy"] },
  MWI: { name: "Malawi", languages: ["English", "Chichewa"] },
  MLI: { name: "Mali", languages: ["French"] },
  MRT: { name: "Mauritania", languages: ["Arabic", "French"] },
  MUS: { name: "Mauritius", languages: ["English", "French", "Mauritian Creole"] },
  MAR: { name: "Morocco", languages: ["Arabic", "French", "Berber"] },
  MOZ: { name: "Mozambique", languages: ["Portuguese"] },
  NAM: { name: "Namibia", languages: ["English", "Afrikaans", "German"] },
  NER: { name: "Niger", languages: ["French"] },
  NGA: { name: "Nigeria", languages: ["English", "Hausa", "Yoruba", "Igbo"] },
  RWA: { name: "Rwanda", languages: ["French", "English", "Kinyarwanda", "Swahili"] },
  STP: { name: "Sao Tome and Principe", languages: ["Portuguese"] },
  SEN: { name: "Senegal", languages: ["French", "Wolof"] },
  SYC: { name: "Seychelles", languages: ["English", "French", "Seychellois Creole"] },
  SLE: { name: "Sierra Leone", languages: ["English"] },
  SOM: { name: "Somalia", languages: ["Somali", "Arabic", "English"] },
  ZAF: { name: "South Africa", languages: ["English", "Afrikaans", "Zulu", "Xhosa"] },
  SSD: { name: "South Sudan", languages: ["English", "Arabic"] },
  SDN: { name: "Sudan", languages: ["Arabic", "English"] },
  TZA: { name: "Tanzania", languages: ["Swahili", "English"] },
  TGO: { name: "Togo", languages: ["French"] },
  TUN: { name: "Tunisia", languages: ["Arabic", "French"] },
  UGA: { name: "Uganda", languages: ["English", "Swahili"] },
  ZMB: { name: "Zambia", languages: ["English"] },
  ZWE: { name: "Zimbabwe", languages: ["English", "Shona", "Ndebele"] },

  // Asia
  AFG: { name: "Afghanistan", languages: ["Pashto", "Dari", "English"] },
  ARM: { name: "Armenia", languages: ["Armenian", "Russian"] },
  AZE: { name: "Azerbaijan", languages: ["Azerbaijani", "Russian"] },
  BHR: { name: "Bahrain", languages: ["Arabic", "English"] },
  BGD: { name: "Bangladesh", languages: ["Bengali", "English"] },
  BTN: { name: "Bhutan", languages: ["Dzongkha", "English"] },
  BRN: { name: "Brunei", languages: ["Malay", "English"] },
  KHM: { name: "Cambodia", languages: ["Khmer", "English", "French"] },
  CHN: { name: "China", languages: ["Mandarin", "Cantonese", "English"] },
  CYP: { name: "Cyprus", languages: ["Greek", "Turkish", "English"] },
  GEO: { name: "Georgia", languages: ["Georgian", "Russian", "English"] },
  IND: { name: "India", languages: ["Hindi", "English", "Bengali", "Telugu", "Tamil", "Urdu"] },
  IDN: { name: "Indonesia", languages: ["Indonesian", "Javanese", "English"] },
  IRN: { name: "Iran", languages: ["Persian", "Azerbaijani", "Kurdish"] },
  IRQ: { name: "Iraq", languages: ["Arabic", "Kurdish", "English"] },
  ISR: { name: "Israel", languages: ["Hebrew", "Arabic", "English", "Russian"] },
  JPN: { name: "Japan", languages: ["Japanese", "English"] },
  JOR: { name: "Jordan", languages: ["Arabic", "English"] },
  KAZ: { name: "Kazakhstan", languages: ["Kazakh", "Russian", "English"] },
  KWT: { name: "Kuwait", languages: ["Arabic", "English"] },
  KGZ: { name: "Kyrgyzstan", languages: ["Kyrgyz", "Russian"] },
  LAO: { name: "Laos", languages: ["Lao", "French", "English"] },
  LBN: { name: "Lebanon", languages: ["Arabic", "French", "English"] },
  MYS: { name: "Malaysia", languages: ["Malay", "English", "Mandarin", "Tamil"] },
  MDV: { name: "Maldives", languages: ["Dhivehi", "English"] },
  MNG: { name: "Mongolia", languages: ["Mongolian", "Russian", "English"] },
  MMR: { name: "Myanmar", languages: ["Burmese", "English"] },
  NPL: { name: "Nepal", languages: ["Nepali", "English", "Hindi"] },
  PRK: { name: "North Korea", languages: ["Korean"] },
  OMN: { name: "Oman", languages: ["Arabic", "English"] },
  PAK: { name: "Pakistan", languages: ["Urdu", "English", "Punjabi", "Sindhi", "Pashto"] },
  PSE: { name: "Palestine", languages: ["Arabic", "English", "Hebrew"] },
  PHL: { name: "Philippines", languages: ["Filipino", "English", "Spanish"] },
  QAT: { name: "Qatar", languages: ["Arabic", "English"] },
  SAU: { name: "Saudi Arabia", languages: ["Arabic", "English"] },
  SGP: { name: "Singapore", languages: ["English", "Mandarin", "Malay", "Tamil"] },
  KOR: { name: "South Korea", languages: ["Korean", "English"] },
  LKA: { name: "Sri Lanka", languages: ["Sinhala", "Tamil", "English"] },
  SYR: { name: "Syria", languages: ["Arabic", "Kurdish", "English"] },
  TWN: { name: "Taiwan", languages: ["Mandarin", "Taiwanese", "English"] },
  TJK: { name: "Tajikistan", languages: ["Tajik", "Russian"] },
  THA: { name: "Thailand", languages: ["Thai", "English"] },
  TLS: { name: "Timor-Leste", languages: ["Portuguese", "Tetum", "Indonesian", "English"] },
  TUR: { name: "Turkey", languages: ["Turkish", "Kurdish", "English"] },
  TKM: { name: "Turkmenistan", languages: ["Turkmen", "Russian"] },
  ARE: { name: "United Arab Emirates", languages: ["Arabic", "English", "Hindi", "Urdu"] },
  UZB: { name: "Uzbekistan", languages: ["Uzbek", "Russian"] },
  VNM: { name: "Vietnam", languages: ["Vietnamese", "English", "French"] },
  YEM: { name: "Yemen", languages: ["Arabic"] },

  // Europe
  ALB: { name: "Albania", languages: ["Albanian", "English", "Italian"] },
  AND: { name: "Andorra", languages: ["Catalan", "Spanish", "French"] },
  AUT: { name: "Austria", languages: ["German", "English"] },
  BLR: { name: "Belarus", languages: ["Belarusian", "Russian"] },
  BEL: { name: "Belgium", languages: ["Dutch", "French", "German", "English"] },
  BIH: { name: "Bosnia and Herzegovina", languages: ["Bosnian", "Croatian", "Serbian", "English"] },
  BGR: { name: "Bulgaria", languages: ["Bulgarian", "English", "Russian"] },
  HRV: { name: "Croatia", languages: ["Croatian", "English", "Italian", "German"] },
  CZE: { name: "Czech Republic", languages: ["Czech", "English", "German", "Russian"] },
  DNK: { name: "Denmark", languages: ["Danish", "English", "German"] },
  EST: { name: "Estonia", languages: ["Estonian", "Russian", "English"] },
  FIN: { name: "Finland", languages: ["Finnish", "Swedish", "English"] },
  FRA: { name: "France", languages: ["French", "English"] },
  DEU: { name: "Germany", languages: ["German", "English"] },
  GRC: { name: "Greece", languages: ["Greek", "English"] },
  HUN: { name: "Hungary", languages: ["Hungarian", "English", "German"] },
  ISL: { name: "Iceland", languages: ["Icelandic", "English", "Danish"] },
  IRL: { name: "Ireland", languages: ["English", "Irish"] },
  ITA: { name: "Italy", languages: ["Italian", "English"] },
  XKX: { name: "Kosovo", languages: ["Albanian", "Serbian", "English"] },
  LVA: { name: "Latvia", languages: ["Latvian", "Russian", "English"] },
  LIE: { name: "Liechtenstein", languages: ["German", "English"] },
  LTU: { name: "Lithuania", languages: ["Lithuanian", "Russian", "English", "Polish"] },
  LUX: { name: "Luxembourg", languages: ["Luxembourgish", "French", "German", "English"] },
  MKD: { name: "North Macedonia", languages: ["Macedonian", "Albanian", "English"] },
  MLT: { name: "Malta", languages: ["Maltese", "English", "Italian"] },
  MDA: { name: "Moldova", languages: ["Romanian", "Russian", "English"] },
  MCO: { name: "Monaco", languages: ["French", "Italian", "English"] },
  MNE: { name: "Montenegro", languages: ["Montenegrin", "Serbian", "English"] },
  NLD: { name: "Netherlands", languages: ["Dutch", "English", "German"] },
  NOR: { name: "Norway", languages: ["Norwegian", "English"] },
  POL: { name: "Poland", languages: ["Polish", "English", "German", "Russian"] },
  PRT: { name: "Portugal", languages: ["Portuguese", "English", "Spanish"] },
  ROU: { name: "Romania", languages: ["Romanian", "English", "French", "Hungarian"] },
  RUS: { name: "Russia", languages: ["Russian", "English"] },
  SMR: { name: "San Marino", languages: ["Italian", "English"] },
  SRB: { name: "Serbia", languages: ["Serbian", "English", "Hungarian"] },
  SVK: { name: "Slovakia", languages: ["Slovak", "English", "Hungarian", "Czech"] },
  SVN: { name: "Slovenia", languages: ["Slovenian", "English", "Italian", "Hungarian"] },
  ESP: { name: "Spain", languages: ["Spanish", "Catalan", "Basque", "Galician", "English"] },
  SWE: { name: "Sweden", languages: ["Swedish", "English"] },
  CHE: { name: "Switzerland", languages: ["German", "French", "Italian", "Romansh", "English"] },
  UKR: { name: "Ukraine", languages: ["Ukrainian", "Russian", "English"] },
  GBR: { name: "United Kingdom", languages: ["English", "Welsh", "Scottish Gaelic"] },
  VAT: { name: "Vatican City", languages: ["Italian", "Latin"] },

  // North America
  ATG: { name: "Antigua and Barbuda", languages: ["English"] },
  BHS: { name: "Bahamas", languages: ["English"] },
  BRB: { name: "Barbados", languages: ["English"] },
  BLZ: { name: "Belize", languages: ["English", "Spanish", "Kriol"] },
  CAN: { name: "Canada", languages: ["English", "French"] },
  CRI: { name: "Costa Rica", languages: ["Spanish", "English"] },
  CUB: { name: "Cuba", languages: ["Spanish"] },
  DMA: { name: "Dominica", languages: ["English", "French Creole"] },
  DOM: { name: "Dominican Republic", languages: ["Spanish"] },
  SLV: { name: "El Salvador", languages: ["Spanish"] },
  GRD: { name: "Grenada", languages: ["English"] },
  GTM: { name: "Guatemala", languages: ["Spanish"] },
  HTI: { name: "Haiti", languages: ["French", "Haitian Creole"] },
  HND: { name: "Honduras", languages: ["Spanish"] },
  JAM: { name: "Jamaica", languages: ["English", "Jamaican Patois"] },
  MEX: { name: "Mexico", languages: ["Spanish", "English"] },
  NIC: { name: "Nicaragua", languages: ["Spanish", "English"] },
  PAN: { name: "Panama", languages: ["Spanish", "English"] },
  KNA: { name: "Saint Kitts and Nevis", languages: ["English"] },
  LCA: { name: "Saint Lucia", languages: ["English", "French Creole"] },
  VCT: { name: "Saint Vincent and the Grenadines", languages: ["English"] },
  TTO: { name: "Trinidad and Tobago", languages: ["English", "Spanish", "Hindi"] },
  USA: { name: "United States", languages: ["English", "Spanish"] },

  // South America
  ARG: { name: "Argentina", languages: ["Spanish", "English", "Italian"] },
  BOL: { name: "Bolivia", languages: ["Spanish", "Quechua", "Aymara"] },
  BRA: { name: "Brazil", languages: ["Portuguese", "Spanish", "English"] },
  CHL: { name: "Chile", languages: ["Spanish", "English"] },
  COL: { name: "Colombia", languages: ["Spanish", "English"] },
  ECU: { name: "Ecuador", languages: ["Spanish", "Quechua"] },
  GUY: { name: "Guyana", languages: ["English", "Hindi", "Urdu"] },
  PRY: { name: "Paraguay", languages: ["Spanish", "Guarani"] },
  PER: { name: "Peru", languages: ["Spanish", "Quechua", "Aymara", "English"] },
  SUR: { name: "Suriname", languages: ["Dutch", "English", "Sranan Tongo"] },
  URY: { name: "Uruguay", languages: ["Spanish", "Portuguese", "English"] },
  VEN: { name: "Venezuela", languages: ["Spanish"] },

  // Oceania
  AUS: { name: "Australia", languages: ["English"] },
  FJI: { name: "Fiji", languages: ["English", "Fijian", "Hindi"] },
  KIR: { name: "Kiribati", languages: ["English", "Gilbertese"] },
  MHL: { name: "Marshall Islands", languages: ["English", "Marshallese"] },
  FSM: { name: "Micronesia", languages: ["English"] },
  NRU: { name: "Nauru", languages: ["English", "Nauruan"] },
  NZL: { name: "New Zealand", languages: ["English", "Maori"] },
  PLW: { name: "Palau", languages: ["English", "Palauan"] },
  PNG: { name: "Papua New Guinea", languages: ["English", "Tok Pisin", "Hiri Motu"] },
  WSM: { name: "Samoa", languages: ["Samoan", "English"] },
  SLB: { name: "Solomon Islands", languages: ["English"] },
  TON: { name: "Tonga", languages: ["Tongan", "English"] },
  TUV: { name: "Tuvalu", languages: ["Tuvaluan", "English"] },
  VUT: { name: "Vanuatu", languages: ["English", "French", "Bislama"] },

  // Additional territories
  GRL: { name: "Greenland", languages: ["Greenlandic", "Danish", "English"] },
  NCL: { name: "New Caledonia", languages: ["French"] },
  PYF: { name: "French Polynesia", languages: ["French", "Tahitian"] },
  PRI: { name: "Puerto Rico", languages: ["Spanish", "English"] },
  FLK: { name: "Falkland Islands", languages: ["English"] },
  GUF: { name: "French Guiana", languages: ["French"] },
  ESH: { name: "Western Sahara", languages: ["Arabic", "Spanish"] },
  HKG: { name: "Hong Kong", languages: ["Cantonese", "English", "Mandarin"] },
  MAC: { name: "Macau", languages: ["Cantonese", "Portuguese", "Mandarin"] },
};

// Get all unique languages sorted alphabetically
export const allLanguages: string[] = Array.from(
  new Set(
    Object.values(countryLanguages).flatMap((c) => c.languages)
  )
).sort();

// Get countries that speak a given language
export function getCountriesByLanguage(language: string): string[] {
  return Object.entries(countryLanguages)
    .filter(([, data]) =>
      data.languages.some((l) => l.toLowerCase() === language.toLowerCase())
    )
    .map(([code]) => code);
}

// Get countries that speak any of the given languages
export function getCountriesByLanguages(languages: string[]): Map<string, string[]> {
  const result = new Map<string, string[]>();

  for (const [code, data] of Object.entries(countryLanguages)) {
    const matchingLanguages = data.languages.filter((lang) =>
      languages.some((l) => l.toLowerCase() === lang.toLowerCase())
    );
    if (matchingLanguages.length > 0) {
      result.set(code, matchingLanguages);
    }
  }

  return result;
}
