import Image from "next/image";

export default function Home() {
  const whatsappNumber = "254704494504";
  
  const handleOrder = (packageName: string, price: string) => {
    const message = encodeURIComponent(`Hi, I want to order "${packageName}" (${price}) for tomorrow's Girlfriend Day delivery in Nairobi/Kiambu.`);
    return `https://wa.me/${whatsappNumber}?text=${message}`;
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Top Banner */}
      <div className="bg-amber-500 text-slate-950 text-center py-2 text-sm font-bold px-4">
        NATIONWIDE GIRLFRIEND DAY RUSH: ORDER BY 12 AM FOR GUARANTEED MORNING DELIVERY!
      </div>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 py-12 grid md:grid-cols-2 gap-8 items-center">
        <div>
          <span className="text-amber-400 font-semibold text-sm uppercase tracking-wider">Nairobi & Kiambu Only</span>
          <h1 className="text-4xl md:text-5xl font-extrabold mt-2 mb-4 leading-tight">
            Forgot a Gift? Don't Panic. We've Got You.
          </h1>
          <p className="text-slate-300 mb-6 text-lg">
            Hand-delivered, last-minute romantic surprises straight to her doorstep. Fast, discreet, and guaranteed for tomorrow.
          </p>
          <a
            href={`https://wa.me/${whatsappNumber}?text=Hi,%20I%20need%20a%20last-minute%20gift%20delivered%20tomorrow!`}
            className="inline-block bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-8 py-4 rounded-xl shadow-lg transition-all"
          >
            Order via WhatsApp Now
          </a>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-2xl">
          <h3 className="text-xl font-bold mb-4 text-amber-400">Quick Details</h3>
          <ul className="space-y-3 text-slate-300">
            <li>📍 **Coverage:** Nairobi & Kiambu Counties</li>
            <li>⏰ **Cutoff Time:** 12:00 AM Tonight</li>
            <li>📞 **Direct Line:** 0704494504</li>
          </ul>
        </div>
      </section>

      {/* Packages Section */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-center mb-10">Featured Packages (Girlfriend Day Rush)</h2>
        <div className="grid md:grid-cols-3 gap-6">
          
          {/* Package 1 */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-bold text-amber-400 mb-2">1. The Classic</h3>
              <p className="text-slate-300 text-sm mb-4">Rose Bouquet + Box of Chocolates + Card</p>
              <p className="text-2xl font-extrabold mb-6">KSh 3,200</p>
            </div>
            <a
              href={handleOrder("The Classic", "KSh 3,200")}
              className="block text-center bg-slate-800 hover:bg-amber-500 hover:text-slate-950 font-semibold py-3 rounded-xl transition-all border border-slate-700"
            >
              Book Slot
            </a>
          </div>

          {/* Package 2 */}
          <div className="bg-slate-900 border border-amber-500/50 rounded-2xl p-6 flex flex-col justify-between relative shadow-xl shadow-amber-500/10">
            <span className="absolute -top-3 right-4 bg-amber-500 text-slate-950 text-xs font-bold px-3 py-1 rounded-full">POPULAR</span>
            <div>
              <h3 className="text-xl font-bold text-amber-400 mb-2">2. The Romantic</h3>
              <p className="text-slate-300 text-sm mb-4">Premium Flowers + Luxury Scented Candle + Treats</p>
              <p className="text-2xl font-extrabold mb-6">KSh 5,800</p>
            </div>
            <a
              href={handleOrder("The Romantic", "KSh 5,800")}
              className="block text-center bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold py-3 rounded-xl transition-all"
            >
              Book Slot
            </a>
          </div>

          {/* Package 3 */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-bold text-amber-400 mb-2">3. Custom Curated</h3>
              <p className="text-slate-300 text-sm mb-4">We pick up YOUR custom gift and deliver it directly to her.</p>
              <p className="text-2xl font-extrabold mb-6">Service from KSh 1,200</p>
            </div>
            <a
              href={handleOrder("Custom Curated", "KSh 1,200")}
              className="block text-center bg-slate-800 hover:bg-amber-500 hover:text-slate-950 font-semibold py-3 rounded-xl transition-all border border-slate-700"
            >
              Book Slot
            </a>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 text-center py-6 text-slate-500 text-sm">
        <p>Call / WhatsApp: 0704494504 | Nairobi & Kiambu Delivery Only</p>
      </footer>
    </main>
  );
}
