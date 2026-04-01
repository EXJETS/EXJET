"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, ArrowRight, ArrowLeft, Plane } from "lucide-react";
import { useBookingStore } from "@/stores/booking-store";
import BookingStepper from "@/components/booking/booking-stepper";
import TripSummary from "@/components/booking/trip-summary";
import type { PassengerInfo } from "@/types";

export default function PassengersPage() {
  const router = useRouter();
  const { jet, passengerCount, passengers, setPassengers, setStep } = useBookingStore();

  const [forms, setForms] = useState<PassengerInfo[]>(
    passengers.length > 0
      ? passengers
      : Array.from({ length: passengerCount }, () => ({
          firstName: "", lastName: "", email: "", phone: "", dateOfBirth: "", passportNumber: "",
        }))
  );

  const updateField = (index: number, field: keyof PassengerInfo, value: string) => {
    setForms((prev) => prev.map((p, i) => (i === index ? { ...p, [field]: value } : p)));
  };

  const isValid = forms.every((p) => p.firstName && p.lastName && p.email);

  const handleContinue = () => {
    setPassengers(forms);
    setStep(3);
    router.push("/booking/review");
  };

  if (!jet) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Plane className="w-12 h-12 text-gray-300 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Start from the beginning</h2>
        <Link href="/search" className="px-6 py-3 rounded-xl bg-amber-500 text-white font-semibold">Browse Jets</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BookingStepper currentStep={2} />

        <div className="flex flex-col lg:flex-row gap-8 mt-8">
          <div className="flex-1 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Passenger Information</h2>
            <p className="text-sm text-gray-500">Please provide details for all {passengerCount} passenger{passengerCount > 1 ? "s" : ""}.</p>

            {forms.map((passenger, idx) => (
              <div key={idx} className="bg-white rounded-2xl border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                    <User className="w-4 h-4 text-amber-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Passenger {idx + 1}{idx === 0 ? " (Lead)" : ""}</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                    <input
                      type="text" value={passenger.firstName}
                      onChange={(e) => updateField(idx, "firstName", e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                    <input
                      type="text" value={passenger.lastName}
                      onChange={(e) => updateField(idx, "lastName", e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
                      placeholder="Smith"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                    <input
                      type="email" value={passenger.email}
                      onChange={(e) => updateField(idx, "email", e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
                      placeholder="john@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel" value={passenger.phone}
                      onChange={(e) => updateField(idx, "phone", e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                    <input
                      type="date" value={passenger.dateOfBirth}
                      onChange={(e) => updateField(idx, "dateOfBirth", e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Passport Number</label>
                    <input
                      type="text" value={passenger.passportNumber}
                      onChange={(e) => updateField(idx, "passportNumber", e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
                      placeholder="Optional"
                    />
                  </div>
                </div>
              </div>
            ))}

            {/* Navigation */}
            <div className="flex justify-between mt-6">
              <button
                onClick={() => { setStep(1); router.push("/booking?jet=" + jet.id); }}
                className="px-6 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button
                onClick={handleContinue}
                disabled={!isValid}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold hover:from-amber-600 hover:to-amber-700 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                Continue to Review <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="w-full lg:w-80 shrink-0">
            <TripSummary />
          </div>
        </div>
      </div>
    </div>
  );
}
