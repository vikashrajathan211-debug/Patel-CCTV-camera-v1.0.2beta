import { HelpTicket, HelpCategory } from '../types';

const STORAGE_KEY = 'cctv_help_tickets_v1';
const ACTIVE_CUSTOMER_TICKET_KEY = 'cctv_active_customer_ticket_id';

// Official verified Patel CCTV Staff Numbers
export const OFFICIAL_PHONE_NUMBERS = [
  {
    number: '8000951663',
    cleanNumber: '8000951663',
    name: 'Patel (Store Owner & Chief In-charge)',
    nameHi: 'पटेल (स्टोर ओनर एवं मुख्य संचालक)',
    designation: 'Authorized Store In-charge',
    designationHi: 'अधिकृत स्टोर संचालक',
    role: 'official_owner'
  },
  {
    number: '8000951664',
    cleanNumber: '8000951664',
    name: 'Patel CCTV Technical Support Desk',
    nameHi: 'पटेल सीसीटीवी टेक्निकल सपोर्ट डेस्क',
    designation: 'Official Technical Support',
    designationHi: 'अधिकृत तकनीकी सहायता',
    role: 'official_support'
  },
  {
    number: '9845012345',
    cleanNumber: '9845012345',
    name: 'Vikram Singh (Senior Field Engineer)',
    nameHi: 'विक्रम सिंह (सीनियर फील्ड इंजीनियर)',
    designation: 'Authorized Certified Installer',
    designationHi: 'अधिकृत सर्टिफाइड इंस्टॉलर',
    role: 'official_engineer'
  }
];

export const cleanPhone = (phone: string): string => {
  return phone.replace(/[^0-9]/g, '').slice(-10);
};

// Check if a caller or technician phone number is authentic or scam/fake
export const verifyCallerNumber = (inputPhone: string) => {
  const cleaned = cleanPhone(inputPhone);
  if (!cleaned || cleaned.length < 10) {
    return {
      isValidFormat: false,
      isOfficial: false,
      details: null
    };
  }

  const match = OFFICIAL_PHONE_NUMBERS.find(p => p.cleanNumber === cleaned);
  if (match) {
    return {
      isValidFormat: true,
      isOfficial: true,
      details: match
    };
  }

  return {
    isValidFormat: true,
    isOfficial: false,
    details: null
  };
};

const INITIAL_DEMO_TICKETS: HelpTicket[] = [
  {
    id: 'TKT-FRD-9102',
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    fullName: 'राजेश कुमार (Rajesh Kumar)',
    phoneNumber: '9845213456',
    category: 'fraud_alert',
    subType: 'अनधिकृत व्यक्ति द्वारा पटेल सीसीटीवी के नाम पर फर्जी कॉल / पेमेंट की मांग',
    urgency: 'critical',
    suspectPhoneNumber: '9988776655',
    suspectName: 'अज्ञात व्यक्ति (खुद को टेक्नीशियन बता रहा था)',
    fraudAmount: '₹2,500',
    incidentTime: 'आज दोपहर 1:30 बजे',
    description: 'एक अज्ञात नंबर (9988776655) से कॉल आया कि वह पटेल सीसीटीवी से बोल रहा है और 2500 रुपये एडवांस ऑनलाइन ट्रांसफर करने को कह रहा है। हमने पेमेंट नहीं की। कृपया जांच करें।',
    status: 'investigating',
    resolutionNotes: 'स्टोर ओनर द्वारा ग्राहक को वेरीफाई किया गया कि यह फर्जी नंबर था। ग्राहक का पैसा बच गया। नंबर को फ्रॉड लिस्ट में दर्ज किया गया।'
  },
  {
    id: 'TKT-WAR-4821',
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    fullName: 'संजय वर्मा (Sanjay Verma)',
    phoneNumber: '9741029384',
    category: 'warranty_problem',
    subType: '2/3 वर्ष ब्रांड वारंटी वेरिफिकेशन व इनवॉइस कॉपी',
    urgency: 'high',
    productModel: 'CP Plus 2.4MP 4-Camera Combo Kit (CP-UVR-0401E1-CS)',
    serialNumber: 'CP240987123A',
    purchaseDate: '2025-04-12',
    description: 'मेरा DVR का 1 साल पूरा हुआ है पर सर्विस सेंटर कह रहा है कि बिल लेकर आएं। मुझे मेरा ऑरिजिनल GST बिल कॉपी व्हाट्सएप पर चाहिए ताकि वारंटी क्लेम कर सकूं।',
    status: 'resolved',
    resolutionNotes: 'ग्राहक को ऑरिजिनल GST इनवॉइस PDF व्हाट्सएप पर भेज दी गई। सर्विस सेंटर में वारंटी स्वीकृत हो गई।'
  },
  {
    id: 'TKT-REP-1049',
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    fullName: 'अमित पटेल (Amit Patel)',
    phoneNumber: '9123456789',
    category: 'replacement_issue',
    subType: 'कैमरा लेंस धुंधला / नाइट विजन IR LED में समस्या',
    urgency: 'high',
    productModel: 'Hikvision 2MP Audio ColorVu Dome Camera',
    serialNumber: 'HK88910245',
    description: 'कैमरे की नाइट विजन LED रात में नहीं जल रही है और अंधेरे में इमेज नहीं आ रही। 7 दिन का रिप्लेसमेंट चाहिए।',
    status: 'resolved',
    resolutionNotes: 'टेक्नीशियन द्वारा नया पीस हैंड-टू-हैंड बदल दिया गया।'
  }
];

