// Advanced Sweet & Realistic Female Voice Speech Engine for Patel CCTV Camera World
// Supports Gujarati (ગુજરાતી), Marathi (मराठी), Kannada (ಕನ್ನಡ), Hindi (हिन्दी), and English
import { Language } from '../types';

// Audio Context for soft welcoming entrance chime
let audioCtx: AudioContext | null = null;

const playGentleWelcomeChime = async () => {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    if (!audioCtx || audioCtx.state === 'closed') {
      audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === 'suspended') {
      await audioCtx.resume();
    }

    const now = audioCtx.currentTime;

    // Harmonic bell chime notes (523.25Hz C5 -> 659.25Hz E5 -> 783.99Hz G5)
    const notes = [523.25, 659.25, 783.99];
    notes.forEach((freq, index) => {
      if (!audioCtx) return;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + index * 0.12);

      gain.gain.setValueAtTime(0.001, now + index * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.12, now + index * 0.12 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.12 + 0.6);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(now + index * 0.12);
      osc.stop(now + index * 0.12 + 0.65);
    });
  } catch (e) {
    console.debug('Chime audio context skipped:', e);
  }
};

// Helper to find the best sweet female voice for a given language code
const getBestFemaleVoice = (voices: SpeechSynthesisVoice[], langCode: Language): SpeechSynthesisVoice | null => {
  if (!voices || voices.length === 0) return null;

  const femaleKeywords = [
    'female', 'woman', 'girl', 'sweet', 'natural', 'neural',
    'swara', 'kalpana', 'neerja', 'priya', 'kavya', 'lekha', 'veena', 'shruti', 'diti', 'heera', 'vani', 'sapna', 'dhwani', 'aarohi',
    'google हिन्दी', 'google hi', 'google gu', 'google ગુજરાતી', 'google mr', 'google मराठी', 'google kn', 'google ಕನ್ನಡ', 'google ta', 'google தமிழ்',
    'google uk english female', 'google us english female', 'google en', 'samantha',
    'karen', 'moira', 'victoria', 'zira', 'aria', 'jenny', 'sonia', 'aditi'
  ];

  const prefix = langCode.toLowerCase();

  // 1. Preferred target language female voice
  const matchingLangVoices = voices.filter(v => {
    const vLang = v.lang.toLowerCase();
    return vLang.startsWith(prefix) || 
      vLang.includes(`-${prefix}`) || 
      vLang.includes(`_${prefix}`) ||
      v.name.toLowerCase().includes(prefix);
  });

  const targetFemale = matchingLangVoices.find(v => 
    femaleKeywords.some(kw => v.name.toLowerCase().includes(kw))
  );
  if (targetFemale) return targetFemale;
  if (matchingLangVoices.length > 0) return matchingLangVoices[0];

  // 2. Indian language female voice fallback
  const indianVoices = voices.filter(v => 
    v.lang.toLowerCase().includes('in') || 
    v.lang.toLowerCase().startsWith('hi') ||
    v.name.toLowerCase().includes('india') ||
    v.name.toLowerCase().includes('hindi')
  );

  const indianFemale = indianVoices.find(v => 
    femaleKeywords.some(kw => v.name.toLowerCase().includes(kw))
  );
  if (indianFemale) return indianFemale;
  if (indianVoices.length > 0) return indianVoices[0];

  // 3. High-quality natural English female voice fallback
  const enFemale = voices.find(v => 
    v.lang.toLowerCase().startsWith('en') && 
    femaleKeywords.some(kw => v.name.toLowerCase().includes(kw))
  );
  if (enFemale) return enFemale;

  return voices[0] || null;
};

// Global state callback for listening to speech events
type SpeechStateListener = (isPlaying: boolean, currentLang: Language | null) => void;
const listeners: Set<SpeechStateListener> = new Set();

export const subscribeSpeechState = (listener: SpeechStateListener) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const notifyState = (isPlaying: boolean, currentLang: Language | null) => {
  listeners.forEach(fn => fn(isPlaying, currentLang));
};

let isCurrentlySpeaking = false;

export const isSpeakingAudio = () => isCurrentlySpeaking;

export const stopWelcomeAudio = () => {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    isCurrentlySpeaking = false;
    notifyState(false, null);
  }
};

