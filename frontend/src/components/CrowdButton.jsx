// src/components/CrowdButton.jsx - Component for reporting crowd levels (Tailwind Refactor)
import React, { useState } from 'react';
import { postCrowdingReport } from '../api';

export default function CrowdButton({ busId, routeId, stopId, onReported }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastReported, setLastReported] = useState(null);

  const report = async (level) => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      await postCrowdingReport({
        bus_id: busId,
        route_id: routeId,
        stop_id: stopId,
        crowd_level: level,
        source: 'user',
      });

      setLastReported(level);
      if (onReported) {
        await onReported();
      }

      // Show success feedback
      setTimeout(() => {
        setLastReported(null);
      }, 2000);
    } catch (err) {
      console.error('Failed to submit report:', err);
      alert('Failed to send report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getLevelLabel = (level) => {
    switch (level) {
      case 1:
        return 'Low';
      case 2:
        return 'Medium';
      case 3:
        return 'High';
      default:
        return '';
    }
  };

  const getLevelEmoji = (level) => {
    switch (level) {
      case 1:
        return '🟢';
      case 2:
        return '🟡';
      case 3:
        return '🔴';
      default:
        return '';
    }
  };

  const getLevelClasses = (level) => {
    switch (level) {
      case 1:
        return 'bg-green-100 text-green-700 border-green-500 hover:bg-green-200';
      case 2:
        return 'bg-yellow-100 text-yellow-700 border-yellow-500 hover:bg-yellow-200';
      case 3:
        return 'bg-red-100 text-red-700 border-red-500 hover:bg-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  return (
    <div className="border-t pt-4 mt-4 border-gray-200">
      <p className="font-semibold text-gray-700 mb-3">Report Crowding:</p>
      <div className="flex gap-2 justify-between">
        {[1, 2, 3].map((level) => (
          <button
            key={level}
            className={`
              flex flex-col items-center flex-grow py-3 px-2 rounded-xl cursor-pointer border-2 font-bold text-base transition-all
              ${getLevelClasses(level)}
              ${lastReported === level ? 'scale-105 shadow-md ring-2 ring-opacity-70 ring-current' : ''}
              ${isSubmitting ? 'opacity-60 cursor-not-allowed' : ''}
            `}
            onClick={() => report(level)}
            disabled={isSubmitting}
            title={`Report ${getLevelLabel(level)} crowding`}
          >
            <span className="text-2xl leading-none mb-1">{getLevelEmoji(level)}</span>
            <span className="text-sm">{getLevelLabel(level)}</span>
          </button>
        ))}
      </div>
      {isSubmitting && (
        <p className="mt-2 text-center text-sm text-gray-500">Submitting...</p>
      )}
      {lastReported && !isSubmitting && (
        <p className="mt-2 text-center text-sm font-semibold text-green-600">
          ✓ Thanks for reporting!
        </p>
      )}
    </div>
  );
}