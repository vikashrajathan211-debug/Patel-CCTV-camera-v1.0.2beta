import React, { useState } from 'react';
import { 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  ShieldCheck, 
  PhoneCall, 
  Send, 
  CheckCircle2, 
  Camera, 
  HardDrive, 
  Wifi, 
  Layers
} from 'lucide-react';
import { Language } from '../types';
import { STORE_INFO } from '../data/products';

interface FlipkartQuestionsProps {
  language: Language;
}

interface QAItem {
  id: string;
  q: string;
  qHi: string;
  a: string;
  aHi: string;
  verifiedBadge?: boolean;
}

interface QAGroup {
  id: string;
  title: string;
  titleHi: string;
  icon: React.ComponentType<{ className?: string }>;
  questions: [QAItem, QAItem]; // Strictly 2 questions per section as requested!
}

export const FlipkartQuestions: React.FC<FlipkartQuestionsProps> = ({ language }) => {
  const isHi = language === 'hi';
  const [activeTab, setActiveTab] = useState<string>('cctv_install');
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({
    'q_cctv_1': true, // Keep first open by default
  });

  const toggleAccordion = (id: string) => {
    setOpenItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // 2-2 Questions categorized Flipkart Style!
  const qaGroups: QAGroup[] = [
    {
      id: 'cctv_install',
      title: 'Installation & Setup',
      titleHi: 'इंस्टॉलेशन व फिटिंग (2 सवाल)',
      icon: Camera,
      questions: [
        {
          id: 'q_cctv_1',
          q: 'Will your technician come to install the cameras at my home/shop?',
          qHi: 'क्या आपकी टीम घर/दुकान पर आकर कैमरा फिटिंग और वायरिंग करेगी?',
          a: 'Yes! Our certified CCTV technician team visits your location for complete installation, 3+1 copper cable routing, power connection, angle adjustment, and DVR configuration with full testing.',
          aHi: 'हाँ! हमारे अनुभवी तकनीशियन आपके पते पर आकर पूरी फिटिंग, 3+1 कॉपर वायरिंग, SMPS पावर कनेक्शन, सही एंगल सेटिंग और DVR टेस्टिंग सम्पूर्ण करके देते हैं।',
          verifiedBadge: true
        },
        {
          id: 'q_cctv_2',
          q: 'Can I get a free site survey before ordering to decide camera placements?',
          qHi: 'क्या खरीदने से पहले एक्सपर्ट आकर जगह देखकर सही सलाह (फ्री सर्वे) देंगे?',
          a: 'Absolutely. You can click on "Free Site Survey" or message us on WhatsApp. Our technician will visit to calculate exact blind spots, wire route length, and recommend 2MP/3K/ColorVu cameras suitable for your budget.',
          aHi: 'बिल्कुल! आप "फ्री ऑनसाइट सर्वे" बुक कर सकते हैं। हमारे एक्सपर्ट आकर सही कैमरे (Dome/Bullet), वायरिंग की लंबाई और सही लोकेशन का मुफ़्त मुआयना करेंगे।',
          verifiedBadge: true
        }
      ]
    },
    {
      id: 'live_app',
      title: 'Phone Live View',
      titleHi: 'मोबाइल लाइव व्यू (2 सवाल)',
      icon: Wifi,
      questions: [
        {
          id: 'q_app_1',
          q: 'Can I watch live video and recordings on my mobile phone from anywhere?',
          qHi: 'क्या मैं देश-विदेश में कहीं से भी अपने मोबाइल पर लाइव कैमरा देख सकता हूँ?',
          a: 'Yes! We configure official mobile apps (CP Plus gCMOB, Hik-Connect, DMSS) on your smartphones for 24/7 live multi-camera view, playback recording, 2-way audio intercom, and instant motion push notifications.',
          aHi: 'हाँ! आपके फ़ोन में कंपनी का ओरिजिनल ऐप (gCMOB / Hik-Connect / DMSS) चालू करके दिया जाता है जिससे आप कभी भी लाइव वीडियो, पुरानी रिकॉर्डिंग और मोशन अलर्ट देख सकते हैं।',
          verifiedBadge: true
        },
        {
          id: 'q_app_2',
          q: 'Is WiFi/Internet compulsory for CCTV cameras to record video?',
          qHi: 'क्या कैमरा रिकॉर्डिंग के लिए 24 घंटे इंटरनेट/वाईफाई होना ज़रूरी है?',
          a: 'No! Cameras and DVR continuously record 24x7 to the surveillance hard disk even without any internet. Internet/WiFi is only needed when you want to view live video remotely on your mobile phone.',
          aHi: 'नहीं! बिना इंटरनेट के भी सभी कैमरे हार्ड डिस्क में 24 घंटे लगातार रिकॉर्डिंग करते रहते हैं। इंटरनेट की ज़रूरत सिर्फ़ तब पड़ती है जब आपको बाहर से मोबाइल पर लाइव देखना हो।',
          verifiedBadge: true
        }
      ]
    },
    {
      id: 'storage_hdd',
      title: 'Storage & Backup',
      titleHi: 'हार्ड डिस्क व बैकअप (2 सवाल)',
      icon: HardDrive,
      questions: [
        {
          id: 'q_hdd_1',
          q: 'How many days of video recording will a 1TB / 2TB hard disk store?',
          qHi: '1TB और 2TB हार्ड डिस्क में कितने दिनों की रिकॉर्डिंग सुरक्षित रहती है?',
          a: 'With modern H.265+ compression: 4 cameras on 1TB store ~15-20 days; on 2TB store ~30-40 days. Once full, the DVR automatically loops and overwrites the oldest days without needing manual deletion.',
          aHi: 'H.265+ तकनीक के साथ: 4 कैमरों में 1TB हार्ड डिस्क पर लगभग 15-20 दिन और 2TB पर लगभग 30-40 दिन की रिकॉर्डिंग रहती है। फुल होने पर पुरानी रिकॉर्डिंग अपने-आप ऑटो-डिलीट होकर नई बनती रहती है।',
          verifiedBadge: true
        },
        {
          id: 'q_hdd_2',
          q: 'Do you provide normal computer hard disks or genuine CCTV surveillance drives?',
          qHi: 'क्या आप नॉर्मल कंप्यूटर हार्ड डिस्क देते हैं या स्पेशल CCTV सर्विलांस ड्राइव?',
          a: 'We strictly supply 100% genuine Western Digital (WD) Purple and Seagate SkyHawk 24/7 surveillance-grade hard drives with official 3-Year replacement warranty, designed for continuous round-the-clock write cycles.',
          aHi: 'हम केवल 100% ओरिजिनल WD Purple और Seagate SkyHawk सर्विलांस हार्ड डिस्क ही देते हैं, जो 24x7 लगातार रिकॉर्डिंग के लिए बनी हैं और 3 साल की रिप्लेसमेंट वारंटी के साथ आती हैं।',
          verifiedBadge: true
        }
      ]
    },
    {
      id: 'warranty_bill',
      title: 'Warranty & GST',
      titleHi: 'वारंटी एवं पक्का बिल (2 सवाल)',
      icon: ShieldCheck,
      questions: [
        {
          id: 'q_war_1',
          q: 'What warranty is provided and what happens if a camera encounters an issue?',
          qHi: 'कैमरे और DVR पर कितनी वारंटी मिलती है और खराबी आने पर क्या होगा?',
          a: 'All CP Plus, Hikvision, and Dahua cameras/DVRs carry 2-Year official manufacturer replacement warranty, and WD Purple HDDs carry 3-Year warranty. Our local support team assists with prompt service.',
          aHi: 'सभी CP Plus, Hikvision और Dahua कैमरों व DVR पर 2 साल की कंपनी वारंटी और हार्ड डिस्क पर 3 साल की वारंटी मिलती है। कोई भी खराबी आने पर त्वरित रिप्लेसमेंट व सर्विस सहायता दी जाती है।',
          verifiedBadge: true
        },
        {
          id: 'q_war_2',
          q: 'Will I get an official GST tax invoice for business expense and ITC claim?',
          qHi: 'क्या मुझे दुकान/ऑफिस के लिए 18% GST वाला पक्का टैक्स बिल मिलेगा?',
          a: 'Yes! Every purchase and installation receives a formal GST tax invoice with our GSTIN mentioned, allowing commercial shops and enterprises to claim complete Input Tax Credit (ITC).',
          aHi: 'हाँ! हर ऑर्डर पर आपको GSTIN सहित पक्का टैक्स इनवॉइस मिलता है, जिससे आपकी फर्म या दुकान 18% ITC इनपुट क्रेडिट का पूरा क्लेम ले सकती है।',
          verifiedBadge: true
        }
      ]
    }
  ];

  const currentGroup = qaGroups.find(g => g.id === activeTab) || qaGroups[0];

  return (
    <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 sm:p-7 space-y-6">
      {/* Flipkart Style Section Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center border border-amber-500/20">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
              <span>{isHi ? 'ग्राहकों के मुख्य सवाल-जवाब (FAQ)' : 'Customer Questions & Answers'}</span>
              <span className="bg-blue-100 text-blue-800 text-[11px] font-bold px-2 py-0.5 rounded-full">
                {isHi ? '2-2 सवाल ग्रुप' : '2 Questions per Category'}
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              {isHi
                ? 'कैमरा फिटिंग, मोबाइल ऐप, हार्ड डिस्क और वारंटी से जुड़े प्रमुख प्रश्नों के स्पष्ट उत्तर'
                : 'Flipkart-style verified answers for installation, remote app, storage & warranty'}
            </p>
          </div>
        </div>

        {/* Quick WhatsApp Ask Action */}
        <a
          href={`https://wa.me/${STORE_INFO.whatsappNumber}?text=${encodeURIComponent('Hello Patel CCTV camera, I have a question about CCTV cameras.')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold px-3.5 py-2 rounded-xl transition"
        >
          <Send className="w-3.5 h-3.5 text-emerald-600" />
          <span>{isHi ? 'अपना सवाल पूछें' : 'Ask Any Question'}</span>
        </a>
      </div>

      {/* Category Pills Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
        {qaGroups.map((group) => {
          const Icon = group.icon;
          const isActive = group.id === activeTab;
          return (
            <button
              key={group.id}
              onClick={() => setActiveTab(group.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                isActive
                  ? 'bg-slate-900 text-white shadow-md shadow-slate-900/20'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
              <span>{isHi ? group.titleHi : group.title}</span>
            </button>
          );
        })}
      </div>

      {/* 2-by-2 Questions Display Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {currentGroup.questions.map((item, idx) => {
          const isOpen = !!openItems[item.id];
          return (
            <div
              key={item.id}
              className={`rounded-2xl border transition-all duration-200 ${
                isOpen 
                  ? 'bg-slate-50/80 border-blue-300 shadow-sm' 
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              {/* Question Header */}
              <button
                onClick={() => toggleAccordion(item.id)}
                className="w-full p-4 text-left flex items-start justify-between gap-3 cursor-pointer"
              >
                <div className="flex items-start gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                    Q{idx + 1}
                  </span>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                      {isHi ? item.qHi : item.q}
                    </h4>
                    {item.verifiedBadge && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 mt-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>{isHi ? 'सत्यापित उत्तर (Patel CCTV Expert)' : 'Verified by CCTV Specialist'}</span>
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-slate-400 shrink-0 mt-1">
                  {isOpen ? <ChevronUp className="w-4 h-4 text-blue-600" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>

              {/* Answer Content */}
              {isOpen && (
                <div className="px-4 pb-4 pt-1 text-xs sm:text-sm text-slate-700 leading-relaxed border-t border-slate-200/60 mt-1 space-y-2">
                  <p className="bg-white p-3 rounded-xl border border-slate-200 text-slate-800">
                    <strong className="text-blue-700 block mb-1">
                      {isHi ? 'उत्तर:' : 'Answer:'}
                    </strong>
                    {isHi ? item.aHi : item.a}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
