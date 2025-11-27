// src/components/BusCard.jsx - Component displaying bus crowd information (Tailwind Refactor)
import React, { useEffect, useState } from 'react';
import { getCrowdScore } from '../api';
import CrowdButton from './CrowdButton';

export default function BusCard({ busId, routeId, stopId = null }) {
  const [score, setScore] = useState(null);
  const [category, setCategory] = useState(null);
  const [components, setComponents] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  async function fetchScore() {
    if (!busId || !routeId) {
        setLoading(false);
        return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await getCrowdScore({
        bus_id: busId,
        route_id: routeId,
      });
      setScore(res.crowd_score);
      setCategory(res.category);
      setComponents(res.components);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching crowd score:', err);
      setError('Failed to load crowd data');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchScore();
    const timer = setInterval(fetchScore, 15000); // Refresh every 15s
    return () => clearInterval(timer);
  }, [busId, routeId]);

  const getCategoryClasses = (cat) => {
    switch (cat) {
      case 'low':
        return 'text-green-700 bg-green-100';
      case 'medium':
        return 'text-yellow-700 bg-yellow-100';
      case 'high':
        return 'text-red-700 bg-red-100';
      default:
        return 'text-gray-700 bg-gray-100';
    }
  };

  const getCategoryColor = (cat) => {
    switch (cat) {
      case 'low':
        return '#4caf50';
      case 'medium':
        return '#ff9800';
      case 'high':
        return '#f44336';
      default:
        return '#757575';
    }
  };

  const getCategoryLabel = (cat) => {
    if (!cat) return '—';
    return cat.charAt(0).toUpperCase() + cat.slice(1);
  };

  const formatTime = (date) => {
    if (!date) return '';
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  if (!busId || !routeId) {
    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 max-w-sm mx-auto my-5 text-center text-gray-500">
            <p>Enter a Bus ID and Route ID above to load crowd data.</p>
        </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 max-w-sm mx-auto my-5">
      <div className="flex justify-between items-center border-b pb-3 mb-4 border-gray-100">
        <h3 className="text-xl font-bold text-gray-800">
          Route {routeId} — Bus {busId}
        </h3>
        {lastUpdated && (
          <span className="text-xs text-gray-500">
            Updated: {formatTime(lastUpdated)}
          </span>
        )}
      </div>

      {loading && !score && (
        <div className="py-4 text-center text-gray-600">Loading crowd data...</div>
      )}

      {error && (
        <div className="py-4 text-center text-red-500 flex justify-center items-center gap-2">
          {error}
          <button onClick={fetchScore} className="px-3 py-1 text-sm rounded-lg border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition">
            Retry
          </button>
        </div>
      )}

      {!loading && score !== null && (
        <>
          <div className="flex justify-between items-center mb-4">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-500">Crowd Score</span>
              <span
                className="text-6xl font-extrabold leading-none"
                style={{ color: getCategoryColor(category) }}
              >
                {score.toFixed(2)}
              </span>
            </div>
            <div
              className={`px-3 py-2 rounded-full font-semibold ${getCategoryClasses(category)}`}
            >
              {getCategoryLabel(category)}
            </div>
          </div>

          {components && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-600 mb-2">Score Components:</p>
              <div className="flex justify-between p-3 bg-gray-50 rounded-lg text-sm">
                <div className="flex flex-col items-center">
                  <span className="text-gray-500">Historical:</span>
                  <span className="font-semibold">{components.historicalAvg.toFixed(2)}</span>
                  <span className="text-xs text-gray-400">(50%)</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-gray-500">Recent Users:</span>
                  <span className="font-semibold">{components.recentUserAvg.toFixed(2)}</span>
                  <span className="text-xs text-gray-400">(30%)</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-gray-500">Driver:</span>
                  <span className="font-semibold">{components.driverLatest.toFixed(2)}</span>
                  <span className="text-xs text-gray-400">(20%)</span>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      <CrowdButton
        busId={busId}
        routeId={routeId}
        stopId={stopId}
        onReported={fetchScore}
      />
    </div>
  );
}