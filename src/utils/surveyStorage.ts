import { SiteVisitBooking, SiteVisitRequest } from '../types';

const STORAGE_KEY = 'patel_cctv_survey_bookings_v1';
const ACTIVE_CUSTOMER_SURVEY_KEY = 'patel_cctv_active_customer_survey_id';

// Default initial dummy / sample bookings if empty (so store owner can test approvals immediately)
const SAMPLE_INITIAL_BOOKINGS: SiteVisitBooking[] = [
  {
    id: 'SURV-7842',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    fullName: 'राहुल पटेल (Rahul Patel)',
    phoneNumber: '9876543210',
    placeName: 'पटेल किराना एवं जनरल स्टोर (Patel Kirana)',
    placeType: 'shop',
    city: 'Morbi (मोरबी)',
    pincode: '363641',
    landmark: 'हनुमान मंदिर के पास, मेन मार्केट',
    fullAddress: 'दुकान नं. 4, गांधी चौक',
    serviceType: 'site_survey',
    cameraCount: 4,
    preferredDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    preferredTimeSlot: 'morning',
    notes: '24/7 नाइट विजन और माइक वाले कैमरे चाहिए।',
    status: 'pending',
  }
];

export const getStoredSurveyBookings = (): SiteVisitBooking[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE_INITIAL_BOOKINGS));
      return SAMPLE_INITIAL_BOOKINGS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load survey bookings from storage:', e);
    return SAMPLE_INITIAL_BOOKINGS;
  }
};

export const saveSurveyBooking = (request: SiteVisitRequest): SiteVisitBooking => {
  const existing = getStoredSurveyBookings();
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const bookingId = `SURV-${randomNum}`;

  const newBooking: SiteVisitBooking = {
    ...request,
    id: bookingId,
    createdAt: new Date().toISOString(),
    status: 'pending',
  };

  const updated = [newBooking, ...existing];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    localStorage.setItem(ACTIVE_CUSTOMER_SURVEY_KEY, bookingId);
    window.dispatchEvent(new CustomEvent('cctv_survey_updated', { detail: { bookingId, status: 'pending' } }));
  } catch (e) {
    console.error('Failed to save survey booking:', e);
  }

  return newBooking;
};

export const getActiveCustomerSurveyId = (): string | null => {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(ACTIVE_CUSTOMER_SURVEY_KEY);
  } catch {
    return null;
  }
};

export const setActiveCustomerSurveyId = (id: string) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ACTIVE_CUSTOMER_SURVEY_KEY, id);
    window.dispatchEvent(new CustomEvent('cctv_survey_updated', { detail: { bookingId: id } }));
  } catch (e) {
    console.error(e);
  }
};

export const getSurveyBookingById = (id: string): SiteVisitBooking | null => {
  const bookings = getStoredSurveyBookings();
  return bookings.find(b => b.id.toLowerCase() === id.trim().toLowerCase()) || null;
};

export const approveSurveyBooking = (
  id: string,
  assignedEngineer = 'इंजीनियर जिग्नेश पटेल (Senior Field Tech)',
  engineerPhone = '7483005197',
  adminNote = 'फ्री साइट सर्वे स्वीकृत। इंजीनियर नियत समय पर लोकेशन पर पहुंचेगा।'
): SiteVisitBooking | null => {
  const bookings = getStoredSurveyBookings();
  let approvedItem: SiteVisitBooking | null = null;

  const updated = bookings.map(item => {
    if (item.id.toLowerCase() === id.trim().toLowerCase()) {
      approvedItem = {
        ...item,
        status: 'approved',
        approvedAt: new Date().toISOString(),
        assignedEngineer,
        engineerPhone,
        adminNote,
      };
      return approvedItem;
    }
    return item;
  });

  if (approvedItem) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('cctv_survey_updated', { detail: { bookingId: id, status: 'approved' } }));
    } catch (e) {
      console.error(e);
    }
  }

  return approvedItem;
};

export const getPendingSurveyCount = (): number => {
  const bookings = getStoredSurveyBookings();
  return bookings.filter(b => b.status === 'pending').length;
};

// Generates customer SMS / WhatsApp approval confirmation message link
export const generateApprovalCustomerNotification = (booking: SiteVisitBooking, appBaseUrl?: string) => {
  const baseUrl = appBaseUrl || (typeof window !== 'undefined' ? window.location.origin + window.location.pathname : '');
  const trackLink = `${baseUrl}?track_survey=${booking.id}`;

  const messageText = 
    `🎉 *YOUR REQUEST IS SUCCESSFUL - SURVEY APPROVED!* \n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `नमस्ते *${booking.fullName}* जी,\n` +
    `पटेल सीसीटीवी कैमरा वर्ल्ड (Patel CCTV Camera World) द्वारा आपका *फ्री साइट सर्वे (Free Site Survey)* अप्रूव (OK) कर दिया गया है।\n\n` +
    `📌 *बुकिंग आईडी (Booking ID):* ${booking.id}\n` +
    `🏢 *साइट स्थल (Place):* ${booking.placeName}\n` +
    `🏙️ *शहर व पिन:* ${booking.city} (PIN: ${booking.pincode})\n` +
    `🚩 *लैंडमार्क:* ${booking.landmark}\n` +
    `📷 *कैमरे:* ${booking.cameraCount} कैमरे सेटअप सर्वे\n` +
    `🗓️ *सर्वे तारीख:* ${booking.preferredDate || 'आज/कल में'}\n` +
    `👨‍🔧 *असाइंड तकनीशियन:* ${booking.assignedEngineer || 'सीनियर फील्ड इंजीनियर'}\n` +
    `📞 *हेल्पलाइन:* +91 ${booking.engineerPhone || '7483005197'}\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `🔗 *अपनी सर्वे रिक्वेस्ट की स्थिति देखें / Track Online:*\n` +
    `${trackLink}\n\n` +
    `✅ *Note:* "YOUR REQUEST IS SUCCESSFUL. OUR ENGINEER WILL VISIT YOUR SITE SOON."`;

  const cleanPhone = booking.phoneNumber.replace(/\D/g, '');
  const targetWhatsapp = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

  const whatsappUrl = `https://wa.me/${targetWhatsapp}?text=${encodeURIComponent(messageText)}`;
  const smsUrl = `sms:+91${cleanPhone}?body=${encodeURIComponent(`Patel CCTV: YOUR REQUEST IS SUCCESSFUL. Free survey ${booking.id} is APPROVED for ${booking.placeName}. Check status: ${trackLink}`)}`;

  return {
    messageText,
    whatsappUrl,
    smsUrl,
    trackLink,
  };
};
