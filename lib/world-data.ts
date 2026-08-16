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

// Cache for countries and their states/cities
let cachedCountries: CountryData[] | null = null;

/**
 * Get all countries with their states and cities.
 * Uses country-state-city npm package for complete global data.
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
        states: (states || []).map((state) => {
          const cities = City.getCitiesOfState(country.isoCode, state.isoCode);
          
          return {
            name: state.name,
            code: state.isoCode,
            // Limit cities to first 50 to avoid huge lists
            cities: (cities || [])
              .slice(0, 50)
              .map((c) => c.name)
              .filter((name) => name && name.length > 0),
          };
        }),
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

// Helper: get cities for a state within a country
export function getCities(countryName: string, stateName: string): string[] {
  const country = findCountry(countryName);
  if (!country) return [];
  const state = country.states.find((s) => s.name === stateName);
  return state?.cities ?? [];
}

// For backwards compatibility with onboarding component
export const worldCountries: CountryData[] = getAllCountries();