export const getStoredHelpTickets = (): HelpTicket[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DEMO_TICKETS));
      return INITIAL_DEMO_TICKETS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return INITIAL_DEMO_TICKETS;
  } catch (e) {
    console.error('Failed to parse help tickets from localStorage', e);
    return INITIAL_DEMO_TICKETS;
  }
};

export const saveHelpTicket = (ticketInput: Omit<HelpTicket, 'id' | 'createdAt' | 'status'>): HelpTicket => {
  const existing = getStoredHelpTickets();
  
  let prefix = 'TKT-HLP';
  if (ticketInput.category === 'fraud_alert') prefix = 'TKT-FRD';
  else if (ticketInput.category === 'warranty_problem') prefix = 'TKT-WAR';
  else if (ticketInput.category === 'replacement_issue') prefix = 'TKT-REP';
  else if (ticketInput.category === 'tech_app_offline') prefix = 'TKT-TECH';

  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const newId = `${prefix}-${randomNum}`;

  const newTicket: HelpTicket = {
    ...ticketInput,
    id: newId,
    createdAt: new Date().toISOString(),
    status: 'open'
  };

  const updated = [newTicket, ...existing];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    localStorage.setItem(ACTIVE_CUSTOMER_TICKET_KEY, newId);
    window.dispatchEvent(new CustomEvent('cctv_help_ticket_updated', { detail: { ticketId: newId } }));
  } catch (e) {
    console.error('Failed to save help ticket', e);
  }

  return newTicket;
};

export const getHelpTicketById = (id: string): HelpTicket | undefined => {
  const tickets = getStoredHelpTickets();
  return tickets.find(t => t.id.toLowerCase() === id.trim().toLowerCase());
};

export const updateHelpTicketStatus = (
  id: string, 
  status: HelpTicket['status'], 
  resolutionNotes?: string
): HelpTicket | null => {
  const tickets = getStoredHelpTickets();
  const index = tickets.findIndex(t => t.id.toLowerCase() === id.toLowerCase());
  if (index === -1) return null;

  tickets[index] = {
    ...tickets[index],
    status,
    resolutionNotes: resolutionNotes !== undefined ? resolutionNotes : tickets[index].resolutionNotes
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
    window.dispatchEvent(new CustomEvent('cctv_help_ticket_updated', { detail: { ticketId: id } }));
  } catch (e) {
    console.error('Failed to update ticket', e);
  }

  return tickets[index];
};

export const getActiveCustomerTicketId = (): string | null => {
  try {
    return localStorage.getItem(ACTIVE_CUSTOMER_TICKET_KEY);
  } catch {
    return null;
  }
};