export const WELCOME_MESSAGES: Record<Language, string> = {
  hi: 'पटेल सीसीटीवी कैमरा वर्ल्ड में आपका हार्दिक स्वागत है।',
  gu: 'પટેલ સીસીટીવી કેમેરા વર્લ્ડમાં આપનું હાર્દિક સ્વાગત છે.',
  mr: 'पटेल सीसीटीव्ही कॅमेरा वर्ल्डमध्ये आपले सहर्ष स्वागत आहे.',
  kn: 'ಪಟೇಲ್ ಸಿಸಿಟಿವಿ ಕ್ಯಾಮೆರಾ ವರ್ಲ್ಡ್‌ಗೆ ನಿಮಗೆ ಆತ್ಮೀಯ ಸ್ವಾಗತ.',
  en: 'Welcome to Patel CCTV Camera World.',
  ta: 'பட்டேல் CCTV கேமரா உலகிற்கு உங்களை அன்புடன் வரவேற்கிறோம்.',
  te: 'పటేల్ CCTV కెమెరా వరల్డ్‌కి మీకు స్వాగతం.',
  ml: 'പട്ടേൽ CCTV ക്യാമറ വേൾഡിലേക്ക് നിങ്ങൾക്ക് സ്വാഗതം.',
};

export interface SecurityWarningContent {
  title: string;
  subtitle: string;
  written: string;
  spoken: string;
}

