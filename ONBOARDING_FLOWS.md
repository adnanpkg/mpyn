# Multiply. Onboarding Flows - GPS + Global Cities

## Data Sources
- **Countries/States/Cities**: country-state-city npm package v3.2.1
- **Total Coverage**: ~249 countries, ~4000 states/provinces, ~150,000+ cities
- **India**: 36 states, UP has 624 cities (Agra, Aligarh, Allahabad, etc.)
- **Location Reverse Geocoding**: OpenStreetMap Nominatim API (free, no API key)

## Signup Flow Diagram

```
Welcome Page
    ↓
Step 0: Location Auto-Detection
    ├─→ [Auto-Detect] → GPS Permission
    │       ↓
    │   Get Coordinates
    │       ↓
    │   Reverse Geocode (OSM Nominatim)
    │       ↓
    │   Confirmation Screen (shows detected location)
    │       ├─→ [Yes, that's right] → Match to DB → Step 4 (Role)
    │       └─→ [No, manual] → Step 1 (Country)
    │
    └─→ [Select Manually] → Step 1 (Country Picker)
            ↓
        Step 2 (State Picker)
            ↓
        Step 3 (City Picker)
            ↓
        Step 4 (Role: Creator/Business)
            ↓
        Step 5 (Email Entry)
            ↓
        Step 6 (OTP Verification)
            ↓
        Step 7 (Username)
            ↓
        Complete Profile & Auto-Create Creator/Business Profile
```

## Test Scenarios

### Scenario 1: GPS Auto-Detection Success ✓
**Flow**: Step 0 → Auto-Detect → GPS Permission → Confirmation → "Yes" → Step 4

**What Happens**:
1. User clicks "Auto-Detect" button
2. Browser requests GPS permission
3. Coordinates retrieved (lat/lon)
4. Nominatim reverse geocodes to: country, state, city
5. Shows confirmation screen with detected location
6. User reviews: "Is this you?" 
7. User clicks "Yes, that's right"
8. System matches detected location to country-state-city database
9. Auto-fills selectedCountry, selectedState, selectedCity
10. Skips to Step 4 (Role selection: creator/business)

**Test With**: Your location in Uttar Pradesh, India
- Expected Detection: Country="India", State="Uttar Pradesh", City=[your city]
- Expected Cities Available: Agra, Aligarh, Allahabad, Kanpur, Lucknow, Varanasi, etc.

---

### Scenario 2: GPS Auto-Detection Rejected ✓
**Flow**: Step 0 → Auto-Detect → GPS Permission → Confirmation → "No" → Step 1

**What Happens**:
1. User clicks "Auto-Detect"
2. GPS detection succeeds (shows confirmation)
3. User clicks "No, let me select manually"
4. Returns to Step 1 (Country Picker)
5. User manually selects: Country → State → City
6. Proceeds to Step 4 (Role selection)

---

### Scenario 3: Manual Location Selection ✓
**Flow**: Step 0 → "Select Manually" → Step 1 → Step 2 → Step 3 → Step 4

**What Happens**:
1. User clicks "Select Manually" from Step 0
2. Step 1: Search and select Country (e.g., "India")
3. Step 2: Search and select State (e.g., "Uttar Pradesh")
4. Step 3: Search and select City (e.g., "Lucknow")
5. Step 4: Select Role (Creator or Business)
6. Step 5-7: Email → OTP → Username
7. Profile complete

**Test Case**: Your friend from Indiana, USA
- Country: United States → State: Indiana → City: Indianapolis/Indianpolis
- Cities Available: Indianapolis, Fort Wayne, Evansville, South Bend, Bloomington, etc.

---

### Scenario 4: GPS Permission Denied ✓
**Flow**: Step 0 → Auto-Detect → Denied → Error Message → "Select Manually"

**What Happens**:
1. User clicks "Auto-Detect"
2. Browser denies GPS permission
3. Error shown: "Could not get location. Please allow GPS access."
4. User clicks "Select Manually"
5. Proceeds to Step 1 (manual country picker)

---

### Scenario 5: GPS Success but Location Unmatchable ✓
**Flow**: Step 0 → Auto-Detect → GPS Success → Location Not in DB → Error → Step 1

**What Happens**:
1. User clicks "Auto-Detect"
2. GPS coordinates retrieved
3. Reverse geocoding returns location (e.g., country from OSM)
4. System tries to match to country-state-city database
5. If no match found (unlikely, but possible edge case):
   - Error: "Country not found. Please select manually."
   - Falls back to Step 1 (manual selection)

---

## Data Validation

### Uttar Pradesh Cities (Sample)
```
Achhnera, Afzalgarh, Agra, Ahraura, Aidalpur, Airwa, Akbarpur, 
Akola, Aliganj, Aligarh, Allahabad, Allahganj, Amanpur, Amauli, 
Ambahta, Ambedkar Nagar, Amethi, Amroha, Anandnagar, Antu, ...
[and 600+ more]
```

### All Indian States Coverage
```
Andaman and Nicobar Islands, Andhra Pradesh, Arunachal Pradesh, Assam,
Bihar, Chandigarh, Chhattisgarh, Dadra and Nagar Haveli and Daman and Diu,
Delhi, Goa, Gujarat, Haryana, Himachal Pradesh, Jammu and Kashmir,
Jharkhand, Karnataka, Kerala, Ladakh, Lakshadweep, Madhya Pradesh,
Maharashtra, Manipur, Meghalaya, Mizoram, Nagaland, Odisha, Puducherry,
Punjab, Rajasthan, Sikkim, Tamil Nadu, Telangana, Tripura,
Uttar Pradesh (624 cities), Uttarakhand, West Bengal
```

---

## Technical Details

### Libraries Used
- `country-state-city` v3.2.1 - Country/state/city database
- Browser `Geolocation API` - GPS access
- OpenStreetMap `Nominatim` - Reverse geocoding

### Error Handling
- ✓ GPS permission denied
- ✓ GPS timeout (5 second limit)
- ✓ Reverse geocoding API failure
- ✓ Country not in database
- ✓ State not in database
- ✓ City not in database
- ✓ All fallback to manual selection

### Performance
- Location database cached in memory on first load
- City matching is case-insensitive
- No round-trip API calls for country/state/city validation
- Nominatim reverse geocoding is free (rate-limited but sufficient for signup)

---

## Testing Checklist

- [ ] **Test GPS Success**: Allow GPS, confirm detected location shows correctly
- [ ] **Test GPS Rejection**: Deny GPS, verify fallback to manual works
- [ ] **Test Manual UP Selection**: India → Uttar Pradesh → your city (should be in 624 list)
- [ ] **Test Indiana User**: United States → Indiana → city of choice
- [ ] **Test Search Filter**: Search "Lucknow" in UP, "Indianapolis" in Indiana
- [ ] **Test Scroll**: Can scroll through long city lists (UP has 624)
- [ ] **Test Back Button**: From each step, back button works correctly
- [ ] **Test Profile Creation**: After location selected, profile completes successfully
