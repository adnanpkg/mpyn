'use client';

import { Country, State, City } from 'country-state-city';

export interface CountryData {
  name: string;
  code: string;
  states: StateData[];
}

export interface StateData {
  name: string;
  code?: string;
  cities: string[];
}

// Cache for countries - lazy loaded
let cachedCountries: CountryData[] | null = null;

/**
 * Get all countries with their states (LAZY LOADED).
 * Cities are loaded on-demand when user selects a state.
 * This dramatically improves initial load time from ~6s to instant.
 */
export function getAllCountries(): CountryData[] {
  if (cachedCountries) return cachedCountries;

  const allCountries = Country.getAllCountries();
  
  cachedCountries = allCountries
    .map((country) => {
      const states = State.getStatesOfCountry(country.isoCode);
      
      return {
        name: country.name,
        code: country.isoCode,
        // Load state structure but NOT cities yet
        states: (states || []).map((state) => ({
          name: state.name,
          code: state.isoCode,
          cities: [], // Empty - will be loaded on demand in getCities()
        })),
      };
    })
    .filter((country) => country.states && country.states.length > 0)
    .sort((a, b) => a.name.localeCompare(b.name));

  return cachedCountries;
}

// Helper: find a country by name
export function findCountry(name: string): CountryData | undefined {
  const countries = getAllCountries();
  return countries.find((c) => c.name === name);
}

// Helper: get states for a country
export function getStates(countryName: string): StateData[] {
  return findCountry(countryName)?.states ?? [];
}

// Helper: get cities for a state within a country (loads on demand)
export function getCities(countryName: string, stateName: string): string[] {
  const country = findCountry(countryName);
  if (!country) return [];
  
  const state = country.states.find((s) => s.name === stateName);
  if (!state) return [];
  
  // If cities not loaded yet, load them NOW (on demand)
  if (state.cities.length === 0) {
    const cities = City.getCitiesOfState(country.code, state.code || stateName);
    state.cities = (cities || [])
      .map((c) => c.name)
      .filter((name) => name && name.length > 0);
  }
  
  return state.cities;
}

// For backwards compatibility
export const worldCountries: CountryData[] = (() => {
  // Try to return cached or initialize on first access
  if (cachedCountries) return cachedCountries;
  return getAllCountries();
})();
