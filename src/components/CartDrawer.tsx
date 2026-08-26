import React, { useState, useEffect } from 'react';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingCart, 
  Send, 
  Printer, 
  ShieldCheck, 
  Truck, 
  Phone, 
  MapPin, 
  CheckCircle, 
  Sparkles, 
  ArrowRight, 
  Camera 
} from 'lucide-react';
import { CartItem, Language, StoreInfo, CustomerUser } from '../types';
import { STORE_INFO } from '../data/products';

interface CartDrawerProps {
  language: Language;
  cartItems: CartItem[];
  isOpen: boolean;
  storeInfo?: StoreInfo;
  currentUser?: CustomerUser | null;
  isGuestMode?: boolean;
  onClose: () => void;
  onRequestLogin?: () => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  language,
  cartItems,
  isOpen,
  storeInfo = STORE_INFO,
  currentUser,
  isGuestMode = false,
  onClose,
  onRequestLogin,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
}) => {
  const isHi = language === 'hi';

  const [customerName, setCustomerName] = useState<string>(currentUser?.name || '');
  const [phoneNumber, setPhoneNumber] = useState<string>(currentUser?.phone || '');
  const [address, setAddress] = useState<string>(
    currentUser
      ? `${currentUser.address ? currentUser.address + ', ' : ''}${currentUser.city} - PIN: ${currentUser.pincode}`
      : ''
  );
  const [needInstallation, setNeedInstallation] = useState<boolean>(true);
  const [orderNotes, setOrderNotes] = useState<string>('');

  useEffect(() => {
    if (currentUser) {
      if (currentUser.name && !customerName) setCustomerName(currentUser.name);
      if (currentUser.phone && !phoneNumber) setPhoneNumber(currentUser.phone);
      if (currentUser.city && !address) {
        setAddress(`${currentUser.address ? currentUser.address + ', ' : ''}${currentUser.city} - PIN: ${currentUser.pincode}`);
      }
    }
  }, [currentUser]);

  if (!isOpen) return null;

  const subtotal = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const totalOriginal = cartItems.reduce((sum, item) => sum + (item.product.originalPrice * item.quantity), 0);
  const totalSavings = Math.max(0, totalOriginal - subtotal);
  const totalItemsCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleWhatsAppCheckout = () => {
    if (cartItems.length === 0) return;

    const itemsText = cartItems.map((item, idx) => {
      return `${idx + 1}. *${item.product.name}* (Model: ${item.product.model})\n   Qty: ${item.quantity} x ₹${item.product.price.toLocaleString('en-IN')} = ₹${(item.product.price * item.quantity).toLocaleString('en-IN')}`;
    }).join('\n\n');

    const messageLines = [
      `*🛒 NEW ORDER / QUOTATION - ${storeInfo.name.toUpperCase()} 🛒*`,
      `==================================`,
      customerName ? `*Customer Name:* ${customerName}` : `*Customer Inquiry*`,
      phoneNumber ? `*Contact Number:* ${phoneNumber}` : '',
      address ? `*Delivery / Site Address:* ${address}` : '',
      `*Installation Needed:* ${needInstallation ? 'YES (Onsite Fitting Required)' : 'NO (Supply Only)'}`,
      orderNotes ? `*Customer Note:* ${orderNotes}` : '',
      `==================================`,
      `*ORDER ITEMS (${totalItemsCount} Total):*`,
      itemsText,
      `==================================`,
      `*💰 TOTAL AMOUNT: ₹${subtotal.toLocaleString('en-IN')} (Incl. GST)*`,
      totalSavings > 0 ? `*(Market M.R.P: ₹${totalOriginal.toLocaleString('en-IN')} | Savings: ₹${totalSavings.toLocaleString('en-IN')})*` : '',
      `==================================`,
      `Please confirm stock availability, dispatch timeline and payment details.`
    ].filter(Boolean).join('\n');

    window.open(`https://wa.me/${storeInfo.whatsappNumber}?text=${encodeURIComponent(messageLines)}`, '_blank');
  };

  const handlePrintQuotation = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-xs flex justify-end animate-fadeIn">
      <div className="bg-white w-full max-w-xl h-full shadow-2xl flex flex-col justify-between border-l border-slate-200">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/80 flex items-center justify-center border border-emerald-400/40">
              <ShoppingCart className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold">
                {isHi ? 'आपकी कार्ट / कोटेशन लिस्ट' : 'Your Quotation & Cart'}
              </h2>
              <p className="text-xs text-slate-400">
                {totalItemsCount} {isHi ? 'सामान चुने गए' : 'Items Selected'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Cart Items & Customer Form */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6">
          {cartItems.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <ShoppingCart className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-700">
                {isHi ? 'आपकी कार्ट अभी खाली है' : 'Your cart is empty'}
              </h3>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                {isHi
                  ? 'कृपया स्टोर से कैमरे, DVR, हार्ड डिस्क या कॉम्बो पैक जोड़ें।'
                  : 'Add CCTV cameras, DVR, Hard Disks or customized kits to get an instant quotation.'}
              </p>
              <button
                onClick={onClose}
                className="mt-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer"
              >
                {isHi ? 'उत्पाद देखें' : 'Browse Products'}
              </button>
            </div>
          ) : (
            <>
              {/* Cart List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-1 border-b border-slate-100 text-xs">
                  <span className="font-bold text-slate-600 uppercase tracking-wider">
                    {isHi ? 'चुने गए उत्पाद' : 'Selected Products'}
                  </span>
                  <button
                    onClick={onClearCart}
                    className="text-rose-600 hover:text-rose-700 font-medium flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{isHi ? 'सब हटाएं' : 'Clear All'}</span>
                  </button>
                </div>

                {cartItems.map((item) => (
                  <div
                    key={item.product.id}
                    className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex gap-3 items-start"
                  >
                    {/* CCTV camera visual badge (photo placeholder) */}
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br from-slate-900 to-blue-950 flex flex-col items-center justify-center shrink-0 border border-slate-800 text-white p-1 text-center">
                      <Camera className="w-5 h-5 text-blue-300 mb-0.5" />
                      <span className="text-[9px] font-black tracking-tighter text-blue-100 uppercase leading-none">
                        CCTV
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-1">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-800 line-clamp-2">
                          {isHi ? item.product.nameHi : item.product.name}
                        </h4>
                        <button
                          onClick={() => onRemoveItem(item.product.id)}
                          className="text-slate-400 hover:text-rose-600 p-1 transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {item.product.brand} | {item.product.model}
                      </div>

                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg p-0.5">
                          <button
                            onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                            className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center text-xs font-black text-slate-800">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                            className="w-6 h-6 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center justify-center text-xs cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <div className="text-right">
                          <div className="text-sm font-black text-slate-900">
                            ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                          </div>
                          {item.quantity > 1 && (
                            <div className="text-[10px] text-slate-400">
                              @ ₹{item.product.price.toLocaleString('en-IN')} each
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Customer Contact & Delivery Info */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  {isHi ? 'ग्राहक विवरण (ऑर्डर व बिल हेतु)' : 'Customer & Delivery Info'}
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">
                      {isHi ? 'पूरा नाम' : 'Full Name'}
                    </label>
                    <input
                      type="text"
                      placeholder={isHi ? 'जैसे: राजेश कुमार' : 'e.g. Rajesh Kumar'}
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">
                      {isHi ? 'मोबाइल नंबर' : 'Phone Number'}
                    </label>
                    <input
                      type="tel"
                      placeholder={isHi ? '10 अंकों का मोबाइल नंबर' : '10-digit Phone No.'}
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">
                    {isHi ? 'डिलीवरी / साइट का पता व शहर' : 'Site / Delivery Address & City'}
                  </label>
                  <input
                    type="text"
                    placeholder={isHi ? 'मकान/दुकान नं, मोहल्ला, शहर' : 'House/Shop No., Area, City'}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="pt-2 flex flex-col gap-2 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-800 font-medium">
                    <input
                      type="checkbox"
                      checked={needInstallation}
                      onChange={(e) => setNeedInstallation(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span>{isHi ? 'मुझे ऑनसाइट इंस्टॉलेशन व मोबाइल सेटअप भी चाहिए' : 'I need technician for Onsite Installation & App Setup'}</span>
                  </label>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer Billing Block */}
        {cartItems.length > 0 && (
          <div className="p-4 sm:p-5 bg-slate-900 text-white border-t border-slate-800 space-y-4">
            <div className="space-y-1.5 text-xs text-slate-300">
              <div className="flex justify-between">
                <span>{isHi ? 'सामान का कुल योग:' : 'Items Subtotal:'}</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              {totalSavings > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>{isHi ? 'होलसेल छूट (बचत):' : 'Wholesale Savings:'}</span>
                  <span>- ₹{totalSavings.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-400">
                <span>{isHi ? 'जीएसटी (GST):' : 'GST Invoice:'}</span>
                <span>{isHi ? 'शामिल है (Included)' : 'Included'}</span>
              </div>
              <div className="flex justify-between items-baseline pt-2 border-t border-slate-800 text-base sm:text-lg font-black text-white">
                <span>{isHi ? 'कुल देय राशि:' : 'Total Payable:'}</span>
                <span className="text-amber-400 text-xl font-extrabold">
                  ₹{subtotal.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                onClick={handlePrintQuotation}
                className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold py-3 px-3 rounded-xl border border-slate-700 transition cursor-pointer"
              >
                <Printer className="w-4 h-4 text-slate-400" />
                <span>{isHi ? 'कोटेशन प्रिंट करें' : 'Print Quotation'}</span>
              </button>

              <button
                onClick={handleWhatsAppCheckout}
                id="cart-whatsapp-order-btn"
                className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold py-3 px-4 rounded-xl shadow-lg shadow-emerald-950/40 transition cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>{isHi ? 'व्हाट्सएप पर ऑर्डर करें' : 'Order via WhatsApp'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
