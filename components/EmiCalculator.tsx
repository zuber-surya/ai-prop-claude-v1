"use client";

import { useState } from "react";
import { calculateEmi } from "@/lib/emi";

export function EmiCalculator({ propertyPricePaise }: { propertyPricePaise: number }) {
  const propertyPriceRupees = propertyPricePaise / 100;
  const defaultLoan = Math.round(propertyPriceRupees * 0.8);

  const [loanAmount, setLoanAmount] = useState(defaultLoan);
  const [rate, setRate] = useState(8.5);
  const [tenure, setTenure] = useState(20);

  const emi = calculateEmi(loanAmount, rate, tenure);
  const totalPayable = emi * tenure * 12;
  const totalInterest = totalPayable - loanAmount;

  return (
    <section className="rounded-lg border border-outline-variant bg-surface-container p-6">
      <h2 className="mb-6 text-xl font-bold text-on-surface">
        Affordability calculator
      </h2>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="flex flex-col gap-6">
          <SliderField
            label="Loan amount"
            value={loanAmount}
            display={`₹${loanAmount.toLocaleString("en-IN")}`}
            min={100000}
            max={propertyPriceRupees}
            step={50000}
            onChange={setLoanAmount}
          />
          <SliderField
            label="Interest rate"
            value={rate}
            display={`${rate.toFixed(1)}%`}
            min={5}
            max={15}
            step={0.1}
            onChange={setRate}
          />
          <SliderField
            label="Tenure"
            value={tenure}
            display={`${tenure} years`}
            min={5}
            max={30}
            step={1}
            onChange={setTenure}
          />
        </div>
        <div className="flex flex-col items-center justify-center rounded-lg border border-outline-variant bg-surface-container-lowest p-6 text-center">
          <div className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant">
            Estimated monthly EMI
          </div>
          <div className="mt-1 text-4xl font-bold text-primary">
            ₹{Math.round(emi).toLocaleString("en-IN")}
          </div>
          <div className="my-6 h-px w-full bg-outline-variant" />
          <div className="grid w-full grid-cols-2 gap-4 text-left">
            <div>
              <div className="text-xs text-on-surface-variant">Principal</div>
              <div className="font-semibold">
                ₹{loanAmount.toLocaleString("en-IN")}
              </div>
            </div>
            <div>
              <div className="text-xs text-on-surface-variant">Total interest</div>
              <div className="font-semibold">
                ₹{Math.round(totalInterest).toLocaleString("en-IN")}
              </div>
            </div>
          </div>
        </div>
      </div>
      <p className="mt-4 text-xs text-on-surface-variant">
        Estimate only, for planning purposes - not a loan offer.
      </p>
    </section>
  );
}

function SliderField({
  label,
  value,
  display,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  display: string;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="mb-2 flex justify-between text-sm font-semibold">
        <span className="text-on-surface">{label}</span>
        <span className="text-primary">{display}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-outline-variant accent-primary"
        aria-label={label}
      />
    </div>
  );
}
