"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CheckCircle, Loader2 } from "lucide-react";
import { Navbar } from "@/components/Navbar";

export default function KYCPage() {
  const { user } = usePrivy();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmitKYC = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/kyc/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/");
        }, 2000);
      }
    } catch (error) {
      console.error("Error submitting KYC:", error);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-2xl shadow-lg text-center">
          <CheckCircle className="w-16 h-16 mx-auto text-green-500" />
          <h1 className="text-2xl font-bold text-slate-900">
            KYC Verification Complete!
          </h1>
          <p className="text-slate-600">
            Redirecting you to the dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-4">
            Complete KYC Verification
          </h1>
          <p className="text-slate-600 mb-8">
            To comply with regulatory requirements and protect our investors, we need to verify your identity.
          </p>

          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-3">What you'll need:</h3>
              <div className="text-blue-800 space-y-2">
                <p>Government-issued ID (Passport or Driver's License)</p>
                <p>Proof of address (Utility bill or bank statement)</p>
                <p>Accredited investor verification documents</p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-lg p-4">
              <h3 className="font-semibold text-slate-900 mb-2">Your Information</h3>
              <p className="text-sm text-slate-600">
                Email: {user?.email?.address || "Not provided"}
              </p>
              {user?.wallet && (
                <p className="text-sm text-slate-600">
                  Wallet: {user.wallet.address}
                </p>
              )}
            </div>

            <div className="pt-4">
              <p className="text-sm text-slate-500 mb-4">
                Note: This is a simplified KYC flow for development. In production, you would integrate with a KYC provider like Persona, Onfido, or Jumio.
              </p>
              <button
                onClick={handleSubmitKYC}
                disabled={loading}
                className="w-full bg-[#C59B26] text-white py-3 px-6 rounded-lg font-semibold hover:bg-[#B08B20] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  "Complete Verification (Demo)"
                )}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