export const SECURITY_WARNING_TEXTS: Record<Language, SecurityWarningContent> = {
  hi: {
    title: 'सावधानी नोट (Security Caution Alert)',
    subtitle: 'लॉगिन के बाद अति महत्वपूर्ण सुरक्षा निर्देश',
    written:
      'सावधानी नोट: कोई भी हमारे नाम का मिसयूज कर सकता है, तो कृपया नंबरों की जांच करके ही किसी का फोन या व्हाट्सएप पर मैसेज आए तो नंबरों की जांच करें उसके बाद ही उसके ऊपर भरोसा करें।\n\n' +
      'अगर यह नीचे दिया गया हुआ नंबर +91 74830 05197 के अलावा कोई दूसरा नंबर से आपको मैसेज करे, तो उससे पहले कंफर्म कर लीजिएगा कि कोई फ्रॉड तो नहीं है।\n\n' +
      'और अगर आपके साथ फ्रॉड हो तो नजदीकी पुलिस स्टेशन में रिपोर्ट दर्ज करें या फिर इस नंबर पर कॉल करें: +91 80009 51663।\n\n' +
      'आपका धन्यवाद — पटेल सीसीटीवी कैमरा वर्ल्ड',
    spoken:
      'सावधानी नोट! कोई भी हमारे नाम का गलत इस्तेमाल या मिसयूज कर सकता है। ' +
      'कृपया किसी का भी फोन या व्हाट्सएप पर मैसेज आए तो पहले नंबरों की अच्छी तरह जांच करें, उसके बाद ही उस पर भरोसा करें। ' +
      'हमारे नीचे दिए गए ऑफिशियल नंबर +91 74830 05197 के अलावा किसी भी दूसरे नंबर से मैसेज आए तो पहले पूरी तरह पुष्टि कर लें कि कोई फ्रॉड तो नहीं है। ' +
      'और यदि किसी प्रकार का फ्रॉड हो, तो तुरंत नजदीकी पुलिस स्टेशन में रिपोर्ट दर्ज कराएं या फिर हमारे हेल्पलाइन नंबर 80009 51663 पर कॉल करें। आपका बहुत बहुत धन्यवाद!',
  },
  en: {
    title: 'Security Caution Notice (Anti-Fraud Alert)',
    subtitle: 'Crucial verification notice after login',
    written:
      'Security Caution Notice: Someone might misuse our brand name. Please always verify the phone numbers before trusting any call or WhatsApp message.\n\n' +
      'If you receive a message from any number other than our official number +91 74830 05197, please confirm first to prevent fraud.\n\n' +
      'If you face any fraud, immediately report to your nearest police station or call our helpline: +91 80009 51663.\n\n' +
      'Thank you — Patel CCTV Camera World',
    spoken:
      'Security caution notice! Please beware of fraud. Someone might misuse our business name. ' +
      'Always verify the phone numbers before trusting any call or WhatsApp message. ' +
      'If you receive a message from any number other than our official number +91 74830 05197, please confirm first to prevent fraud. ' +
      'In case of any fraud, immediately report to your nearest police station or call our helpline at 80009 51663. Thank you!',
  },
  gu: {
    title: 'સાવધાની નોટ (સુરક્ષા ચેતવણી)',
    subtitle: 'લૉગિન પછી મહત્વપૂર્ણ સુરક્ષા સૂચના',
    written:
      'સાવધાની નોટ: કોઈ પણ અમારા નામનો દુરુપયોગ કરી શકે છે, તેથી કૃપા કરીને નંબરની તપાસ કર્યા પછી જ કોઈનો ફોન કે વોટ્સએપ મેસેજ આવે તો વિશ્વાસ કરો.\n\n' +
      'જો નીચે આપેલા નંબર +91 74830 05197 સિવાય અન્ય કોઈ નંબરથી મેસેજ આવે, તો પહેલા કન્ફર્મ કરી લો કે કોઈ ફ્રોડ નથી.\n\n' +
      'અને જો તમારી સાથે ફ્રોડ થાય તો નજીકના પોલીસ સ્ટેશનમાં ફરિયાદ કરો અથવા આ નંબર પર કોલ કરો: +91 80009 51663.\n\n' +
      'આભાર — પટેલ સીસીટીવી કેમેરા વર્લ્ડ',
    spoken:
      'સાવધાની નોટ! કોઈ પણ અમારા નામનો દુરુપયોગ કરી શકે છે. ' +
      'કૃપા કરીને કોઈનો પણ ફોન કે વોટ્સએપ મેસેજ આવે તો પહેલા નંબરની તપાસ કરો અને પછી જ વિશ્વાસ કરો. ' +
      'અમારા સત્તાવાર નંબર +91 74830 05197 સિવાયના કોઈપણ નંબરથી મેસેજ આવે તો પહેલા કન્ફર્મ કરી લો. ' +
      'જો કોઈ ફ્રોડ થાય તો તરત જ નજીકના પોલીસ સ્ટેશનમાં ફરિયાદ કરો અથવા 80009 51663 પર કોલ કરો. તમારો ખૂબ ખૂબ આભાર!',
  },
  mr: {
    title: 'सावधानता सूचना (सुरक्षा अलर्ट)',
    subtitle: 'लॉगिननंतर महत्त्वाची सुरक्षा सूचना',
    written:
      'सावधानता सूचना: कोणीही आमच्या नावाचा गैरवापर करू शकतो, त्यामुळे कृपया नंबरची खात्री केल्यावरच कोणाचाही फोन किंवा व्हॉट्सॲप मेसेज आल्यास विश्वास ठेवा.\n\n' +
      'खाली दिलेल्या +91 74830 05197 या नंबरव्यतिरिक्त दुसऱ्या कोणत्याही नंबरवरून मेसेज आल्यास, आधी तो फ्रॉड नाही ना याची खात्री करा.\n\n' +
      'आणि जर फ्रॉड झाला तर जवळच्या पोलीस ठाण्यात तक्रार नोंदवा किंवा या नंबरवर संपर्क करा: +91 80009 51663.\n\n' +
      'धन्यवाद — पटेल सीसीटीव्ही कॅमेरा वर्ल्ड',
    spoken:
      'सावधानता सूचना! कोणीही आमच्या नावाचा गैरवापर करू शकतो. ' +
      'कृपया कोणत्याही फोन किंवा व्हॉट्सॲप मेसेजवर आधी नंबरची खात्री करा आणि मगच विश्वास ठेवा. ' +
      'आमच्या अधिकृत नंबर +91 74830 05197 व्यतिरिक्त इतर कोणत्याही नंबरवरून मेसेज आल्यास आधी खात्री करून घ्या. ' +
      'फ्रॉड झाल्यास ताबडतोब जवळच्या पोलीस ठाण्यात तक्रार करा किंवा हेल्पलाईन 80009 51663 वर कॉल करा. धन्यवाद!',
  },
  kn: {
    title: 'ಎಚ್ಚರಿಕೆ ಸೂಚನೆ (ಸುರಕ್ಷತಾ ಎಚ್ಚರಿಕೆ)',
    subtitle: 'ಲಾಗಿನ್ ನಂತರ ಪ್ರಮುಖ ಭದ್ರತಾ ಸೂಚನೆ',
    written:
      'ಎಚ್ಚರಿಕೆ ಸೂಚನೆ: ಯಾರಾದರೂ ನಮ್ಮ ಹೆಸರನ್ನು ದುರುಪಯೋಗಪಡಿಸಿಕೊಳ್ಳಬಹುದು, ಆದ್ದರಿಂದ ಯಾವುದೇ ಕರೆ ಅಥವಾ ವಾಟ್ಸಾಪ್ ಸಂದೇಶ ಬಂದಾಗ ದಯವಿಟ್ಟು ಸಂಖ್ಯೆಗಳನ್ನು ಪರಿಶೀಲಿಸಿ ನಂತರವೇ ನಂಬಿರಿ.\n\n' +
      'ಕೆಳಗೆ ನೀಡಲಾದ ಅಧಿಕೃತ ಸಂಖ್ಯೆ +91 74830 05197 ಹೊರತುಪಡಿಸಿ ಬೇರೆ ಯಾವುದೇ ಸಂಖ್ಯೆಯಿಂದ ಸಂದೇಶ ಬಂದರೆ, ಅದು ವಂಚನೆಯಲ್ಲ ಎಂದು ಮೊದಲು ಖಚಿತಪಡಿಸಿಕೊಳ್ಳಿ.\n\n' +
      'ಯಾವುದೇ ವಂಚನೆ ಸಂಭವಿಸಿದರೆ ತಕ್ಷಣ ಹತ್ತಿರದ ಪೊಲೀಸ್ ಠಾಣೆಗೆ ದೂರು ನೀಡಿ ಅಥವಾ ಈ ಸಂಖ್ಯೆಗೆ ಕರೆ ಮಾಡಿ: +91 80009 51663.\n\n' +
      'ಧನ್ಯವಾದಗಳು — ಪಟೇಲ್ ಸಿಸಿಟಿವಿ ಕ್ಯಾಮೆರಾ ವರ್ಲ್ಡ್',
    spoken:
      'ಎಚ್ಚರಿಕೆ ಸೂಚನೆ! ಯಾರಾದರೂ ನಮ್ಮ ಹೆಸರನ್ನು ದುರುಪಯೋಗಪಡಿಸಿಕೊಳ್ಳಬಹುದು. ' +
      'ಯಾವುದೇ ಕರೆ ಅಥವಾ ವಾಟ್ಸಾಪ್ ಸಂದೇಶ ಬಂದಾಗ ದಯವಿಟ್ಟು ಸಂಖ್ಯೆಯನ್ನು ಪರಿಶೀಲಿಸಿ ನಂತರವೇ ನಂಬಿರಿ. ' +
      'ನಮ್ಮ ಅಧಿಕೃತ ಸಂಖ್ಯೆ +91 74830 05197 ಬಿಟ್ಟು ಬೇರೆ ಯಾವುದೇ ಸಂಖ್ಯೆಯಿಂದ ಸಂದೇಶ ಬಂದರೆ ಮೊದಲು ಪರಿಶೀಲಿಸಿ. ' +
      'ವಂಚನೆಯಾದರೆ ತಕ್ಷಣ ಹತ್ತಿರದ ಪೊಲೀಸ್ ಠಾಣೆಗೆ ದೂರು ನೀಡಿ ಅಥವಾ 80009 51663 ಗೆ ಕರೆ ಮಾಡಿ. ಧನ್ಯವಾದಗಳು!',
  },
  ta: {
    title: 'பாதுகாப்பு எச்சரிக்கை (Security Alert)',
    subtitle: 'உள்நுழைந்த பின் மிக முக்கியமான பாதுகாப்பு தகவல்',
    written:
      'பாதுகாப்பு எச்சரிக்கை: யாராவது எங்கள் பெயரை தவறாகப் பயன்படுத்தலாம், எனவே ஏதேனும் அழைப்பு அல்லது வாட்ஸ்அப் செய்தி வந்தால் எண்களை சரிபார்த்த பின்னரே நம்பவும்.\n\n' +
      'கீழே கொடுக்கப்பட்டுள்ள +91 74830 05197 என்ற அதிகாரப்பூர்வ எண் தவிர வேறு ஏதேனும் எண்ணிலிருந்து செய்தி வந்தால், அது மோசடி அல்ல என்பதை உறுதிப்படுத்தவும்.\n\n' +
      'மோசடி நடந்தால் உடனடியாக அருகிலுள்ள காவல் நிலையத்தில் புகார் அளிக்கவும் அல்லது இந்த எண்ணிற்கு அழைக்கவும்: +91 80009 51663.\n\n' +
      'நன்றி — பட்டேல் CCTV கேமரா வேர்ல்ட்',
    spoken:
      'பாதுகாப்பு எச்சரிக்கை! யாராவது எங்கள் பெயரை தவறாகப் பயன்படுத்த வாய்ப்புள்ளது. ' +
      'ஏதேனும் அழைப்பு அல்லது வாட்ஸ்அப் செய்தி வந்தால் எண்களை சரிபார்த்து பிறகு நம்புங்கள். ' +
      'எங்கள் அதிகாரப்பூர்வ எண் +91 74830 05197 தவிர வேறு எண்ணில் இருந்து செய்தி வந்தால் உறுதிப்படுத்தவும். ' +
      'மோசடி நடந்தால் அருகில் உள்ள காவல் நிலையத்தை அணுகவும் அல்லது 80009 51663 என்ற எண்ணை அழைக்கவும். மிக்க நன்றி!',
  },
  te: {
    title: 'భద్రతా హెచ్చరిక (Security Caution Alert)',
    subtitle: 'లాగిన్ తర్వాత ముఖ్యమైన భద్రతా నోటీసు',
    written:
      'భద్రతా హెచ్చరిక: మా పేరును ఎవరైనా దుర్వినియోగం చేయవచ్చు, కాబట్టి ఏదైనా ఫోన్ కాల్ లేదా వాట్సాప్ సందేశం వచ్చినప్పుడు నంబర్లను ధృవీకరించిన తర్వాతే నమ్మండి.\n\n' +
      'మా అధికారిక నంబర్ +91 74830 05197 కాకుండా వేరే నంబర్ నుండి మెసేజ్ వస్తే మోసం కాదని నిర్ధారించుకోండి.\n\n' +
      'మోసం జరిగితే వెంటనే సమీపంలోని పోలీస్ స్టేషన్‌లో ఫిర్యాదు చేయండి లేదా కాల్ చేయండి: +91 80009 51663.\n\n' +
      'ధన్యవాదాలు — పటేల్ CCTV కెమెరా వరల్డ్',
    spoken:
      'భద్రతా హెచ్చరిక! ఎవరైనా మా పేరును దుర్వినియోగం చేయవచ్చు. దయచేసి ఏదైనా ఫోన్ కాల్ లేదా వాట్సాప్ మెసేజ్ వచ్చినప్పుడు ముందుగా నంబర్లను తనిఖీ చేసి నమ్మండి. మా అధికారిక నంబర్ +91 74830 05197 కాకుండా ఇతర నంబర్ వస్తే నిర్ధారించుకోండి. మోసం జరిగితే పోలీసులకు ఫిర్యాదు చేయండి లేదా 80009 51663 కి కాల్ చేయండి. ధన్యవాదాలు!',
  },
  ml: {
    title: 'സുരക്ഷാ മുന്നറിയിപ്പ് (Security Caution Alert)',
    subtitle: 'ലോഗിൻ ചെയ്ത ശേഷമുള്ള പ്രധാന അറിയിപ്പ്',
    written:
      'സുരക്ഷാ മുന്നറിയിപ്പ്: ആരെങ്കിലും ഞങ്ങളുടെ പേര് ദുരുപയോഗം ചെയ്തേക്കാം, അതിനാൽ ഫോൺ കോളോ വാട്ട്‌സ്ആപ്പ് സന്ദേശമോ ലഭിച്ചാൽ നമ്പറുകൾ പരിശോധിച്ച് മാത്രം വിശ്വസിക്കുക.\n\n' +
      'ഞങ്ങളുടെ ഔദ്യോഗിക നമ്പറായ +91 74830 05197 അല്ലാതെ മറ്റൊരു നമ്പറിൽ നിന്ന് സന്ദേശം വന്നാൽ തട്ടിപ്പല്ലെന്ന് ഉറപ്പാക്കുക.\n\n' +
      'തട്ടിപ്പ് ഉണ്ടായാൽ അടുത്തുള്ള പോലീസ് സ്റ്റേഷനിൽ പരാതിപ്പെടുക അല്ലെങ്കിൽ വിളിക്കുക: +91 80009 51663.\n\n' +
      'നന്ദി — പട്ടേൽ CCTV ക്യാമറ വേൾഡ്',
    spoken:
      'സുരക്ഷാ മുന്നറിയിപ്പ്! ആരെങ്കിലും ഞങ്ങളുടെ പേര് ദുരുപയോഗം ചെയ്തേക്കാം. വാട്ട്‌സ്ആപ്പ് സന്ദേശമോ കോളോ വന്നാൽ നമ്പർ പരിശോധിച്ച് മാത്രം വിശ്വസിക്കുക. ഞങ്ങളുടെ ഔദ്യോഗിക നമ്പർ +91 74830 05197 അല്ലാതെ വേറെ നമ്പറിൽ നിന്ന് സന്ദേശം വന്നാൽ ഉറപ്പാക്കുക. തട്ടിപ്പുണ്ടായാൽ പോലീസിനെ സമീപിക്കുക അല്ലെങ്കിൽ 80009 51663 വിളിക്കുക. നന്ദി!',
  },
};

