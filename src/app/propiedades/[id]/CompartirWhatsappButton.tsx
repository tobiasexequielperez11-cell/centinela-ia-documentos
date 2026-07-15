'use client';

export function CompartirWhatsappButton({
  name,
  propertyType,
  address,
  rooms,
  surfaceTotal,
  surfaceCovered,
  price,
  currency
}: {
  name: string;
  propertyType: string;
  address: string | null;
  rooms: number | null;
  surfaceTotal: number | null;
  surfaceCovered: number | null;
  price: number | null;
  currency: string | null;
}) {
  const handleShare = () => {
    const lineas: string[] = [];
    lineas.push(`🏠 *${name}* — ${propertyType}`);
    
    if (address) {
      lineas.push(`📍 ${address}`);
    }
    
    if (surfaceTotal != null || surfaceCovered != null) {
      const sup = [];
      if (surfaceTotal != null) sup.push(`${surfaceTotal} m² totales`);
      if (surfaceCovered != null) sup.push(`${surfaceCovered} m² cubiertos`);
      lineas.push(`📐 ${sup.join(' · ')}`);
    }

    if (rooms != null) {
      lineas.push(`🛏️ ${rooms} ambientes`);
    }

    if (price != null) {
      const cur = currency === 'USD' ? 'u$s' : '$';
      lineas.push(`💰 ${cur} ${price.toLocaleString('es-AR')}`);
    }

    const mensaje = lineas.join('\n');
    window.open(`https://wa.me/?text=${encodeURIComponent(mensaje)}`, '_blank');
  };

  return (
    <div className="mb-6">
      <button
        onClick={handleShare}
        className="group relative inline-flex w-full justify-center items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-emerald-600 to-[#25D366] px-5 py-3 text-sm font-bold text-white shadow-lg transition-all hover:scale-105 hover:shadow-green-500/25"
      >
        <div className="absolute inset-0 bg-white/20 opacity-0 transition-opacity group-hover:opacity-100"></div>
        <span>📲 Compartir por WhatsApp</span>
      </button>
    </div>
  );
}
