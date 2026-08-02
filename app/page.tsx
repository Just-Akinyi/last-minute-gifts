"use client";

import { useState } from "react";
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function Home() {
  const whatsappNumber = "254704494504";
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState({ name: "", price: "" });
  const [formData, setFormData] = useState({
    recipientName: "",
    deliveryAddress: "",
    cardMessage: "",
    senderName: "",
    deliveryTime: "", // Added for scheduled delivery
  });

  const handleOpenModal = (packageName: string, price: string) => {
    setSelectedPackage({ name: packageName, price });
    setIsModalOpen(true);
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Save order details to Supabase database first
    const { error: dbError } = await supabase.from('orders').insert([
      {
        package_name: selectedPackage.name,
        package_price: selectedPackage.price,
        recipient_name: formData.recipientName,
        delivery_address: formData.deliveryAddress,
        card_message: formData.cardMessage,
        sender_name: formData.senderName,
        delivery_time: formData.deliveryTime,
        business_name: 'Tech Talk Technologies'
      }
    ]);

    if (dbError) {
      console.error('Database save error:', dbError);
    }

    // 2. Extract numeric price value (e.g., "KSh 3,200" -> 3200)
    const rawPrice = parseInt(selectedPackage.price.replace(/[^0-9]/g, ""), 10) * 100; // Paystack takes amount in kobo/cents

    // 3. Trigger Paystack Checkout (supports Mobile Money / M-Pesa natively)
    // Make sure to load Paystack script or use their standard redirect link approach
    const handler = (window as any).PaystackPop.setup({
      key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
      email: `customer@techtalk.co.ke`, // static fallback email since phone is removed
      amount: rawPrice,
      currency: "KES",
      channels: ["mobile_money", "card"],
      metadata: {
        custom_fields: [
          {
            display_name: "Recipient Name",
            variable_name: "recipient_name",
            value: formData.recipientName,
          },
          {
            display_name: "Sender Name",
            variable_name: "sender_name",
            value: formData.senderName,
          }
        ]
      },
      callback: function (response: { reference: string }) {
        // Payment successful - Redirect to WhatsApp with order summary
        const text = `Hi, I have successfully paid for "${selectedPackage.name}" (${selectedPackage.price}) to Last Minute Gifts!\n\n*Payment Notice:* Payment is currently collected via Tech Talk Hub\n\n*Ref:* ${response.reference}\n*Recipient:* ${formData.recipientName}\n*Address:* ${formData.deliveryAddress}\n*Scheduled Time:* ${formData.deliveryTime}\n*Card Message:* ${formData.cardMessage}\n*Sender:* ${formData.senderName}`;
        const encodedMessage = encodeURIComponent(text);
        window.location.href = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
      },
      onClose: function () {
        alert("Payment window closed.");
      }
    });

    handler.openIframe();
  };

  return (
    <main className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      {/* Top Banner */}
     {/* <div className="bg-amber-500 text-slate-950 text-center py-2.5 text-xs sm:text-sm font-bold px-4">
        NATIONWIDE GIRLFRIEND DAY RUSH: ORDER BY 12:00 PM TODAY FOR GUARANTEED DELIVERY!
      </div>*/}

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 py-8 sm:py-12 grid md:grid-cols-2 gap-8 items-center">
        <div>
          <span className="text-amber-600 dark:text-amber-400 font-semibold text-xs sm:text-sm uppercase tracking-wider">Nairobi & Kiambu Only</span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mt-2 mb-4 leading-tight">
            Forgot a Gift? Don't Panic. We've Got You.
          </h1>
          <p className="text-slate-600 dark:text-slate-300 mb-6 text-base sm:text-lg">
            Hand-delivered, last-minute romantic surprises straight to her doorstep. Fast, discreet, and guaranteed for today.
          </p>
          <a
            href={`https://wa.me/${whatsappNumber}?text=Hi,%20I%20need%20a%20last-minute%20gift%20delivered%20today!`}
            className="block sm:inline-block text-center bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-8 py-4 rounded-xl shadow-lg transition-all"
          >
            Order via WhatsApp Now
          </a>
        </div>
        
        <div className="bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-amber-500/20 p-5 sm:p-6 rounded-2xl shadow-xl backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-200 dark:border-slate-800">
            <span className="text-xl">⚡</span>
            <h3 className="text-lg sm:text-xl font-extrabold tracking-wide text-amber-600 dark:text-amber-400">Quick Details</h3>
          </div>
          <ul className="space-y-4 text-slate-700 dark:text-slate-300">
            <li className="flex items-start gap-3">
              <span className="text-lg mt-0.5">📍</span>
              <div>
                <strong className="block text-slate-900 dark:text-slate-100 font-semibold">Coverage</strong>
                <span className="text-sm text-slate-500 dark:text-slate-400">Nairobi & Kiambu Counties</span>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-lg mt-0.5">⏰</span>
              <div>
                <strong className="block text-slate-900 dark:text-slate-100 font-semibold">Cutoff Time</strong>
                <span className="text-sm text-amber-600 dark:text-amber-400 font-medium">12:00 PM Today</span>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-lg mt-0.5">📞</span>
              <div>
                <strong className="block text-slate-900 dark:text-slate-100 font-semibold">Direct Line</strong>
                <span className="text-sm text-slate-500 dark:text-slate-400">0704494504</span>
              </div>
            </li>
          </ul>
        </div>
      </section>

      {/* Packages Section */}
      <section className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-10">Featured Packages (Girlfriend Day Rush)</h2>
        <div className="grid md:grid-cols-3 gap-6">
          
          {/* Package 1 */}
          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col justify-between shadow-sm">
            <div>
              <h3 className="text-xl font-bold text-amber-600 dark:text-amber-400 mb-2">1. The Classic</h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm mb-4">Rose Bouquet + Box of Chocolates + Card</p>
              <p className="text-2xl font-extrabold mb-6">KSh 3,200</p>
            </div>
            <button
              onClick={() => handleOpenModal("The Classic", "KSh 3,200")}
              className="w-full text-center bg-slate-200 dark:bg-slate-800 hover:bg-amber-500 hover:text-slate-950 font-semibold py-3 rounded-xl transition-all border border-slate-300 dark:border-slate-700 cursor-pointer"
            >
              Book Slot
            </button>
          </div>

          {/* Package 2 */}
          <div className="bg-slate-50 dark:bg-slate-900 border border-amber-500/50 rounded-2xl p-6 flex flex-col justify-between relative shadow-xl shadow-amber-500/10">
            <span className="absolute -top-3 right-4 bg-amber-500 text-slate-950 text-xs font-bold px-3 py-1 rounded-full">POPULAR</span>
            <div>
              <h3 className="text-xl font-bold text-amber-600 dark:text-amber-400 mb-2">2. The Romantic</h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm mb-4">Premium Flowers + Luxury Scented Candle + Treats</p>
              <p className="text-2xl font-extrabold mb-6">KSh 5,800</p>
            </div>
            <button
              onClick={() => handleOpenModal("The Romantic", "KSh 5,800")}
              className="w-full text-center bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold py-3 rounded-xl transition-all cursor-pointer"
            >
              Book Slot
            </button>
          </div>

          {/* Package 3 */}
          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col justify-between shadow-sm">
            <div>
              <h3 className="text-xl font-bold text-amber-600 dark:text-amber-400 mb-2">3. Custom Curated</h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm mb-4">We pick up YOUR custom gift and deliver it directly to her.</p>
              <p className="text-2xl font-extrabold mb-6">Service from KSh 1,200</p>
            </div>
            <button
              onClick={() => handleOpenModal("Custom Curated", "KSh 1,200")}
              className="w-full text-center bg-slate-200 dark:bg-slate-800 hover:bg-amber-500 hover:text-slate-950 font-semibold py-3 rounded-xl transition-all border border-slate-300 dark:border-slate-700 cursor-pointer"
            >
              Book Slot
            </button>
          </div>

        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-slate-100 dark:bg-slate-900/50 border-y border-slate-200 dark:border-slate-800 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-10">How Last-Minute Delivery Works</h2>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="p-4">
              <div className="w-12 h-12 bg-amber-500 text-slate-950 font-bold rounded-full flex items-center justify-center mx-auto mb-4 text-lg">1</div>
              <h3 className="font-bold text-lg mb-2 text-amber-600 dark:text-amber-400">Choose a Package</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">Select from our curated options or send your own custom item instructions via WhatsApp.</p>
            </div>
            <div className="p-4">
              <div className="w-12 h-12 bg-amber-500 text-slate-950 font-bold rounded-full flex items-center justify-center mx-auto mb-4 text-lg">2</div>
              <h3 className="font-bold text-lg mb-2 text-amber-600 dark:text-amber-400">Instant Confirmation</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">Confirm the delivery address and include your custom handwritten card message.</p>
            </div>
            <div className="p-4">
              <div className="w-12 h-12 bg-amber-500 text-slate-950 font-bold rounded-full flex items-center justify-center mx-auto mb-4 text-lg">3</div>
              <h3 className="font-bold text-lg mb-2 text-amber-600 dark:text-amber-400">Discreet Delivery</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">We hand-deliver the surprise straight to her doorstep in Nairobi or Kiambu right on time.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Guarantee Section */}
      <section className="max-w-4xl mx-auto px-4 py-12 text-center">
        <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 rounded-2xl shadow-sm">
          <h3 className="text-xl sm:text-2xl font-bold mb-3 text-amber-600 dark:text-amber-400">The 100% On-Time Guarantee</h3>
          <p className="text-slate-600 dark:text-slate-300 mb-6 text-sm sm:text-base">
            We know how high the stakes are. Every order includes a complimentary physical greeting card to make the moment unforgettable.
          </p>
          <a
            href={`https://wa.me/${whatsappNumber}?text=Hi,%20I%20have%20a%20question%20about%20my%20delivery!`}
            className="block sm:inline-block bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 font-semibold px-6 py-3 rounded-xl border border-slate-300 dark:border-slate-700 transition-all text-sm"
          >
            Chat with Support on WhatsApp
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 text-center py-6 text-slate-500 text-xs sm:text-sm px-4">
        <p>Call / WhatsApp: 0704494504 | Nairobi & Kiambu Delivery Only</p>
      </footer>

      {/* Booking Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-lg rounded-2xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-amber-600 dark:text-amber-400">Complete Your Order</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{selectedPackage.name} — <strong className="text-slate-900 dark:text-slate-100">{selectedPackage.price}</strong></p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xl font-bold px-2 cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmitOrder} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Recipient Name (Her Name)</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g., Brenda Wanjiku" 
                  value={formData.recipientName}
                  onChange={(e) => setFormData({...formData, recipientName: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Delivery Address (Nairobi / Kiambu)</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g., Westlands, Nairobi or Ruiru, Kiambu" 
                  value={formData.deliveryAddress}
                  onChange={(e) => setFormData({...formData, deliveryAddress: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Handwritten Card Message (Free)</label>
                <textarea 
                  rows={3}
                  required
                  placeholder="e.g., Happy Girlfriend Day my love! Yours truly..."
                  value={formData.cardMessage}
                  onChange={(e) => setFormData({...formData, cardMessage: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Your Name (Sender)</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g., Brian" 
                  value={formData.senderName}
                  onChange={(e) => setFormData({...formData, senderName: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Scheduled Delivery Date & Time</label>
                <input 
                  type="datetime-local" 
                  required
                  value={formData.deliveryTime}
                  onChange={(e) => setFormData({...formData, deliveryTime: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-500/30 rounded-xl p-3 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
                <span>🔒</span>
                <span>Payment is securely processed and collected via <strong>Tech Talk Hub</strong> (service fee only; cost of gifts is separate).</span>
              </div>

              <button 
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3.5 rounded-xl transition-all shadow-lg text-center mt-2 cursor-pointer"
              >
                Proceed to Paystack & Confirm Order 🚀
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
// "use client";

// import { useState } from "react";
// import { createClient } from '@supabase/supabase-js';

// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
// const supabase = createClient(supabaseUrl, supabaseAnonKey);

// export default function Home() {
//   const whatsappNumber = "254704494504";
  
//   // Modal state
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [selectedPackage, setSelectedPackage] = useState({ name: "", price: "" });
//   const [formData, setFormData] = useState({
//     recipientName: "",
//     deliveryAddress: "",
//     cardMessage: "",
//     senderName: "",
//     deliveryTime: "", // Added for scheduled delivery
//   });

//   const handleOpenModal = (packageName: string, price: string) => {
//     setSelectedPackage({ name: packageName, price });
//     setIsModalOpen(true);
//   };

//   const handleSubmitOrder = async (e: React.FormEvent) => {
//     e.preventDefault();

//     // 1. Save order details to Supabase database first
//     const { error: dbError } = await supabase.from('orders').insert([
//       {
//         package_name: selectedPackage.name,
//         package_price: selectedPackage.price,
//         recipient_name: formData.recipientName,
//         delivery_address: formData.deliveryAddress,
//         card_message: formData.cardMessage,
//         sender_name: formData.senderName,
//         delivery_time: formData.deliveryTime,
//         business_name: 'Tech Talk Technologies'
//       }
//     ]);

//     if (dbError) {
//       console.error('Database save error:', dbError);
//     }

//     // 2. Extract numeric price value (e.g., "KSh 3,200" -> 3200)
//     const rawPrice = parseInt(selectedPackage.price.replace(/[^0-9]/g, ""), 10) * 100; // Paystack takes amount in kobo/cents

//     // 3. Trigger Paystack Checkout (supports Mobile Money / M-Pesa natively)
//     // Make sure to load Paystack script or use their standard redirect link approach
//     const handler = (window as any).PaystackPop.setup({
//       key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
//       email: `customer@techtalk.co.ke`, // static fallback email since phone is removed
//       amount: rawPrice,
//       currency: "KES",
//       channels: ["mobile_money", "card"],
//       metadata: {
//         custom_fields: [
//           {
//             display_name: "Recipient Name",
//             variable_name: "recipient_name",
//             value: formData.recipientName,
//           },
//           {
//             display_name: "Sender Name",
//             variable_name: "sender_name",
//             value: formData.senderName,
//           }
//         ]
//       },
//       callback: function (response: { reference: string }) {
//         // Payment successful - Redirect to WhatsApp with order summary
//         const text = `Hi, I have successfully paid for "${selectedPackage.name}" (${selectedPackage.price}) to Last Minute Gifts!\n\n*Payment Notice:* Payment is currently collected via Tech Talk Hub\n\n*Ref:* ${response.reference}\n*Recipient:* ${formData.recipientName}\n*Address:* ${formData.deliveryAddress}\n*Scheduled Time:* ${formData.deliveryTime}\n*Card Message:* ${formData.cardMessage}\n*Sender:* ${formData.senderName}`;
//         const encodedMessage = encodeURIComponent(text);
//         window.location.href = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
//       },
//       onClose: function () {
//         alert("Payment window closed.");
//       }
//     });

//     handler.openIframe();
//   };

//   return (
//     <main className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
//       {/* Top Banner */}
//       <div className="bg-amber-500 text-slate-950 text-center py-2.5 text-xs sm:text-sm font-bold px-4">
//         NATIONWIDE GIRLFRIEND DAY RUSH: ORDER BY 12:00 PM TODAY FOR GUARANTEED DELIVERY!
//       </div>

//       {/* Hero Section */}
//       <section className="max-w-6xl mx-auto px-4 py-8 sm:py-12 grid md:grid-cols-2 gap-8 items-center">
//         <div>
//           <span className="text-amber-600 dark:text-amber-400 font-semibold text-xs sm:text-sm uppercase tracking-wider">Nairobi & Kiambu Only</span>
//           <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mt-2 mb-4 leading-tight">
//             Forgot a Gift? Don't Panic. We've Got You.
//           </h1>
//           <p className="text-slate-600 dark:text-slate-300 mb-6 text-base sm:text-lg">
//             Hand-delivered, last-minute romantic surprises straight to her doorstep. Fast, discreet, and guaranteed for today.
//           </p>
//           <a
//             href={`https://wa.me/${whatsappNumber}?text=Hi,%20I%20need%20a%20last-minute%20gift%20delivered%20today!`}
//             className="block sm:inline-block text-center bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-8 py-4 rounded-xl shadow-lg transition-all"
//           >
//             Order via WhatsApp Now
//           </a>
//         </div>
        
//         <div className="bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-amber-500/20 p-5 sm:p-6 rounded-2xl shadow-xl backdrop-blur-sm">
//           <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-200 dark:border-slate-800">
//             <span className="text-xl">⚡</span>
//             <h3 className="text-lg sm:text-xl font-extrabold tracking-wide text-amber-600 dark:text-amber-400">Quick Details</h3>
//           </div>
//           <ul className="space-y-4 text-slate-700 dark:text-slate-300">
//             <li className="flex items-start gap-3">
//               <span className="text-lg mt-0.5">📍</span>
//               <div>
//                 <strong className="block text-slate-900 dark:text-slate-100 font-semibold">Coverage</strong>
//                 <span className="text-sm text-slate-500 dark:text-slate-400">Nairobi & Kiambu Counties</span>
//               </div>
//             </li>
//             <li className="flex items-start gap-3">
//               <span className="text-lg mt-0.5">⏰</span>
//               <div>
//                 <strong className="block text-slate-900 dark:text-slate-100 font-semibold">Cutoff Time</strong>
//                 <span className="text-sm text-amber-600 dark:text-amber-400 font-medium">12:00 PM Today</span>
//               </div>
//             </li>
//             <li className="flex items-start gap-3">
//               <span className="text-lg mt-0.5">📞</span>
//               <div>
//                 <strong className="block text-slate-900 dark:text-slate-100 font-semibold">Direct Line</strong>
//                 <span className="text-sm text-slate-500 dark:text-slate-400">0704494504</span>
//               </div>
//             </li>
//           </ul>
//         </div>
//       </section>

//       {/* Packages Section */}
//       <section className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
//         <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-10">Featured Packages (Girlfriend Day Rush)</h2>
//         <div className="grid md:grid-cols-3 gap-6">
          
//           {/* Package 1 */}
//           <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col justify-between shadow-sm">
//             <div>
//               <h3 className="text-xl font-bold text-amber-600 dark:text-amber-400 mb-2">1. The Classic</h3>
//               <p className="text-slate-600 dark:text-slate-300 text-sm mb-4">Rose Bouquet + Box of Chocolates + Card</p>
//               <p className="text-2xl font-extrabold mb-6">KSh 3,200</p>
//             </div>
//             <button
//               onClick={() => handleOpenModal("The Classic", "KSh 3,200")}
//               className="w-full text-center bg-slate-200 dark:bg-slate-800 hover:bg-amber-500 hover:text-slate-950 font-semibold py-3 rounded-xl transition-all border border-slate-300 dark:border-slate-700 cursor-pointer"
//             >
//               Book Slot
//             </button>
//           </div>

//           {/* Package 2 */}
//           <div className="bg-slate-50 dark:bg-slate-900 border border-amber-500/50 rounded-2xl p-6 flex flex-col justify-between relative shadow-xl shadow-amber-500/10">
//             <span className="absolute -top-3 right-4 bg-amber-500 text-slate-950 text-xs font-bold px-3 py-1 rounded-full">POPULAR</span>
//             <div>
//               <h3 className="text-xl font-bold text-amber-600 dark:text-amber-400 mb-2">2. The Romantic</h3>
//               <p className="text-slate-600 dark:text-slate-300 text-sm mb-4">Premium Flowers + Luxury Scented Candle + Treats</p>
//               <p className="text-2xl font-extrabold mb-6">KSh 5,800</p>
//             </div>
//             <button
//               onClick={() => handleOpenModal("The Romantic", "KSh 5,800")}
//               className="w-full text-center bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold py-3 rounded-xl transition-all cursor-pointer"
//             >
//               Book Slot
//             </button>
//           </div>

//           {/* Package 3 */}
//           <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col justify-between shadow-sm">
//             <div>
//               <h3 className="text-xl font-bold text-amber-600 dark:text-amber-400 mb-2">3. Custom Curated</h3>
//               <p className="text-slate-600 dark:text-slate-300 text-sm mb-4">We pick up YOUR custom gift and deliver it directly to her.</p>
//               <p className="text-2xl font-extrabold mb-6">Service from KSh 1,200</p>
//             </div>
//             <button
//               onClick={() => handleOpenModal("Custom Curated", "KSh 1,200")}
//               className="w-full text-center bg-slate-200 dark:bg-slate-800 hover:bg-amber-500 hover:text-slate-950 font-semibold py-3 rounded-xl transition-all border border-slate-300 dark:border-slate-700 cursor-pointer"
//             >
//               Book Slot
//             </button>
//           </div>

//         </div>
//       </section>

//       {/* How It Works Section */}
//       <section className="bg-slate-100 dark:bg-slate-900/50 border-y border-slate-200 dark:border-slate-800 py-12 px-4">
//         <div className="max-w-6xl mx-auto">
//           <h2 className="text-2xl sm:text-3xl font-bold text-center mb-10">How Last-Minute Delivery Works</h2>
//           <div className="grid md:grid-cols-3 gap-8 text-center">
//             <div className="p-4">
//               <div className="w-12 h-12 bg-amber-500 text-slate-950 font-bold rounded-full flex items-center justify-center mx-auto mb-4 text-lg">1</div>
//               <h3 className="font-bold text-lg mb-2 text-amber-600 dark:text-amber-400">Choose a Package</h3>
//               <p className="text-slate-600 dark:text-slate-400 text-sm">Select from our curated options or send your own custom item instructions via WhatsApp.</p>
//             </div>
//             <div className="p-4">
//               <div className="w-12 h-12 bg-amber-500 text-slate-950 font-bold rounded-full flex items-center justify-center mx-auto mb-4 text-lg">2</div>
//               <h3 className="font-bold text-lg mb-2 text-amber-600 dark:text-amber-400">Instant Confirmation</h3>
//               <p className="text-slate-600 dark:text-slate-400 text-sm">Confirm the delivery address and include your custom handwritten card message.</p>
//             </div>
//             <div className="p-4">
//               <div className="w-12 h-12 bg-amber-500 text-slate-950 font-bold rounded-full flex items-center justify-center mx-auto mb-4 text-lg">3</div>
//               <h3 className="font-bold text-lg mb-2 text-amber-600 dark:text-amber-400">Discreet Delivery</h3>
//               <p className="text-slate-600 dark:text-slate-400 text-sm">We hand-deliver the surprise straight to her doorstep in Nairobi or Kiambu right on time.</p>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Trust & Guarantee Section */}
//       <section className="max-w-4xl mx-auto px-4 py-12 text-center">
//         <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 rounded-2xl shadow-sm">
//           <h3 className="text-xl sm:text-2xl font-bold mb-3 text-amber-600 dark:text-amber-400">The 100% On-Time Guarantee</h3>
//           <p className="text-slate-600 dark:text-slate-300 mb-6 text-sm sm:text-base">
//             We know how high the stakes are. Every order includes a complimentary physical greeting card to make the moment unforgettable.
//           </p>
//           <a
//             href={`https://wa.me/${whatsappNumber}?text=Hi,%20I%20have%20a%20question%20about%20my%20delivery!`}
//             className="block sm:inline-block bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 font-semibold px-6 py-3 rounded-xl border border-slate-300 dark:border-slate-700 transition-all text-sm"
//           >
//             Chat with Support on WhatsApp
//           </a>
//         </div>
//       </section>

//       {/* Footer */}
//       <footer className="border-t border-slate-200 dark:border-slate-800 text-center py-6 text-slate-500 text-xs sm:text-sm px-4">
//         <p>Call / WhatsApp: 0704494504 | Nairobi & Kiambu Delivery Only</p>
//       </footer>

//       {/* Booking Form Modal */}
//       {isModalOpen && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
//           <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-lg rounded-2xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
//             <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-200 dark:border-slate-800">
//               <div>
//                 <h3 className="text-lg font-bold text-amber-600 dark:text-amber-400">Complete Your Order</h3>
//                 <p className="text-xs text-slate-500 dark:text-slate-400">{selectedPackage.name} — <strong className="text-slate-900 dark:text-slate-100">{selectedPackage.price}</strong></p>
//               </div>
//               <button 
//                 onClick={() => setIsModalOpen(false)}
//                 className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xl font-bold px-2 cursor-pointer"
//               >
//                 &times;
//               </button>
//             </div>

//             <form onSubmit={handleSubmitOrder} className="space-y-4">
//               <div>
//                 <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Recipient Name (Her Name)</label>
//                 <input 
//                   type="text" 
//                   required
//                   placeholder="e.g., Brenda Wanjiku" 
//                   value={formData.recipientName}
//                   onChange={(e) => setFormData({...formData, recipientName: e.target.value})}
//                   className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
//                 />
//               </div>

//               <div>
//                 <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Delivery Address (Nairobi / Kiambu)</label>
//                 <input 
//                   type="text" 
//                   required
//                   placeholder="e.g., Westlands, Nairobi or Ruiru, Kiambu" 
//                   value={formData.deliveryAddress}
//                   onChange={(e) => setFormData({...formData, deliveryAddress: e.target.value})}
//                   className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
//                 />
//               </div>

//               <div>
//                 <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Handwritten Card Message (Free)</label>
//                 <textarea 
//                   rows={3}
//                   required
//                   placeholder="e.g., Happy Girlfriend Day my love! Yours truly..."
//                   value={formData.cardMessage}
//                   onChange={(e) => setFormData({...formData, cardMessage: e.target.value})}
//                   className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500 resize-none"
//                 />
//               </div>

//               <div>
//                 <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Your Name (Sender)</label>
//                 <input 
//                   type="text" 
//                   required
//                   placeholder="e.g., Brian" 
//                   value={formData.senderName}
//                   onChange={(e) => setFormData({...formData, senderName: e.target.value})}
//                   className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
//                 />
//               </div>

//               <div>
//                 <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Scheduled Delivery Date & Time</label>
//                 <input 
//                   type="datetime-local" 
//                   required
//                   value={formData.deliveryTime}
//                   onChange={(e) => setFormData({...formData, deliveryTime: e.target.value})}
//                   className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
//                 />
//               </div>

//               <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-500/30 rounded-xl p-3 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
//                 <span>🔒</span>
//                 <span>Payment is securely processed and collected via <strong>Tech Talk Hub</strong>.</span>
//               </div>

//               <button 
//                 type="submit"
//                 className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3.5 rounded-xl transition-all shadow-lg text-center mt-2 cursor-pointer"
//               >
//                 Proceed to Paystack & Confirm Order 🚀
//               </button>
//             </form>
//           </div>
//         </div>
//       )}
//     </main>
//   );
// }
// // "use client";

// // import { useState } from "react";
// // import { createClient } from '@supabase/supabase-js';

// // const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// // const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
// // const supabase = createClient(supabaseUrl, supabaseAnonKey);

// // export default function Home() {
// //   const whatsappNumber = "254704494504";
  
// //   // Modal state
// //   const [isModalOpen, setIsModalOpen] = useState(false);
// //   const [selectedPackage, setSelectedPackage] = useState({ name: "", price: "" });
// //   const [formData, setFormData] = useState({
// //     recipientName: "",
// //     deliveryAddress: "",
// //     cardMessage: "",
// //     senderName: "",
// //     deliveryTime: "", // Added for scheduled delivery
// //   });

// //   const handleOpenModal = (packageName: string, price: string) => {
// //     setSelectedPackage({ name: packageName, price });
// //     setIsModalOpen(true);
// //   };

// //   const handleSubmitOrder = async (e: React.FormEvent) => {
// //     e.preventDefault();

// //     // 1. Save order details to Supabase database first
// //     const { error: dbError } = await supabase.from('orders').insert([
// //       {
// //         package_name: selectedPackage.name,
// //         package_price: selectedPackage.price,
// //         recipient_name: formData.recipientName,
// //         delivery_address: formData.deliveryAddress,
// //         card_message: formData.cardMessage,
// //         sender_name: formData.senderName,
// //         delivery_time: formData.deliveryTime,
// //         business_name: 'Tech Talk Technologies'
// //       }
// //     ]);

// //     if (dbError) {
// //       console.error('Database save error:', dbError);
// //     }

// //     // 2. Extract numeric price value (e.g., "KSh 3,200" -> 3200)
// //     const rawPrice = parseInt(selectedPackage.price.replace(/[^0-9]/g, ""), 10) * 100; // Paystack takes amount in kobo/cents

// //     // 3. Trigger Paystack Checkout (supports Mobile Money / M-Pesa natively)
// //     // Make sure to load Paystack script or use their standard redirect link approach
// //     const handler = (window as any).PaystackPop.setup({
// //       key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
// //       email: `customer@techtalk.co.ke`, // static fallback email since phone is removed
// //       amount: rawPrice,
// //       currency: "KES",
// //       channels: ["mobile_money", "card"],
// //       metadata: {
// //         custom_fields: [
// //           {
// //             display_name: "Recipient Name",
// //             variable_name: "recipient_name",
// //             value: formData.recipientName,
// //           },
// //           {
// //             display_name: "Sender Name",
// //             variable_name: "sender_name",
// //             value: formData.senderName,
// //           }
// //         ]
// //       },
// //       callback: function (response: { reference: string }) {
// //         // Payment successful - Redirect to WhatsApp with order summary
// //         const text = `Hi, I have successfully paid for "${selectedPackage.name}" (${selectedPackage.price}) via Paystack!\n\n*Ref:* ${response.reference}\n*Recipient:* ${formData.recipientName}\n*Address:* ${formData.deliveryAddress}\n*Scheduled Time:* ${formData.deliveryTime}\n*Card Message:* ${formData.cardMessage}\n*Sender:* ${formData.senderName}`;
// //         const encodedMessage = encodeURIComponent(text);
// //         window.location.href = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
// //       },
// //       onClose: function () {
// //         alert("Payment window closed.");
// //       }
// //     });

// //     handler.openIframe();
// //   };

// //   return (
// //     <main className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
// //       {/* Top Banner */}
// //       <div className="bg-amber-500 text-slate-950 text-center py-2.5 text-xs sm:text-sm font-bold px-4">
// //         NATIONWIDE GIRLFRIEND DAY RUSH: ORDER BY 12:00 PM TODAY FOR GUARANTEED DELIVERY!
// //       </div>

// //       {/* Hero Section */}
// //       <section className="max-w-6xl mx-auto px-4 py-8 sm:py-12 grid md:grid-cols-2 gap-8 items-center">
// //         <div>
// //           <span className="text-amber-600 dark:text-amber-400 font-semibold text-xs sm:text-sm uppercase tracking-wider">Nairobi & Kiambu Only</span>
// //           <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mt-2 mb-4 leading-tight">
// //             Forgot a Gift? Don't Panic. We've Got You.
// //           </h1>
// //           <p className="text-slate-600 dark:text-slate-300 mb-6 text-base sm:text-lg">
// //             Hand-delivered, last-minute romantic surprises straight to her doorstep. Fast, discreet, and guaranteed for today.
// //           </p>
// //           <a
// //             href={`https://wa.me/${whatsappNumber}?text=Hi,%20I%20need%20a%20last-minute%20gift%20delivered%20today!`}
// //             className="block sm:inline-block text-center bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-8 py-4 rounded-xl shadow-lg transition-all"
// //           >
// //             Order via WhatsApp Now
// //           </a>
// //         </div>
        
// //         <div className="bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-amber-500/20 p-5 sm:p-6 rounded-2xl shadow-xl backdrop-blur-sm">
// //           <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-200 dark:border-slate-800">
// //             <span className="text-xl">⚡</span>
// //             <h3 className="text-lg sm:text-xl font-extrabold tracking-wide text-amber-600 dark:text-amber-400">Quick Details</h3>
// //           </div>
// //           <ul className="space-y-4 text-slate-700 dark:text-slate-300">
// //             <li className="flex items-start gap-3">
// //               <span className="text-lg mt-0.5">📍</span>
// //               <div>
// //                 <strong className="block text-slate-900 dark:text-slate-100 font-semibold">Coverage</strong>
// //                 <span className="text-sm text-slate-500 dark:text-slate-400">Nairobi & Kiambu Counties</span>
// //               </div>
// //             </li>
// //             <li className="flex items-start gap-3">
// //               <span className="text-lg mt-0.5">⏰</span>
// //               <div>
// //                 <strong className="block text-slate-900 dark:text-slate-100 font-semibold">Cutoff Time</strong>
// //                 <span className="text-sm text-amber-600 dark:text-amber-400 font-medium">12:00 PM Today</span>
// //               </div>
// //             </li>
// //             <li className="flex items-start gap-3">
// //               <span className="text-lg mt-0.5">📞</span>
// //               <div>
// //                 <strong className="block text-slate-900 dark:text-slate-100 font-semibold">Direct Line</strong>
// //                 <span className="text-sm text-slate-500 dark:text-slate-400">0704494504</span>
// //               </div>
// //             </li>
// //           </ul>
// //         </div>
// //       </section>

// //       {/* Packages Section */}
// //       <section className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
// //         <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-10">Featured Packages (Girlfriend Day Rush)</h2>
// //         <div className="grid md:grid-cols-3 gap-6">
          
// //           {/* Package 1 */}
// //           <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col justify-between shadow-sm">
// //             <div>
// //               <h3 className="text-xl font-bold text-amber-600 dark:text-amber-400 mb-2">1. The Classic</h3>
// //               <p className="text-slate-600 dark:text-slate-300 text-sm mb-4">Rose Bouquet + Box of Chocolates + Card</p>
// //               <p className="text-2xl font-extrabold mb-6">KSh 3,200</p>
// //             </div>
// //             <button
// //               onClick={() => handleOpenModal("The Classic", "KSh 3,200")}
// //               className="w-full text-center bg-slate-200 dark:bg-slate-800 hover:bg-amber-500 hover:text-slate-950 font-semibold py-3 rounded-xl transition-all border border-slate-300 dark:border-slate-700 cursor-pointer"
// //             >
// //               Book Slot
// //             </button>
// //           </div>

// //           {/* Package 2 */}
// //           <div className="bg-slate-50 dark:bg-slate-900 border border-amber-500/50 rounded-2xl p-6 flex flex-col justify-between relative shadow-xl shadow-amber-500/10">
// //             <span className="absolute -top-3 right-4 bg-amber-500 text-slate-950 text-xs font-bold px-3 py-1 rounded-full">POPULAR</span>
// //             <div>
// //               <h3 className="text-xl font-bold text-amber-600 dark:text-amber-400 mb-2">2. The Romantic</h3>
// //               <p className="text-slate-600 dark:text-slate-300 text-sm mb-4">Premium Flowers + Luxury Scented Candle + Treats</p>
// //               <p className="text-2xl font-extrabold mb-6">KSh 5,800</p>
// //             </div>
// //             <button
// //               onClick={() => handleOpenModal("The Romantic", "KSh 5,800")}
// //               className="w-full text-center bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold py-3 rounded-xl transition-all cursor-pointer"
// //             >
// //               Book Slot
// //             </button>
// //           </div>

// //           {/* Package 3 */}
// //           <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col justify-between shadow-sm">
// //             <div>
// //               <h3 className="text-xl font-bold text-amber-600 dark:text-amber-400 mb-2">3. Custom Curated</h3>
// //               <p className="text-slate-600 dark:text-slate-300 text-sm mb-4">We pick up YOUR custom gift and deliver it directly to her.</p>
// //               <p className="text-2xl font-extrabold mb-6">Service from KSh 1,200</p>
// //             </div>
// //             <button
// //               onClick={() => handleOpenModal("Custom Curated", "KSh 1,200")}
// //               className="w-full text-center bg-slate-200 dark:bg-slate-800 hover:bg-amber-500 hover:text-slate-950 font-semibold py-3 rounded-xl transition-all border border-slate-300 dark:border-slate-700 cursor-pointer"
// //             >
// //               Book Slot
// //             </button>
// //           </div>

// //         </div>
// //       </section>

// //       {/* How It Works Section */}
// //       <section className="bg-slate-100 dark:bg-slate-900/50 border-y border-slate-200 dark:border-slate-800 py-12 px-4">
// //         <div className="max-w-6xl mx-auto">
// //           <h2 className="text-2xl sm:text-3xl font-bold text-center mb-10">How Last-Minute Delivery Works</h2>
// //           <div className="grid md:grid-cols-3 gap-8 text-center">
// //             <div className="p-4">
// //               <div className="w-12 h-12 bg-amber-500 text-slate-950 font-bold rounded-full flex items-center justify-center mx-auto mb-4 text-lg">1</div>
// //               <h3 className="font-bold text-lg mb-2 text-amber-600 dark:text-amber-400">Choose a Package</h3>
// //               <p className="text-slate-600 dark:text-slate-400 text-sm">Select from our curated options or send your own custom item instructions via WhatsApp.</p>
// //             </div>
// //             <div className="p-4">
// //               <div className="w-12 h-12 bg-amber-500 text-slate-950 font-bold rounded-full flex items-center justify-center mx-auto mb-4 text-lg">2</div>
// //               <h3 className="font-bold text-lg mb-2 text-amber-600 dark:text-amber-400">Instant Confirmation</h3>
// //               <p className="text-slate-600 dark:text-slate-400 text-sm">Confirm the delivery address and include your custom handwritten card message.</p>
// //             </div>
// //             <div className="p-4">
// //               <div className="w-12 h-12 bg-amber-500 text-slate-950 font-bold rounded-full flex items-center justify-center mx-auto mb-4 text-lg">3</div>
// //               <h3 className="font-bold text-lg mb-2 text-amber-600 dark:text-amber-400">Discreet Delivery</h3>
// //               <p className="text-slate-600 dark:text-slate-400 text-sm">We hand-deliver the surprise straight to her doorstep in Nairobi or Kiambu right on time.</p>
// //             </div>
// //           </div>
// //         </div>
// //       </section>

// //       {/* Trust & Guarantee Section */}
// //       <section className="max-w-4xl mx-auto px-4 py-12 text-center">
// //         <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 rounded-2xl shadow-sm">
// //           <h3 className="text-xl sm:text-2xl font-bold mb-3 text-amber-600 dark:text-amber-400">The 100% On-Time Guarantee</h3>
// //           <p className="text-slate-600 dark:text-slate-300 mb-6 text-sm sm:text-base">
// //             We know how high the stakes are. Every order includes a complimentary physical greeting card to make the moment unforgettable.
// //           </p>
// //           <a
// //             href={`https://wa.me/${whatsappNumber}?text=Hi,%20I%20have%20a%20question%20about%20my%20delivery!`}
// //             className="block sm:inline-block bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 font-semibold px-6 py-3 rounded-xl border border-slate-300 dark:border-slate-700 transition-all text-sm"
// //           >
// //             Chat with Support on WhatsApp
// //           </a>
// //         </div>
// //       </section>

// //       {/* Footer */}
// //       <footer className="border-t border-slate-200 dark:border-slate-800 text-center py-6 text-slate-500 text-xs sm:text-sm px-4">
// //         <p>Call / WhatsApp: 0704494504 | Nairobi & Kiambu Delivery Only</p>
// //       </footer>

// //       {/* Booking Form Modal */}
// //       {isModalOpen && (
// //         <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
// //           <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-lg rounded-2xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
// //             <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-200 dark:border-slate-800">
// //               <div>
// //                 <h3 className="text-lg font-bold text-amber-600 dark:text-amber-400">Complete Your Order</h3>
// //                 <p className="text-xs text-slate-500 dark:text-slate-400">{selectedPackage.name} — <strong className="text-slate-900 dark:text-slate-100">{selectedPackage.price}</strong></p>
// //               </div>
// //               <button 
// //                 onClick={() => setIsModalOpen(false)}
// //                 className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xl font-bold px-2 cursor-pointer"
// //               >
// //                 &times;
// //               </button>
// //             </div>

// //             <form onSubmit={handleSubmitOrder} className="space-y-4">
// //               <div>
// //                 <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Recipient Name (Her Name)</label>
// //                 <input 
// //                   type="text" 
// //                   required
// //                   placeholder="e.g., Brenda Wanjiku" 
// //                   value={formData.recipientName}
// //                   onChange={(e) => setFormData({...formData, recipientName: e.target.value})}
// //                   className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
// //                 />
// //               </div>

// //               <div>
// //                 <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Delivery Address (Nairobi / Kiambu)</label>
// //                 <input 
// //                   type="text" 
// //                   required
// //                   placeholder="e.g., Westlands, Nairobi or Ruiru, Kiambu" 
// //                   value={formData.deliveryAddress}
// //                   onChange={(e) => setFormData({...formData, deliveryAddress: e.target.value})}
// //                   className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
// //                 />
// //               </div>

// //               <div>
// //                 <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Handwritten Card Message (Free)</label>
// //                 <textarea 
// //                   rows={3}
// //                   required
// //                   placeholder="e.g., Happy Girlfriend Day my love! Yours truly..."
// //                   value={formData.cardMessage}
// //                   onChange={(e) => setFormData({...formData, cardMessage: e.target.value})}
// //                   className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500 resize-none"
// //                 />
// //               </div>

// //               <div>
// //                 <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Your Name (Sender)</label>
// //                 <input 
// //                   type="text" 
// //                   required
// //                   placeholder="e.g., Brian" 
// //                   value={formData.senderName}
// //                   onChange={(e) => setFormData({...formData, senderName: e.target.value})}
// //                   className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
// //                 />
// //               </div>

// //               <div>
// //                 <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Scheduled Delivery Date & Time</label>
// //                 <input 
// //                   type="datetime-local" 
// //                   required
// //                   value={formData.deliveryTime}
// //                   onChange={(e) => setFormData({...formData, deliveryTime: e.target.value})}
// //                   className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
// //                 />
// //               </div>

// //               <button 
// //                 type="submit"
// //                 className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3.5 rounded-xl transition-all shadow-lg text-center mt-2 cursor-pointer"
// //               >
// //                 Proceed to Paystack & Confirm Order 🚀
// //               </button>
// //             </form>
// //           </div>
// //         </div>
// //       )}
// //     </main>
// //   );
// // }