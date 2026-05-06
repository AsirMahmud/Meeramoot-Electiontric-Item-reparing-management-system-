import { useState } from "react";
import { sendVerificationOtp, verifyOtp } from "@/lib/api";

type Props = {
  token: string;
  channel: "email" | "phone";
  contactValue: string;
  isVerified: boolean;
  onVerified: () => void;
};

export default function VerificationSection({ token, channel, contactValue, isVerified, onVerified }: Props) {
  const [loading, setLoading] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSendOtp = async () => {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const res = await sendVerificationOtp(token, channel);
      setMessage(res.message || "OTP sent successfully.");
      setShowOtpInput(true);
    } catch (err: any) {
      setError(err.message || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) return setError("Please enter OTP.");
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const res = await verifyOtp(token, channel, otp);
      setMessage(res.message || "Verified successfully.");
      setShowOtpInput(false);
      onVerified();
    } catch (err: any) {
      setError(err.message || "Failed to verify OTP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase text-slate-500">{channel === "email" ? "Email" : "Phone"}</p>
          <p className="text-sm font-medium text-slate-800">{contactValue}</p>
        </div>
        {isVerified ? (
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
            Verified
          </span>
        ) : (
          <button
            onClick={handleSendOtp}
            disabled={loading || showOtpInput}
            className="rounded-lg bg-accent-dark px-3 py-1.5 text-xs font-semibold text-white hover:bg-accent-dark/90 disabled:opacity-50"
          >
            {loading && !showOtpInput ? "Sending..." : "Verify"}
          </button>
        )}
      </div>

      {!isVerified && showOtpInput && (
        <div className="mt-3 flex flex-col gap-2 border-t border-slate-100 pt-3">
          <p className="text-xs text-slate-600">Enter the OTP sent to your {channel}</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="123456"
              className="flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-accent-dark"
            />
            <button
              onClick={handleVerifyOtp}
              disabled={loading}
              className="rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              {loading ? "..." : "Submit"}
            </button>
          </div>
        </div>
      )}

      {message && <p className="text-xs text-emerald-600">{message}</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
