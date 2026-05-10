import { useState } from "react";
import { Calendar, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface BookingDialogProps {
  serviceId: string;
  vendorId: string;
  serviceTitle: string;
  open: boolean;
  onClose: () => void;
}

const BookingDialog = ({ serviceId, vendorId, serviceTitle, open, onClose }: BookingDialogProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [eventDate, setEventDate] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("Zəhmət olmasa əvvəlcə daxil olun");
      navigate("/auth");
      return;
    }

    setLoading(true);
    const { error } = await supabase.from("bookings").insert({
      service_id: serviceId,
      vendor_id: vendorId,
      user_id: user.id,
      event_date: eventDate || null,
      message: message.trim() || null,
    });

    if (error) {
      toast.error(error.message || "Xəta baş verdi");
    } else {
      toast.success("Rezervasiya sorğusu göndərildi!");
      onClose();
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-foreground/40" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-2xl p-6 w-full max-w-md">
        <h2 className="text-xl font-serif font-bold text-foreground mb-1">Rezervasiya Et</h2>
        <p className="text-sm text-muted-foreground mb-6">{serviceTitle}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              Tarix
            </label>
            <input
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4" />
              Mesaj
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 min-h-[80px]"
              placeholder="Mesajınızı yazın..."
            />
          </div>
          <div className="flex gap-3">
            <Button type="submit" className="flex-1 rounded-xl" disabled={loading}>
              {loading ? "Göndərilir..." : "Göndər"}
            </Button>
            <Button type="button" variant="outline" className="rounded-xl" onClick={onClose}>
              Bağla
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingDialog;
