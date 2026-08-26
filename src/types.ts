export type ProductCategory = 
  | 'all'
  | 'cctv'
  | 'dvr'
  | 'hdd'
  | 'combo'
  | 'wifi_smart'
  | 'accessories';

export type Brand = 'CP Plus' | 'Hikvision' | 'Dahua' | 'Western Digital' | 'Seagate' | 'TP-Link / Tapo' | 'Patel Special';

export type Language = 
  | 'en' // English
  | 'hi' // Hindi (हिन्दी)
  | 'gu' // Gujarati (ગુજરાતી)
  | 'mr' // Marathi (मराठी)
  | 'kn' // Kannada (ಕನ್ನಡ)
  | 'ta' // Tamil (தமிழ்)
  | 'te' // Telugu (తెలుగు)
  | 'ml'; // Malayalam (മലയാളം)

export interface StoreInfo {
  name: string;
  nameHi: string;
  tagline: string;
  taglineHi: string;
  phone: string;
  whatsappNumber: string;
  email: string;
  address: string;
  addressHi: string;
  workingHours: string;
  workingHoursHi: string;
  gstNumber: string;
  brandsSupported: string[];
  ownerName?: string;
}

export interface Product {
  id: string;
  name: string;
  nameHi: string;
  category: ProductCategory;
  brand: Brand;
  model: string;
  price: number;
  originalPrice: number;
  rating: number;
  reviewsCount: number;
  inStock: boolean;
  image: string;
  resolution?: string;
  cameraType?: 'dome' | 'bullet' | 'ptz' | 'wireless';
  channels?: number;
  capacity?: string;
  features: string[];
  featuresHi: string[];
  tags: string[];
  warranty: string;
  warrantyHi: string;
  description: string;
  descriptionHi: string;
  specs: Record<string, string>;
  isBestseller?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface EstimateConfig {
  premise: 'home' | 'shop' | 'office' | 'factory' | 'farmhouse';
  domeCount: number;
  bulletCount: number;
  cameraQuality: '2mp_hd' | '3k_colorvu' | '5mp_audio' | '4k_ultra';
  brandPreference: 'CP Plus' | 'Hikvision' | 'Dahua';
  storageSize: 'none' | '1TB' | '2TB' | '4TB' | '8TB';
  cableMeters: number;
  includeInstallation: boolean;
  includePowerSupply: boolean;
  includeConnectors: boolean;
  includeRack: boolean;
}

export type AccountType = 'buyer' | 'seller';

export interface CustomerUser {
  name: string;
  phone: string;
  city: string;
  state: string;
  pincode: string;
  address: string;
  landmark?: string;
  isLoggedIn: boolean;
  loggedInAt?: string;
  accountType?: AccountType; // 'buyer' (खरीदार - सिर्फ खरीद सकता है) | 'seller' (विक्रेता - बेच व खरीद दोनों सकता है)
  businessName?: string; // दुकान / फर्म का नाम (सेलर अकाउंट के लिए)
}

export interface CityInfo {
  name: string;
  nameHi: string;
  state: string;
  stateHi: string;
  defaultPincode: string;
  popular?: boolean;
}

export interface SiteVisitRequest {
  fullName: string;
  phoneNumber: string;
  placeName: string;
  placeType?: 'home' | 'shop' | 'office' | 'warehouse' | 'factory' | 'farmhouse' | 'other';
  city: string;
  pincode: string;
  landmark: string;
  fullAddress?: string;
  serviceType: 'new_installation' | 'system_upgrade' | 'annual_maintenance' | 'site_survey';
  cameraCount: number;
  preferredDate: string;
  preferredTimeSlot?: 'morning' | 'afternoon' | 'evening' | 'anytime';
  notes: string;
}

export interface SiteVisitBooking extends SiteVisitRequest {
  id: string;
  createdAt: string;
  status: 'pending' | 'approved' | 'in_progress' | 'completed' | 'rejected';
  approvedAt?: string;
  assignedEngineer?: string;
  engineerPhone?: string;
  adminNote?: string;
}

export type HelpCategory = 
  | 'fraud_alert'        // फ्रॉड / फर्जी कॉल व अनधिकृत व्यक्ति की शिकायत
  | 'warranty_problem'   // वारंटी चेक व क्लेम में समस्या
  | 'replacement_issue'  // रिप्लेसमेंट व डिफेक्टिव प्रोडक्ट
  | 'tech_app_offline'   // मोबाइल ऐप ऑफलाइन व पासवर्ड रीसेट
  | 'installation_complaint' // इंस्टॉलेशन / टेक्नीशियन शिकायत
  | 'billing_payment';   // बिलिंग, इनवॉइस व पेमेंट

export interface HelpTicket {
  id: string;
  createdAt: string;
  fullName: string;
  phoneNumber: string;
  alternatePhone?: string;
  category: HelpCategory;
  subType: string;
  description: string;
  urgency: 'critical' | 'high' | 'medium';
  // Fraud specific fields
  suspectPhoneNumber?: string;
  suspectName?: string;
  fraudAmount?: string;
  incidentTime?: string;
  // Product / Warranty / Replacement fields
  productModel?: string;
  serialNumber?: string;
  purchaseDate?: string;
  invoiceNumber?: string;
  status: 'open' | 'investigating' | 'resolved' | 'escalated';
  resolutionNotes?: string;
}

export interface UserOrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  brand: string;
}

export interface UserOrderRecord {
  orderId: string;
  date: string;
  items: UserOrderItem[];
  totalAmount: number;
  status: 'placed' | 'confirmed' | 'dispatched' | 'delivered';
  paymentMethod: string;
}


