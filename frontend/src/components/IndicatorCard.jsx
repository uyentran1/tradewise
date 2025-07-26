import React, { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";

const IndicatorCard = ({ name, value, signal, contribution, explanation }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const signalStyles = {
    BUY: "bg-emerald-100 text-emerald-700 border-emerald-300",
    SELL: "bg-red-100 text-red-700 border-red-300",
    HOLD: "bg-amber-100 text-amber-700 border-amber-300",
    NEUTRAL: "bg-slate-100 text-slate-700 border-slate-300",
  };

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition-all duration-200">
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-bold text-slate-800">{name}</h3>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${signalStyles[signal] || signalStyles.NEUTRAL}`}>
              {signal}
            </span>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-slate-500 hover:text-blue-600 transition-colors"
            aria-label={isExpanded ? "Collapse explanation" : "Expand explanation"}
          >
            {isExpanded ? (
              <ChevronUpIcon className="w-5 h-5" />
            ) : (
              <ChevronDownIcon className="w-5 h-5" />
            )}
          </button>
        </div>
        
        <div className="flex justify-between items-end">
          <div className="text-2xl font-mono font-bold text-slate-800">{value}</div>
          {contribution && (
            <div className="text-right">
              <div className={`text-sm font-bold ${contribution.contribution >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {contribution.contribution >= 0 ? '+' : ''}{contribution.contribution.toFixed(2)} pts
              </div>
              <div className="text-xs text-slate-500">
                Strength: {(contribution.strength * 100).toFixed(0)}%
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Educational Dropdown */}
      {isExpanded && (
        <div className="border-t border-slate-200 bg-white p-6">
          <h4 className="font-bold text-slate-800 mb-3">{explanation.title}</h4>
          <p className="text-slate-600 mb-4 leading-relaxed">{explanation.description}</p>
          <div className="space-y-2">
            <h5 className="font-semibold text-slate-700">How to interpret:</h5>
            {explanation.interpretation.map((item, index) => (
              <div key={index} className="text-sm text-slate-600 leading-relaxed">{item}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default IndicatorCard;