/**
 * Security Warning Speech for Login
 * Speaks the anti-fraud notice verbatim in sweet, crystal-clear female voice in the chosen language
 */
export const speakLoginSecurityWarningAudio = async (
  selectedLang: Language = 'hi',
  onStart?: () => void,
  onEnd?: () => void
): Promise<() => void> => {
  if (typeof window === 'undefined') return () => {};

  try {
    if (!('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported on this browser.');
      onEnd?.();
      return () => {};
    }

    window.speechSynthesis.cancel();
    isCurrentlySpeaking = true;
    notifyState(true, selectedLang);

    await playGentleWelcomeChime();
    onStart?.();

    const warningData = SECURITY_WARNING_TEXTS[selectedLang] || SECURITY_WARNING_TEXTS.hi;
    const warningSpokenText = warningData.spoken;

    const warningUtterance = new SpeechSynthesisUtterance(warningSpokenText);
    const voices = window.speechSynthesis.getVoices();
    const femaleVoice = getBestFemaleVoice(voices, selectedLang);

    if (femaleVoice) {
      warningUtterance.voice = femaleVoice;
      warningUtterance.lang = femaleVoice.lang || `${selectedLang}-IN`;
    } else {
      warningUtterance.lang = `${selectedLang}-IN`;
    }

    // Tuning for a very sweet, soft, natural and melodious female voice
    warningUtterance.rate = 0.88;   // Gentle, clear, calm speed
    warningUtterance.pitch = 1.20;  // Sweet, friendly, feminine tone
    warningUtterance.volume = 1.0;  // Clear volume

    warningUtterance.onend = () => {
      isCurrentlySpeaking = false;
      notifyState(false, null);
      onEnd?.();
    };

    warningUtterance.onerror = () => {
      isCurrentlySpeaking = false;
      notifyState(false, null);
      onEnd?.();
    };

    const startSpeak = () => {
      try {
        if (!window.speechSynthesis.speaking) {
          window.speechSynthesis.speak(warningUtterance);
        }
      } catch (err) {
        console.warn('Failed to speak warning:', err);
        onEnd?.();
      }
    };

    if (voices && voices.length > 0) {
      startSpeak();
    } else {
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.onvoiceschanged = null;
        const freshVoices = window.speechSynthesis.getVoices();
        const freshVoice = getBestFemaleVoice(freshVoices, selectedLang);
        if (freshVoice) {
          warningUtterance.voice = freshVoice;
          warningUtterance.lang = freshVoice.lang || `${selectedLang}-IN`;
        }
        startSpeak();
      };
      setTimeout(startSpeak, 200);
    }

    return () => {
      window.speechSynthesis.cancel();
      isCurrentlySpeaking = false;
      notifyState(false, null);
    };
  } catch (err) {
    console.warn('Security warning speech exception:', err);
    isCurrentlySpeaking = false;
    notifyState(false, null);
    onEnd?.();
    return () => {};
  }
};

