import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, Sparkles, MessageCircle } from "lucide-react";
import { toast } from "sonner";

const WA_NUMBER = "994104195344";

// Pages where FABs should NOT appear
const HIDDEN_PATHS = ["/auth", "/vendor", "/admin"];

const FloatingButtons = () => {
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Hide on auth/dashboard pages
  if (HIDDEN_PATHS.some(p => location.pathname.startsWith(p))) return null;

  const handleAddService = () => {
    if (!user || role !== "vendor") {
      // Show custom modal-style toast with two buttons
      toast(
        () => (
          <div style={{ minWidth: 260 }}>
            <p style={{ fontWeight: 600, marginBottom: 6, fontSize: 14, color: "hsl(20 20% 14%)" }}>
              Xidmət əlavə etmək üçün
            </p>
            <p style={{ fontSize: 12, color: "hsl(20 12% 48%)", marginBottom: 12 }}>
              Xidmət sahibi kimi daxil olun və ya qeydiyyatdan keçin
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => { toast.dismiss(); navigate("/auth?mode=login"); }}
                style={{
                  flex: 1, padding: "7px 0", borderRadius: 10, fontSize: 12, fontWeight: 600,
                  background: "hsl(16 38% 44%)", color: "white", border: "none", cursor: "pointer",
                }}
              >
                Daxil ol
              </button>
              <button
                onClick={() => { toast.dismiss(); navigate("/auth?mode=register"); }}
                style={{
                  flex: 1, padding: "7px 0", borderRadius: 10, fontSize: 12, fontWeight: 600,
                  background: "hsl(28 35% 94%)", color: "hsl(20 20% 18%)",
                  border: "1px solid hsl(25 28% 82%)", cursor: "pointer",
                }}
              >
                Qeydiyyat
              </button>
            </div>
          </div>
        ),
        { duration: 7000 }
      );
      return;
    }
    navigate("/vendor?add=1");
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-center gap-3">
      {/* Add Service FAB */}
      <div className="relative">
        <div
          className="absolute inset-0 rounded-full animate-ping opacity-20"
          style={{ background: "hsl(16 38% 44%)" }}
        />
        <button
          onClick={handleAddService}
          className="relative w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 group"
          style={{
            background: "linear-gradient(135deg, hsl(16 38% 44%) 0%, hsl(16 50% 36%) 100%)",
            boxShadow: "0 8px 32px hsl(16 38% 44% / 0.45), 0 2px 8px hsl(16 38% 44% / 0.3)",
          }}
          title="Xidmət əlavə et"
        >
          <div className="relative">
            <Plus className="w-6 h-6 text-white" strokeWidth={2.5} />
            <Sparkles className="absolute -top-2 -right-2 w-3 h-3 text-yellow-200 opacity-80 group-hover:opacity-100 transition-opacity" />
          </div>
        </button>
      </div>

      {/* WhatsApp FAB */}
      <a
        href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent("Salam sizə toyqur.az saytından müraciət edirəm")}`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 active:scale-95"
        style={{
          background: "hsl(142 70% 45%)",
          boxShadow: "0 4px 16px hsl(142 60% 40% / 0.4)",
        }}
        aria-label="WhatsApp"
      >
        <MessageCircle className="w-6 h-6 text-white" />
      </a>
    </div>
  );
};

export default FloatingButtons;