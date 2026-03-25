import { useState, useEffect, useMemo, useCallback } from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import type { Layer, PathOptions } from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  countryLanguages,
  allLanguages,
  getCountriesByLanguages,
} from "@/data/languageData";

interface CountryProperties {
  // Different GeoJSON sources use different property names
  "ISO3166-1-Alpha-3"?: string;
  ISO_A3?: string;
  ISO_A3_EH?: string;
  name?: string;
  ADMIN?: string;
  [key: string]: unknown;
}

// Helper to extract country code from various GeoJSON formats
function getCountryCode(props: CountryProperties): string {
  // Try different property names used by various GeoJSON sources
  const code = props["ISO3166-1-Alpha-3"] || props.ISO_A3 || props.ISO_A3_EH || "";
  // Some sources use -99 for disputed territories
  return code === "-99" ? "" : code;
}

// Helper to get country name
function getCountryName(props: CountryProperties): string {
  const name = props.name || props.ADMIN;
  return name && name !== "-99" ? name : "Unknown territory";
}

const GEOJSON_URL =
  "https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson";

export default function LanguageMap() {
  const [geoData, setGeoData] = useState<FeatureCollection | null>(null);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch GeoJSON data
  useEffect(() => {
    fetch(GEOJSON_URL)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch map data");
        return res.json();
      })
      .then((data: FeatureCollection) => {
        setGeoData(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Calculate matching countries based on selected languages
  const matchingCountries = useMemo(() => {
    if (selectedLanguages.length === 0) return new Map<string, string[]>();
    return getCountriesByLanguages(selectedLanguages);
  }, [selectedLanguages]);

  // Filter languages for dropdown
  const filteredLanguages = useMemo(() => {
    if (!searchTerm) return allLanguages;
    const term = searchTerm.toLowerCase();
    return allLanguages.filter((lang) => lang.toLowerCase().includes(term));
  }, [searchTerm]);

  // Add a language
  const addLanguage = useCallback((language: string) => {
    setSelectedLanguages((prev) => {
      if (prev.includes(language)) return prev;
      return [...prev, language];
    });
    setSearchTerm("");
    setIsDropdownOpen(false);
  }, []);

  // Remove a language
  const removeLanguage = useCallback((language: string) => {
    setSelectedLanguages((prev) => prev.filter((l) => l !== language));
  }, []);

  // Create a Set of matching country codes for faster lookup
  const matchingCountryCodes = useMemo(() => {
    return new Set(matchingCountries.keys());
  }, [matchingCountries]);

  // Style function for GeoJSON features - defined fresh each render to capture current state
  const styleFeature = (feature: Feature<Geometry, CountryProperties> | undefined): PathOptions => {
    if (!feature?.properties) {
      return { fillColor: "#94a3b8", fillOpacity: 0.2, color: "#64748b", weight: 0.5 };
    }

    const countryCode = getCountryCode(feature.properties);

    if (matchingCountryCodes.has(countryCode)) {
      const matchedLangs = matchingCountries.get(countryCode) || [];
      const intensity = Math.min(0.4 + matchedLangs.length * 0.15, 0.85);
      return {
        fillColor: "#22c55e",
        fillOpacity: intensity,
        color: "#16a34a",
        weight: 1.5,
      };
    }

    return {
      fillColor: "#94a3b8",
      fillOpacity: 0.2,
      color: "#64748b",
      weight: 0.5,
    };
  };

  // Event handlers for each country feature
  const onEachCountry = useCallback(
    (feature: Feature<Geometry, CountryProperties>, layer: Layer) => {
      if (!feature?.properties) return;

      const countryCode = getCountryCode(feature.properties);
      const geoJsonName = getCountryName(feature.properties);
      const countryName = countryLanguages[countryCode]?.name || geoJsonName;
      const countryLangs = countryLanguages[countryCode]?.languages || [];
      const matchedLangs = matchingCountries.get(countryCode) || [];

      // Build tooltip content
      let tooltipContent = `<strong>${countryName}</strong>`;
      if (countryLangs.length > 0) {
        tooltipContent += `<br/>Languages: ${countryLangs.join(", ")}`;
      }
      if (matchedLangs.length > 0) {
        tooltipContent += `<br/><span style="color: #22c55e;">You speak: ${matchedLangs.join(
          ", "
        )}</span>`;
      }

      layer.bindTooltip(tooltipContent, {
        sticky: true,
        className: "country-tooltip",
      });
    },
    [matchingCountries]
  );

  // Calculate statistics
  const stats = useMemo(() => {
    const totalCountries = Object.keys(countryLanguages).length;
    const matchingCount = matchingCountries.size;
    const percentage = totalCountries > 0
      ? Math.round((matchingCount / totalCountries) * 100)
      : 0;
    return { totalCountries, matchingCount, percentage };
  }, [matchingCountries]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading map data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96 bg-red-50 dark:bg-red-900/20 rounded-lg">
        <div className="text-center text-red-600 dark:text-red-400">
          <p className="font-semibold">Failed to load map</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Language Input Section */}
      <div className="relative z-[1000] bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          What languages do you speak?
        </label>

        {/* Search Input */}
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setIsDropdownOpen(true);
            }}
            onFocus={() => setIsDropdownOpen(true)}
            placeholder="Search and add languages..."
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                       focus:ring-2 focus:ring-sky-500 focus:border-transparent
                       placeholder-gray-400 dark:placeholder-gray-500"
          />

          {/* Dropdown */}
          {isDropdownOpen && filteredLanguages.length > 0 && (
            <div className="absolute z-[1001] w-full mt-1 max-h-60 overflow-auto bg-white dark:bg-gray-800
                            border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg">
              {filteredLanguages.slice(0, 20).map((language) => (
                <button
                  key={language}
                  onClick={() => addLanguage(language)}
                  disabled={selectedLanguages.includes(language)}
                  className={`w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700
                              ${
                                selectedLanguages.includes(language)
                                  ? "text-gray-400 dark:text-gray-500 cursor-not-allowed"
                                  : "text-gray-900 dark:text-gray-100"
                              }`}
                >
                  {language}
                  {selectedLanguages.includes(language) && (
                    <span className="ml-2 text-xs">(selected)</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Selected Languages Tags */}
        {selectedLanguages.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {selectedLanguages.map((language) => (
              <span
                key={language}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm
                           bg-sky-100 dark:bg-sky-900 text-sky-800 dark:text-sky-200"
              >
                {language}
                <button
                  onClick={() => removeLanguage(language)}
                  className="ml-2 hover:text-sky-600 dark:hover:text-sky-400"
                  aria-label={`Remove ${language}`}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </span>
            ))}
            <button
              onClick={() => setSelectedLanguages([])}
              className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Stats */}
        {selectedLanguages.length > 0 && (
          <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
            You can communicate in{" "}
            <span className="font-semibold text-green-600 dark:text-green-400">
              {stats.matchingCount}
            </span>{" "}
            countries ({stats.percentage}% of the world)
          </div>
        )}
      </div>

      {/* Click outside to close dropdown - positioned here so it's below dropdown but above map */}
      {isDropdownOpen && (
        <div
          className="fixed inset-0 z-[999]"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}

      {/* Map Container */}
      <div className="relative rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
        <MapContainer
          center={[20, 0]}
          zoom={2}
          minZoom={1}
          maxZoom={6}
          style={{ height: "500px", width: "100%" }}
          className="bg-gray-100 dark:bg-gray-800"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          />
          {geoData && (
            <GeoJSON
              key={selectedLanguages.join(",")}
              data={geoData}
              style={styleFeature}
              onEachFeature={onEachCountry}
            />
          )}
        </MapContainer>

        {/* Legend */}
        <div className="absolute bottom-4 right-4 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg
                        border border-gray-200 dark:border-gray-700 z-[1000]">
          <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
            Legend
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
            <div className="w-4 h-4 rounded bg-green-500 opacity-60"></div>
            <span>You can communicate here</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 mt-1">
            <div className="w-4 h-4 rounded bg-gray-400 opacity-40"></div>
            <span>Language barrier</span>
          </div>
        </div>
      </div>

    </div>
  );
}