/**
 * Main Welcome Speech Function
 * Plays gentle chime, then speaks the welcome message in the selected language,
 * followed by English if the selected language is not English.
 */
export const speakWelcomeAudio = async (selectedLang: Language = 'hi') => {
  if (typeof window === 'undefined') return;

  try {
    if (!('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported on this browser.');
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    isCurrentlySpeaking = true;
    notifyState(true, selectedLang);

    // 1. Play soft entrance chime
    await playGentleWelcomeChime();

    const startSpeechChain = () => {
      const voices = window.speechSynthesis.getVoices();

      // Step 1: Native Language Welcome Message
      const nativeText = WELCOME_MESSAGES[selectedLang] || WELCOME_MESSAGES.hi;
      const nativeUtterance = new SpeechSynthesisUtterance(nativeText);
      
      const nativeVoice = getBestFemaleVoice(voices, selectedLang);
      if (nativeVoice) {
        nativeUtterance.voice = nativeVoice;
        nativeUtterance.lang = nativeVoice.lang || `${selectedLang}-IN`;
      } else {
        nativeUtterance.lang = `${selectedLang}-IN`;
      }

      // Sweet, gentle, natural human pitch and tempo
      nativeUtterance.rate = 0.88;
      nativeUtterance.pitch = 1.15;
      nativeUtterance.volume = 1.0;

      // Step 2: English Speech (If selected language is not already English)
      const englishText = 'Welcome to Patel CCTV Camera World.';
      const englishUtterance = new SpeechSynthesisUtterance(englishText);
      
      const englishVoice = getBestFemaleVoice(voices, 'en');
      if (englishVoice) {
        englishUtterance.voice = englishVoice;
        englishUtterance.lang = englishVoice.lang || 'en-IN';
      } else {
        englishUtterance.lang = 'en-IN';
      }

      englishUtterance.rate = 0.88;
      englishUtterance.pitch = 1.12;
      englishUtterance.volume = 1.0;

      if (selectedLang !== 'en') {
        nativeUtterance.onend = () => {
          if (!isCurrentlySpeaking) return;
          notifyState(true, 'en');
          setTimeout(() => {
            if (!isCurrentlySpeaking) return;
            try {
              window.speechSynthesis.speak(englishUtterance);
            } catch (e) {
              console.warn('English speech error:', e);
              isCurrentlySpeaking = false;
              notifyState(false, null);
            }
          }, 350);
        };

        nativeUtterance.onerror = () => {
          notifyState(true, 'en');
          try {
            window.speechSynthesis.speak(englishUtterance);
          } catch {
            isCurrentlySpeaking = false;
            notifyState(false, null);
          }
        };

        englishUtterance.onend = () => {
          isCurrentlySpeaking = false;
          notifyState(false, null);
        };

        englishUtterance.onerror = () => {
          isCurrentlySpeaking = false;
          notifyState(false, null);
        };
      } else {
        nativeUtterance.onend = () => {
          isCurrentlySpeaking = false;
          notifyState(false, null);
        };
        nativeUtterance.onerror = () => {
          isCurrentlySpeaking = false;
          notifyState(false, null);
        };
      }

      // Speak native welcome
      window.speechSynthesis.speak(nativeUtterance);
    };

    const availableVoices = window.speechSynthesis.getVoices();
    if (availableVoices && availableVoices.length > 0) {
      startSpeechChain();
    } else {
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.onvoiceschanged = null;
        startSpeechChain();
      };
      setTimeout(() => {
        if (isCurrentlySpeaking) {
          startSpeechChain();
        }
      }, 250);
    }
  } catch (err) {
    console.warn('Speech synthesis exception:', err);
    isCurrentlySpeaking = false;
    notifyState(false, null);
  }
};

/**
 * Short custom announcement / notification voice speaker
 */
export const speakNotification = (text: string, lang: Language = 'hi'): void => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const voice = getBestFemaleVoice(voices, lang);
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang || `${lang}-IN`;
    } else {
      utterance.lang = `${lang}-IN`;
    }
    utterance.rate = 0.92;
    utterance.pitch = 1.1;
    utterance.volume = 1.0;
    window.speechSynthesis.speak(utterance);
  } catch (e) {
    console.debug('Notification speech note:', e);
  }
};

