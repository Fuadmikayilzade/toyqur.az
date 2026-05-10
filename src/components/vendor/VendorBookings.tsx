import { useState, useEffect } from "react";
import { Calendar, Clock, User, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

interface BookingWithDetails {
  id: string;
  event_date: string | null;
  message: string | null;
  status: string;
  created_at: string;
  service_id: string;
  user_id: string;
  service_title?: string;
  user_name?: string;
  user_email?: string;
}

const VendorBookings = () => {
  const { t } = useLanguage();
  const statusLabels: Record<string, { label: string; color: string }> = {
    pending: { label: t("statusPending"), color: "bg-yellow-100 text-yellow-700" },
    confirmed: { label: t("statusConfirmed"), color: "bg-green-100 text-green-700" },
    rejected: { label: t("statusRejected"), color: "bg-red-100 text-red-700" },
    cancelled: { label: t("statusCancelled"), color: "bg-muted text-muted-foreground" },
  };
  const { user } = useAuth();
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .eq("vendor_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error(t("bookingLoadErr"));
      setLoading(false);
      return;
    }

    // Fetch service titles and user profiles
    const serviceIds = [...new Set((data || []).map((b) => b.service_id))];
    const userIds = [...new Set((data || []).map((b) => b.user_id))];

    const [{ data: services }, { data: profiles }] = await Promise.all([
      supabase.from("services").select("id, title").in("id", serviceIds),
      supabase.from("profiles").select("user_id, full_name").in("user_id", userIds),
    ]);

    const enriched = (data || []).map((b) => ({
      ...b,
      service_title: services?.find((s) => s.id === b.service_id)?.title,
      user_name: profiles?.find((p) => p.user_id === b.user_id)?.full_name || "İstifadəçi",
    }));

    setBookings(enriched);
    setLoading(false);
  };

  useEffect(() => {
    fetchBookings();
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("bookings").update({ status }).eq("id", id);
    if (error) {
      toast.error(t("error"));
    } else {
      toast.success(status === "confirmed" ? t("statusConfirmed") : t("statusRejected"));
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status } : b))
      );
    }
  };

  if (loading) {
    return <div className="text-center py-10 text-muted-foreground">{t("loading")}</div>;
  }

  if (bookings.length === 0) {
    return (
      <div className="text-center py-16 bg-card border border-border rounded-2xl">
        <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">Hələ heç bir rezervasiya yoxdur</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-serif font-semibold text-foreground mb-4">
        Rezervasiyalar ({bookings.length})
      </h2>

      {bookings.map((booking) => {
        const st = statusLabels[booking.status] || statusLabels.pending;
        return (
          <div key={booking.id} className="bg-card border border-border rounded-2xl p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-serif font-semibold text-foreground">
                    {booking.service_title}
                  </h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${st.color}`}>
                    {st.label}
                  </span>
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5" />
                    {booking.user_name}
                  </span>
                  {booking.event_date && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(booking.event_date).toLocaleDateString("az-AZ")}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(booking.created_at).toLocaleDateString("az-AZ")}
                  </span>
                </div>
                {booking.message && (
                  <p className="text-sm text-muted-foreground mt-2 bg-secondary/50 rounded-lg p-3">
                    {booking.message}
                  </p>
                )}
              </div>

              {booking.status === "pending" && (
                <div className="flex gap-2 shrink-0">
                  <Button
                    size="sm"
                    className="rounded-lg"
                    onClick={() => updateStatus(booking.id, "confirmed")}
                  >
                    <Check className="w-3.5 h-3.5 mr-1" />
                    Təsdiqlə
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-lg"
                    onClick={() => updateStatus(booking.id, "rejected")}
                  >
                    <X className="w-3.5 h-3.5 mr-1" />
                    Rədd et
                  </Button>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default VendorBookings;
