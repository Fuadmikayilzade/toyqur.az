import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { X, Send, MessageCircle, LogIn } from "lucide-react";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";

interface SendMessageModalProps {
  vendorId: string;
  vendorName: string;
  serviceId?: string;
  serviceTitle?: string;
  onClose: () => void;
}

export default function SendMessageModal({
  vendorId,
  vendorName,
  serviceId,
  serviceTitle,
  onClose,
}: SendMessageModalProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [message, setMessage] = useState(
    serviceTitle
      ? `Salam! "${serviceTitle}" xidmətiniz ilə maraqlanıram. Ətraflı məlumat verə bilərsinizmi?`
      : `Salam! Xidmətlərinizlə maraqlanıram. Ətraflı məlumat verə bilərsinizmi?`
  );
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    if (!message.trim() || !user) return;
    setSending(true);

    try {
      // Get or create conversation
      const u1 = user.id < vendorId ? user.id : vendorId;
      const u2 = user.id < vendorId ? vendorId : user.id;

      let convId: string;

      const { data: existing } = await supabase
        .from("conversations")
        .select("id")
        .eq("user1_id", u1)
        .eq("user2_id", u2)
        .eq("service_id", serviceId || null)
        .maybeSingle();

      if (existing) {
        convId = existing.id;
      } else {
        const { data: newConv, error } = await supabase
          .from("conversations")
          .insert({
            user1_id: u1,
            user2_id: u2,
            service_id: serviceId || null,
            last_message: message.trim(),
            last_message_at: new Date().toISOString(),
          })
          .select("id")
          .single();

        if (error || !newConv) throw error;
        convId = newConv.id;
      }

      // Send message
      const { error: msgError } = await supabase.from("messages").insert({
        conversation_id: convId,
        sender_id: user.id,
        receiver_id: vendorId,
        content: message.trim(),
        service_id: serviceId || null,
      });

      if (msgError) throw msgError;

      // Update conversation last message
      await supabase.from("conversations")
        .update({ last_message: message.trim(), last_message_at: new Date().toISOString() })
        .eq("id", convId);

      setSent(true);
      toast.success("Mesajınız göndərildi!");
    } catch (e) {
      console.error(e);
      toast.error("Mesaj göndərilə bilmədi. Yenidən cəhd edin.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: "rgba(10,6,4,0.7)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl overflow-hidden shadow-2xl"
        style={{
          background: "linear-gradient(160deg, hsl(30 42% 99%) 0%, hsl(24 35% 96%) 100%)",
          border: "1px solid hsl(25 28% 87%)",
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "hsl(25 28% 87%)" }}>
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" style={{ color: "hsl(16 38% 44%)" }} />
            <h3 className="font-serif font-semibold text-foreground">
              {vendorName} — Mesaj Göndər
            </h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <div className="p-5">
          {!user ? (
            /* Not logged in */
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                style={{ background: "hsl(16 38% 48% / 0.12)" }}>
                <LogIn className="w-7 h-7" style={{ color: "hsl(16 38% 44%)" }} />
              </div>
              <p className="font-semibold text-foreground mb-1">Daxil olmaq lazımdır</p>
              <p className="text-sm text-muted-foreground mb-5">
                Xidmət sahibinə mesaj göndərmək üçün hesabınıza daxil olun.
              </p>
              <Link
                to="/auth"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
                style={{ background: "hsl(16 38% 44%)" }}
              >
                <LogIn className="w-4 h-4" />
                Daxil ol
              </Link>
            </div>
          ) : sent ? (
            /* Sent */
            <div className="text-center py-4">
              <div className="text-4xl mb-3">✅</div>
              <p className="font-semibold text-foreground mb-1">Mesajınız göndərildi!</p>
              <p className="text-sm text-muted-foreground mb-5">
                {vendorName} tezliklə cavab verəcək.
              </p>
              <div className="flex gap-2 justify-center">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-sm font-medium border transition-colors hover:bg-muted"
                  style={{ borderColor: "hsl(25 28% 85%)" }}
                >
                  Bağla
                </button>
              </div>
            </div>
          ) : (
            /* Message form */
            <>
              {serviceTitle && (
                <div className="mb-4 px-3 py-2 rounded-xl text-sm" style={{ background: "hsl(16 38% 48% / 0.08)", color: "hsl(16 38% 36%)" }}>
                  📎 {serviceTitle} haqqında
                </div>
              )}

              <div className="mb-4">
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Mesajınız</label>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  rows={5}
                  placeholder="Mesajınızı yazın..."
                  className="w-full rounded-xl px-3 py-2.5 text-sm outline-none resize-none"
                  style={{
                    background: "hsl(28 35% 96%)",
                    border: "1px solid hsl(25 28% 85%)",
                    color: "hsl(20 15% 18%)",
                  }}
                />
                <p className="text-xs text-muted-foreground mt-1">{message.length}/500</p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors hover:bg-muted"
                  style={{ borderColor: "hsl(25 28% 85%)" }}
                >
                  Ləğv et
                </button>
                <button
                  onClick={handleSend}
                  disabled={!message.trim() || sending}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-opacity disabled:opacity-50"
                  style={{ background: "hsl(16 38% 44%)" }}
                >
                  {sending ? (
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  ) : (
                    <><Send className="w-4 h-4" /> Göndər</>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}