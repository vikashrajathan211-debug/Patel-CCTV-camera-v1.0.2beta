import { CityInfo } from '../types';

export const CITIES_DATA: CityInfo[] = [
  // Top Featured / Quick Select Cities
  { name: 'Morbi', nameHi: 'मोरबी', state: 'Gujarat', stateHi: 'गुजरात', defaultPincode: '363641', popular: true },
  { name: 'Rajkot', nameHi: 'राजकोट', state: 'Gujarat', stateHi: 'गुजरात', defaultPincode: '360001', popular: true },
  { name: 'Ahmedabad', nameHi: 'अहमदाबाद', state: 'Gujarat', stateHi: 'गुजरात', defaultPincode: '380001', popular: true },
  { name: 'Surat', nameHi: 'सूरत', state: 'Gujarat', stateHi: 'गुजरात', defaultPincode: '395001', popular: true },
  { name: 'Vadodara', nameHi: 'वडोदरा', state: 'Gujarat', stateHi: 'गुजरात', defaultPincode: '390001', popular: true },
  { name: 'Mumbai', nameHi: 'मुंबई', state: 'Maharashtra', stateHi: 'महाराष्ट्र', defaultPincode: '400001', popular: true },
  { name: 'Jaipur', nameHi: 'जयपुर', state: 'Rajasthan', stateHi: 'राजस्थान', defaultPincode: '302001', popular: true },
  { name: 'Jodhpur', nameHi: 'जोधपुर', state: 'Rajasthan', stateHi: 'राजस्थान', defaultPincode: '342001', popular: true },
  { name: 'Udaipur', nameHi: 'उदयपुर', state: 'Rajasthan', stateHi: 'राजस्थान', defaultPincode: '313001', popular: true },
  { name: 'Kota', nameHi: 'कोटा', state: 'Rajasthan', stateHi: 'राजस्थान', defaultPincode: '324001', popular: true },

  // Gujarat Cities (Comprehensive)
  { name: 'Gandhinagar', nameHi: 'गांधीनगर', state: 'Gujarat', stateHi: 'गुजरात', defaultPincode: '382010', popular: true },
  { name: 'Bhavnagar', nameHi: 'भावनगर', state: 'Gujarat', stateHi: 'गुजरात', defaultPincode: '364001' },
  { name: 'Jamnagar', nameHi: 'जामनगर', state: 'Gujarat', stateHi: 'गुजरात', defaultPincode: '361001' },
  { name: 'Junagadh', nameHi: 'जूनागढ़', state: 'Gujarat', stateHi: 'गुजरात', defaultPincode: '362001' },
  { name: 'Gandhidham', nameHi: 'गांधीधाम', state: 'Gujarat', stateHi: 'गुजरात', defaultPincode: '370201' },
  { name: 'Bhuj', nameHi: 'भुज', state: 'Gujarat', stateHi: 'गुजरात', defaultPincode: '370001' },
  { name: 'Anand', nameHi: 'आनंद', state: 'Gujarat', stateHi: 'गुजरात', defaultPincode: '388001' },
  { name: 'Navsari', nameHi: 'नवसारी', state: 'Gujarat', stateHi: 'गुजरात', defaultPincode: '396445' },
  { name: 'Bharuch', nameHi: 'भरूच', state: 'Gujarat', stateHi: 'गुजरात', defaultPincode: '392001' },
  { name: 'Porbandar', nameHi: 'पोरबंदर', state: 'Gujarat', stateHi: 'गुजरात', defaultPincode: '360575' },
  { name: 'Godhra', nameHi: 'गोधरा', state: 'Gujarat', stateHi: 'गुजरात', defaultPincode: '389001' },
  { name: 'Valsad', nameHi: 'वलसाड', state: 'Gujarat', stateHi: 'गुजरात', defaultPincode: '396001' },
  { name: 'Vapi', nameHi: 'वापी', state: 'Gujarat', stateHi: 'गुजरात', defaultPincode: '396191' },
  { name: 'Veraval', nameHi: 'वेरावल', state: 'Gujarat', stateHi: 'गुजरात', defaultPincode: '362265' },
  { name: 'Patan', nameHi: 'पाटन', state: 'Gujarat', stateHi: 'गुजरात', defaultPincode: '384265' },
  { name: 'Mehsana', nameHi: 'मेहसाणा', state: 'Gujarat', stateHi: 'गुजरात', defaultPincode: '384001' },
  { name: 'Palanpur', nameHi: 'पालनपुर', state: 'Gujarat', stateHi: 'गुजरात', defaultPincode: '385001' },
  { name: 'Himatnagar', nameHi: 'हिम्मतनगर', state: 'Gujarat', stateHi: 'गुजरात', defaultPincode: '383001' },
  { name: 'Botad', nameHi: 'बोटाद', state: 'Gujarat', stateHi: 'गुजरात', defaultPincode: '364710' },
  { name: 'Amreli', nameHi: 'अमरेली', state: 'Gujarat', stateHi: 'गुजरात', defaultPincode: '365601' },
  { name: 'Surendranagar', nameHi: 'सुरेंद्रनगर', state: 'Gujarat', stateHi: 'गुजरात', defaultPincode: '363001' },
  { name: 'Deesa', nameHi: 'डीसा', state: 'Gujarat', stateHi: 'गुजरात', defaultPincode: '385535' },
  { name: 'Jetpur', nameHi: 'जेतपुर', state: 'Gujarat', stateHi: 'गुजरात', defaultPincode: '360370' },
  { name: 'Gondal', nameHi: 'गोंडल', state: 'Gujarat', stateHi: 'गुजरात', defaultPincode: '360311' },
  { name: 'Dahod', nameHi: 'दाहोद', state: 'Gujarat', stateHi: 'गुजरात', defaultPincode: '389151' },
  { name: 'Somnath', nameHi: 'सोमनाथ', state: 'Gujarat', stateHi: 'गुजरात', defaultPincode: '362268' },
  { name: 'Mandvi', nameHi: 'मांडवी', state: 'Gujarat', stateHi: 'गुजरात', defaultPincode: '370465' },
  { name: 'Ankleshwar', nameHi: 'अंकलेश्वर', state: 'Gujarat', stateHi: 'गुजरात', defaultPincode: '393001' },
  { name: 'Bardoli', nameHi: 'बारडोली', state: 'Gujarat', stateHi: 'गुजरात', defaultPincode: '394601' },
  { name: 'Vyara', nameHi: 'व्यारा', state: 'Gujarat', stateHi: 'गुजरात', defaultPincode: '394650' },
  { name: 'Keshod', nameHi: 'केशोद', state: 'Gujarat', stateHi: 'गुजरात', defaultPincode: '362220' },
  { name: 'Wadhwan', nameHi: 'वढवाण', state: 'Gujarat', stateHi: 'गुजरात', defaultPincode: '363030' },
  { name: 'Dhoraji', nameHi: 'धोराजी', state: 'Gujarat', stateHi: 'गुजरात', defaultPincode: '360410' },
  { name: 'Halol', nameHi: 'हालोल', state: 'Gujarat', stateHi: 'गुजरात', defaultPincode: '389350' },
  { name: 'Modasa', nameHi: 'मोडासा', state: 'Gujarat', stateHi: 'गुजरात', defaultPincode: '383315' },
  { name: 'Unjha', nameHi: 'ऊंझा', state: 'Gujarat', stateHi: 'गुजरात', defaultPincode: '384170' },
  { name: 'Kadi', nameHi: 'कड़ी', state: 'Gujarat', stateHi: 'गुजरात', defaultPincode: '382715' },
  { name: 'Visnagar', nameHi: 'विसनगर', state: 'Gujarat', stateHi: 'गुजरात', defaultPincode: '384315' },
  { name: 'Siddhpur', nameHi: 'सिद्धपुर', state: 'Gujarat', stateHi: 'गुजरात', defaultPincode: '384151' },
  { name: 'Idar', nameHi: 'इडर', state: 'Gujarat', stateHi: 'गुजरात', defaultPincode: '383430' },
  { name: 'Dhrangadhra', nameHi: 'ध्रांगध्रा', state: 'Gujarat', stateHi: 'गुजरात', defaultPincode: '363310' },
  { name: 'Khambhat', nameHi: 'खंभात', state: 'Gujarat', stateHi: 'गुजरात', defaultPincode: '388620' },
  { name: 'Sanand', nameHi: 'साणंद', state: 'Gujarat', stateHi: 'गुजरात', defaultPincode: '382110' },
  { name: 'Kalol', nameHi: 'कलोल', state: 'Gujarat', stateHi: 'गुजरात', defaultPincode: '382721' },
  { name: 'Mundra', nameHi: 'मुंद्रा', state: 'Gujarat', stateHi: 'गुजरात', defaultPincode: '370421' },
  { name: 'Anjar', nameHi: 'अंजार', state: 'Gujarat', stateHi: 'गुजरात', defaultPincode: '370110' },
  { name: 'Dwarka', nameHi: 'द्वारका', state: 'Gujarat', stateHi: 'गुजरात', defaultPincode: '361335' },
  { name: 'Una', nameHi: 'उना', state: 'Gujarat', stateHi: 'गुजरात', defaultPincode: '362560' },
  { name: 'Mahuva', nameHi: 'महुवा', state: 'Gujarat', stateHi: 'गुजरात', defaultPincode: '364290' },
  { name: 'Chhota Udaipur', nameHi: 'छोटा उदयपुर', state: 'Gujarat', stateHi: 'गुजरात', defaultPincode: '391165' },
  { name: 'Nadiad', nameHi: 'नडियाद', state: 'Gujarat', stateHi: 'गुजरात', defaultPincode: '387001' },

  // Rajasthan Cities (Comprehensive)
  { name: 'Bikaner', nameHi: 'बीकानेर', state: 'Rajasthan', stateHi: 'राजस्थान', defaultPincode: '334001' },
  { name: 'Ajmer', nameHi: 'अजमेर', state: 'Rajasthan', stateHi: 'राजस्थान', defaultPincode: '305001' },
  { name: 'Bhilwara', nameHi: 'भीलवाड़ा', state: 'Rajasthan', stateHi: 'राजस्थान', defaultPincode: '311001' },
  { name: 'Alwar', nameHi: 'अलवर', state: 'Rajasthan', stateHi: 'राजस्थान', defaultPincode: '301001' },
  { name: 'Bharatpur', nameHi: 'भरतपुर', state: 'Rajasthan', stateHi: 'राजस्थान', defaultPincode: '321001' },
  { name: 'Sikar', nameHi: 'सीकर', state: 'Rajasthan', stateHi: 'राजस्थान', defaultPincode: '332001' },
  { name: 'Pali', nameHi: 'पाली', state: 'Rajasthan', stateHi: 'राजस्थान', defaultPincode: '306401' },
  { name: 'Sri Ganganagar', nameHi: 'श्री गंगानगर', state: 'Rajasthan', stateHi: 'राजस्थान', defaultPincode: '335001' },
  { name: 'Hanumangarh', nameHi: 'हनुमानगढ़', state: 'Rajasthan', stateHi: 'राजस्थान', defaultPincode: '335512' },
  { name: 'Beawar', nameHi: 'ब्यावर', state: 'Rajasthan', stateHi: 'राजस्थान', defaultPincode: '305901' },
  { name: 'Jhunjhunu', nameHi: 'झुंझुनू', state: 'Rajasthan', stateHi: 'राजस्थान', defaultPincode: '333001' },
  { name: 'Tonk', nameHi: 'टोंक', state: 'Rajasthan', stateHi: 'राजस्थान', defaultPincode: '304001' },
  { name: 'Kishangarh', nameHi: 'किशनगढ़', state: 'Rajasthan', stateHi: 'राजस्थान', defaultPincode: '305801' },
  { name: 'Churu', nameHi: 'चूरू', state: 'Rajasthan', stateHi: 'राजस्थान', defaultPincode: '331001' },
  { name: 'Bundi', nameHi: 'बूंदी', state: 'Rajasthan', stateHi: 'राजस्थान', defaultPincode: '323001' },
  { name: 'Baran', nameHi: 'बारां', state: 'Rajasthan', stateHi: 'राजस्थान', defaultPincode: '325205' },
  { name: 'Dausa', nameHi: 'दौसा', state: 'Rajasthan', stateHi: 'राजस्थान', defaultPincode: '303303' },
  { name: 'Nagaur', nameHi: 'नागौर', state: 'Rajasthan', stateHi: 'राजस्थान', defaultPincode: '341001' },
  { name: 'Sawai Madhopur', nameHi: 'सवाई माधोपुर', state: 'Rajasthan', stateHi: 'राजस्थान', defaultPincode: '322001' },
  { name: 'Chittorgarh', nameHi: 'चित्तौड़गढ़', state: 'Rajasthan', stateHi: 'राजस्थान', defaultPincode: '312001' },
  { name: 'Jhalawar', nameHi: 'झालावाड़', state: 'Rajasthan', stateHi: 'राजस्थान', defaultPincode: '326001' },
  { name: 'Jaisalmer', nameHi: 'जैसलमेर', state: 'Rajasthan', stateHi: 'राजस्थान', defaultPincode: '345001' },
  { name: 'Barmer', nameHi: 'बाड़मेर', state: 'Rajasthan', stateHi: 'राजस्थान', defaultPincode: '344001' },
  { name: 'Dungarpur', nameHi: 'डूंगरपुर', state: 'Rajasthan', stateHi: 'राजस्थान', defaultPincode: '314001' },
  { name: 'Banswara', nameHi: 'बांसवाड़ा', state: 'Rajasthan', stateHi: 'राजस्थान', defaultPincode: '327001' },
  { name: 'Rajsamand', nameHi: 'राजसमंद', state: 'Rajasthan', stateHi: 'राजस्थान', defaultPincode: '313324' },
  { name: 'Nathdwara', nameHi: 'नाथद्वारा', state: 'Rajasthan', stateHi: 'राजस्थान', defaultPincode: '313301' },
  { name: 'Sirohi', nameHi: 'सिरोही', state: 'Rajasthan', stateHi: 'राजस्थान', defaultPincode: '307001' },
  { name: 'Mount Abu', nameHi: 'माउंट आबू', state: 'Rajasthan', stateHi: 'राजस्थान', defaultPincode: '307501' },
  { name: 'Abu Road', nameHi: 'आबू रोड', state: 'Rajasthan', stateHi: 'राजस्थान', defaultPincode: '307026' },
  { name: 'Makrana', nameHi: 'मकराना', state: 'Rajasthan', stateHi: 'राजस्थान', defaultPincode: '341505' },
  { name: 'Sujangarh', nameHi: 'सुजानगढ़', state: 'Rajasthan', stateHi: 'राजस्थान', defaultPincode: '331507' },
  { name: 'Hindaun', nameHi: 'हिंडौन', state: 'Rajasthan', stateHi: 'राजस्थान', defaultPincode: '322230' },
  { name: 'Gangapur City', nameHi: 'गंगापुर सिटी', state: 'Rajasthan', stateHi: 'राजस्थान', defaultPincode: '322201' },
  { name: 'Balotra', nameHi: 'बालोतरा', state: 'Rajasthan', stateHi: 'राजस्थान', defaultPincode: '344022' },
  { name: 'Nimbahera', nameHi: 'निम्बाहेड़ा', state: 'Rajasthan', stateHi: 'राजस्थान', defaultPincode: '312601' },
  { name: 'Sumerpur', nameHi: 'सुमेरपुर', state: 'Rajasthan', stateHi: 'राजस्थान', defaultPincode: '306902' },
  { name: 'Kuchaman City', nameHi: 'कुचामन सिटी', state: 'Rajasthan', stateHi: 'राजस्थान', defaultPincode: '341508' },
  { name: 'Didwana', nameHi: 'डीडवाना', state: 'Rajasthan', stateHi: 'राजस्थान', defaultPincode: '341303' },
  { name: 'Neem Ka Thana', nameHi: 'नीम का थाना', state: 'Rajasthan', stateHi: 'राजस्थान', defaultPincode: '332713' },
  { name: 'Kotputli', nameHi: 'कोटपूतली', state: 'Rajasthan', stateHi: 'राजस्थान', defaultPincode: '303108' },
  { name: 'Phalodi', nameHi: 'फलोदी', state: 'Rajasthan', stateHi: 'राजस्थान', defaultPincode: '342301' },
  { name: 'Pratapgarh', nameHi: 'प्रतापगढ़', state: 'Rajasthan', stateHi: 'राजस्थान', defaultPincode: '312605' },
  { name: 'Karauli', nameHi: 'करौली', state: 'Rajasthan', stateHi: 'राजस्थान', defaultPincode: '322241' },
  { name: 'Dholpur', nameHi: 'धौलपुर', state: 'Rajasthan', stateHi: 'राजस्थान', defaultPincode: '328001' },
  { name: 'Jalore', nameHi: 'जालौर', state: 'Rajasthan', stateHi: 'राजस्थान', defaultPincode: '343001' },
  { name: 'Bhinmal', nameHi: 'भीनमाल', state: 'Rajasthan', stateHi: 'राजस्थान', defaultPincode: '343029' },
  { name: 'Nokha', nameHi: 'नोखा', state: 'Rajasthan', stateHi: 'राजस्थान', defaultPincode: '334803' },
  { name: 'Suratgarh', nameHi: 'सूरतगढ़', state: 'Rajasthan', stateHi: 'राजस्थान', defaultPincode: '335804' },
  { name: 'Fatehpur Shekhawati', nameHi: 'फतेहपुर शेखावाटी', state: 'Rajasthan', stateHi: 'राजस्थान', defaultPincode: '332301' },

  // Maharashtra & Other Major Metro Hubs
  { name: 'Navi Mumbai', nameHi: 'नवी मुंबई', state: 'Maharashtra', stateHi: 'महाराष्ट्र', defaultPincode: '400703' },
  { name: 'Thane', nameHi: 'ठाणे', state: 'Maharashtra', stateHi: 'महाराष्ट्र', defaultPincode: '400601' },
  { name: 'Pune', nameHi: 'पुणे', state: 'Maharashtra', stateHi: 'महाराष्ट्र', defaultPincode: '411001' },
  { name: 'Nashik', nameHi: 'नासिक', state: 'Maharashtra', stateHi: 'महाराष्ट्र', defaultPincode: '422001' },
  { name: 'Nagpur', nameHi: 'नागपुर', state: 'Maharashtra', stateHi: 'महाराष्ट्र', defaultPincode: '440001' },
  { name: 'Delhi NCR', nameHi: 'दिल्ली एनसीआर', state: 'Delhi', stateHi: 'दिल्ली', defaultPincode: '110001', popular: true },
  { name: 'Indore', nameHi: 'इंदौर', state: 'Madhya Pradesh', stateHi: 'मध्य प्रदेश', defaultPincode: '452001', popular: true },
  { name: 'Bhopal', nameHi: 'भोपाल', state: 'Madhya Pradesh', stateHi: 'मध्य प्रदेश', defaultPincode: '462001' },
  { name: 'Bengaluru', nameHi: 'बेंगलुरु', state: 'Karnataka', stateHi: 'कर्नाटक', defaultPincode: '560001' },
  { name: 'Hyderabad', nameHi: 'हैदराबाद', state: 'Telangana', stateHi: 'तेलंगाना', defaultPincode: '500001' },
  { name: 'Lucknow', nameHi: 'लखनऊ', state: 'Uttar Pradesh', stateHi: 'उत्तर प्रदेश', defaultPincode: '226001' },
  { name: 'Chandigarh', nameHi: 'चंडीगढ़', state: 'Punjab/Haryana', stateHi: 'पंजाब/हरियाणा', defaultPincode: '160017' }
];

export function findCity(cityNameOrQuery: string): CityInfo | undefined {
  if (!cityNameOrQuery) return undefined;
  const q = cityNameOrQuery.trim().toLowerCase();
  return CITIES_DATA.find(
    c => c.name.toLowerCase() === q || c.nameHi === cityNameOrQuery.trim() || c.name.toLowerCase().includes(q)
  );
}

export function searchCities(query: string): CityInfo[] {
  if (!query || query.trim().length === 0) {
    return CITIES_DATA.slice(0, 15);
  }
  const q = query.trim().toLowerCase();
  return CITIES_DATA.filter(c => 
    c.name.toLowerCase().includes(q) ||
    c.nameHi.includes(query.trim()) ||
    c.state.toLowerCase().includes(q) ||
    c.stateHi.includes(query.trim()) ||
    c.defaultPincode.startsWith(q)
  );
}
