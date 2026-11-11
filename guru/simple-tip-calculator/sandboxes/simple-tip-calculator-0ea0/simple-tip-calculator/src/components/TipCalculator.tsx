"use client";

import { useState, useMemo } from "react";

export default function TipCalculator() {
  const [billAmount, setBillAmount] = useState<string>("");
  const [tipPercentage, setTipPercentage] = useState<string>("15");
  const [numberOfPeople, setNumberOfPeople] = useState<number>(1);
  const [roundUp, setRoundUp] = useState<boolean>(false);

  const calculations = useMemo(() => {
    const bill = parseFloat(billAmount) || 0;
    const tipPercent = parseFloat(tipPercentage) || 0;
    
    if (bill < 0) return null;
    
    const tipAmount = (bill * tipPercent) / 100;
    const totalWithTip = bill + tipAmount;
    
    const perPersonTip = tipAmount / numberOfPeople;
    const perPersonTotal = totalWithTip / numberOfPeople;
    
    let finalPerPersonTotal = perPersonTotal;
    let roundedExtra = 0;
    
    if (roundUp && perPersonTotal > 0) {
      finalPerPersonTotal = Math.ceil(perPersonTotal);
      roundedExtra = (finalPerPersonTotal - perPersonTotal) * numberOfPeople;
    }
    
    const finalTotal = finalPerPersonTotal * numberOfPeople;
    
    return {
      tipAmount,
      totalWithTip,
      perPersonTip,
      perPersonTotal,
      finalPerPersonTotal,
      finalTotal,
      roundedExtra,
    };
  }, [billAmount, tipPercentage, numberOfPeople, roundUp]);

  const formatCurrency = (amount: number): string => {
    return `$${amount.toFixed(2)}`;
  };

  return (
    <div className="min-h-screen bg-forest-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-forest-600">
        <div className="bg-gradient-to-r from-forest-700 to-forest-600 p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">Tip Calculator</h1>
          <p className="text-forest-100">Calculate tips and split bills with ease</p>
        </div>
        
        <div className="p-8 space-y-6">
          {/* Bill Amount */}
          <div>
            <label htmlFor="billAmount" className="block text-sm font-semibold text-sage-900 mb-2">
              Bill Amount
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sage-600 text-lg">$</span>
              <input
                id="billAmount"
                type="number"
                step="0.01"
                min="0"
                value={billAmount}
                onChange={(e) => setBillAmount(e.target.value)}
                className="w-full pl-10 pr-4 py-3 text-lg border-2 border-sage-300 rounded-lg focus:outline-none focus:border-forest-600 focus:ring-2 focus:ring-forest-200"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Tip Percentage */}
          <div>
            <label htmlFor="tipPercentage" className="block text-sm font-semibold text-sage-900 mb-2">
              Tip Percentage
            </label>
            <div className="flex gap-2 mb-3">
              {[10, 15, 18, 20, 25].map((percent) => (
                <button
                  key={percent}
                  onClick={() => setTipPercentage(percent.toString())}
                  className={`flex-1 py-2 px-3 rounded-lg font-semibold transition-colors ${
                    tipPercentage === percent.toString()
                      ? "bg-forest-600 text-white"
                      : "bg-sage-100 text-sage-700 hover:bg-sage-200"
                  }`}
                >
                  {percent}%
                </button>
              ))}
            </div>
            <div className="relative">
              <input
                id="tipPercentage"
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={tipPercentage}
                onChange={(e) => setTipPercentage(e.target.value)}
                className="w-full pl-4 pr-10 py-3 text-lg border-2 border-sage-300 rounded-lg focus:outline-none focus:border-forest-600 focus:ring-2 focus:ring-forest-200"
                placeholder="15"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sage-600 text-lg">%</span>
            </div>
          </div>

          {/* Number of People */}
          <div>
            <label htmlFor="numberOfPeople" className="block text-sm font-semibold text-sage-900 mb-2">
              Split Between
            </label>
            <div className="flex gap-2 mb-3">
              {[1, 2, 3, 4, 5].map((num) => (
                <button
                  key={num}
                  onClick={() => setNumberOfPeople(num)}
                  className={`flex-1 py-2 px-3 rounded-lg font-semibold transition-colors ${
                    numberOfPeople === num
                      ? "bg-forest-600 text-white"
                      : "bg-sage-100 text-sage-700 hover:bg-sage-200"
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
            <input
              id="numberOfPeople"
              type="number"
              min="1"
              max="10"
              value={numberOfPeople}
              onChange={(e) => {
                const val = parseInt(e.target.value) || 1;
                setNumberOfPeople(Math.max(1, Math.min(10, val)));
              }}
              className="w-full px-4 py-3 text-lg border-2 border-sage-300 rounded-lg focus:outline-none focus:border-forest-600 focus:ring-2 focus:ring-forest-200"
            />
            <p className="text-xs text-sage-600 mt-1">Maximum 10 people</p>
          </div>

          {/* Round Up Toggle */}
          <div className="flex items-center justify-between p-4 bg-sage-50 rounded-lg border border-sage-200">
            <div>
              <label htmlFor="roundUp" className="block text-sm font-semibold text-sage-900 mb-1">
                Round Up
              </label>
              <p className="text-xs text-sage-600">Round each person's total to the nearest dollar</p>
            </div>
            <button
              id="roundUp"
              onClick={() => setRoundUp(!roundUp)}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-forest-600 focus:ring-offset-2 ${
                roundUp ? "bg-forest-600" : "bg-sage-300"
              }`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                  roundUp ? "translate-x-7" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* Results */}
          {calculations && parseFloat(billAmount) > 0 && (
            <div className="mt-8 pt-6 border-t-2 border-sage-200 space-y-4">
              <div className="bg-forest-50 p-6 rounded-xl border-2 border-forest-200">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-sage-600 mb-1">Tip Amount</p>
                    <p className="text-2xl font-bold text-forest-700">
                      {formatCurrency(calculations.tipAmount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-sage-600 mb-1">Total with Tip</p>
                    <p className="text-2xl font-bold text-forest-700">
                      {formatCurrency(calculations.totalWithTip)}
                    </p>
                  </div>
                </div>

                {numberOfPeople > 1 && (
                  <div className="pt-4 border-t border-forest-300">
                    <p className="text-sm font-semibold text-sage-900 mb-3">Per Person</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-sage-600 mb-1">Tip</p>
                        <p className="text-lg font-semibold text-forest-700">
                          {formatCurrency(calculations.perPersonTip)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-sage-600 mb-1">Total</p>
                        <p className="text-lg font-semibold text-forest-700">
                          {formatCurrency(
                            roundUp
                              ? calculations.finalPerPersonTotal
                              : calculations.perPersonTotal
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {roundUp && calculations.roundedExtra > 0 && (
                  <div className="mt-4 p-3 bg-forest-100 rounded-lg border border-forest-300">
                    <p className="text-xs text-sage-600 mb-1">
                      Rounded Total (all {numberOfPeople} {numberOfPeople === 1 ? "person" : "people"})
                    </p>
                    <p className="text-xl font-bold text-forest-800">
                      {formatCurrency(calculations.finalTotal)}
                    </p>
                    <p className="text-xs text-sage-600 mt-1">
                      (includes +{formatCurrency(calculations.roundedExtra)} from rounding)
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
