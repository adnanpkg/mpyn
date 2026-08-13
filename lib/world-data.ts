export interface CountryData {
  name: string;
  code: string;
  states: StateData[];
}

export interface StateData {
  name: string;
  cities: string[];
}

export const worldCountries: CountryData[] = [
  {
    name: 'India',
    code: 'IN',
    states: [
      { name: 'Andhra Pradesh', cities: ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Kurnool', 'Rajahmundry', 'Tirupati', 'Kadapa', 'Anantapur'] },
      { name: 'Arunachal Pradesh', cities: ['Itanagar', 'Naharlagun', 'Pasighat', 'Tawang', 'Ziro', 'Bomdila'] },
      { name: 'Assam', cities: ['Guwahati', 'Silchar', 'Dibrugarh', 'Jorhat', 'Nagaon', 'Tinsukia', 'Tezpur'] },
      { name: 'Bihar', cities: ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Purnia', 'Darbhanga', 'Ara', 'Begusarai'] },
      { name: 'Chhattisgarh', cities: ['Raipur', 'Bhilai', 'Bilaspur', 'Korba', 'Durg', 'Rajnandgaon', 'Jagdalpur'] },
      { name: 'Goa', cities: ['Panaji', 'Margao', 'Vasco da Gama', 'Mapusa', 'Ponda'] },
      { name: 'Gujarat', cities: ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar', 'Gandhinagar', 'Junagadh', 'Anand'] },
      { name: 'Haryana', cities: ['Gurugram', 'Faridabad', 'Panipat', 'Ambala', 'Karnal', 'Rohtak', 'Hisar', 'Sonipat', 'Panchkula'] },
      { name: 'Himachal Pradesh', cities: ['Shimla', 'Dharamshala', 'Manali', 'Solan', 'Mandi', 'Kullu'] },
      { name: 'Jharkhand', cities: ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro', 'Hazaribagh', 'Deoghar'] },
      { name: 'Karnataka', cities: ['Bengaluru', 'Mysuru', 'Hubballi', 'Mangaluru', 'Belagavi', 'Davangere', 'Ballari', 'Tumakuru', 'Shivamogga', 'Udupi'] },
      { name: 'Kerala', cities: ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur', 'Kollam', 'Alappuzha', 'Palakkad', 'Kannur', 'Kottayam'] },
      { name: 'Madhya Pradesh', cities: ['Bhopal', 'Indore', 'Jabalpur', 'Gwalior', 'Ujjain', 'Sagar', 'Dewas', 'Satna', 'Ratlam'] },
      { name: 'Maharashtra', cities: ['Mumbai', 'Pune', 'Nagpur', 'Thane', 'Nashik', 'Aurangabad', 'Solapur', 'Kolhapur', 'Amravati', 'Navi Mumbai'] },
      { name: 'Manipur', cities: ['Imphal', 'Thoubal', 'Bishnupur', 'Churachandpur'] },
      { name: 'Meghalaya', cities: ['Shillong', 'Tura', 'Jowai', 'Nongpoh'] },
      { name: 'Mizoram', cities: ['Aizawl', 'Lunglei', 'Champhai', 'Serchhip'] },
      { name: 'Nagaland', cities: ['Kohima', 'Dimapur', 'Mokokchung', 'Tuensang'] },
      { name: 'Odisha', cities: ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Berhampur', 'Sambalpur', 'Puri', 'Balasore'] },
      { name: 'Punjab', cities: ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda', 'Mohali', 'Pathankot'] },
      { name: 'Rajasthan', cities: ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Bikaner', 'Ajmer', 'Alwar', 'Bhilwara', 'Bharatpur'] },
      { name: 'Sikkim', cities: ['Gangtok', 'Namchi', 'Gyalshing', 'Mangan'] },
      { name: 'Tamil Nadu', cities: ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Erode', 'Vellore', 'Tirunelveli', 'Thanjavur'] },
      { name: 'Telangana', cities: ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar', 'Khammam', 'Nalgonda'] },
      { name: 'Tripura', cities: ['Agartala', 'Udaipur', 'Dharmanagar', 'Kailashahar'] },
      { name: 'Uttar Pradesh', cities: ['Lucknow', 'Kanpur', 'Agra', 'Varanasi', 'Meerut', 'Ghaziabad', 'Noida', 'Prayagraj', 'Bareilly', 'Aligarh', 'Moradabad'] },
      { name: 'Uttarakhand', cities: ['Dehradun', 'Haridwar', 'Roorkee', 'Haldwani', 'Rudrapur', 'Rishikesh', 'Kashipur'] },
      { name: 'West Bengal', cities: ['Kolkata', 'Asansol', 'Siliguri', 'Durgapur', 'Bardhaman', 'Malda', 'Barasat', 'Howrah'] },
      { name: 'Delhi', cities: ['New Delhi', 'Delhi'] },
      { name: 'Jammu & Kashmir', cities: ['Srinagar', 'Jammu', 'Anantnag', 'Sopore', 'Baramulla'] },
      { name: 'Ladakh', cities: ['Leh', 'Kargil'] },
      { name: 'Chandigarh', cities: ['Chandigarh'] },
      { name: 'Puducherry', cities: ['Puducherry', 'Karaikal', 'Mahe', 'Yanam'] },
    ],
  },
  {
    name: 'United States',
    code: 'US',
    states: [
      { name: 'California', cities: ['Los Angeles', 'San Francisco', 'San Diego', 'San Jose', 'Sacramento', 'Oakland', 'Fresno', 'Long Beach', 'Bakersfield', 'Anaheim'] },
      { name: 'New York', cities: ['New York City', 'Buffalo', 'Rochester', 'Yonkers', 'Syracuse', 'Albany', 'New Rochelle', 'Mount Vernon'] },
      { name: 'Texas', cities: ['Houston', 'San Antonio', 'Dallas', 'Austin', 'Fort Worth', 'El Paso', 'Arlington', 'Corpus Christi', 'Plano', 'Laredo'] },
      { name: 'Florida', cities: ['Jacksonville', 'Miami', 'Tampa', 'Orlando', 'St. Petersburg', 'Hialeah', 'Tallahassee', 'Fort Lauderdale', 'Port St. Lucie'] },
      { name: 'Illinois', cities: ['Chicago', 'Aurora', 'Joliet', 'Naperville', 'Rockford', 'Springfield', 'Elgin', 'Peoria', 'Champaign'] },
      { name: 'Pennsylvania', cities: ['Philadelphia', 'Pittsburgh', 'Allentown', 'Erie', 'Reading', 'Scranton', 'Bethlehem', 'Lancaster'] },
      { name: 'Ohio', cities: ['Columbus', 'Cleveland', 'Cincinnati', 'Toledo', 'Akron', 'Dayton', 'Parma', 'Canton'] },
      { name: 'Georgia', cities: ['Atlanta', 'Augusta', 'Columbus', 'Savannah', 'Athens', 'Sandy Springs', 'Macon', 'Roswell'] },
      { name: 'North Carolina', cities: ['Charlotte', 'Raleigh', 'Greensboro', 'Durham', 'Winston-Salem', 'Fayetteville', 'Cary', 'Wilmington'] },
      { name: 'Michigan', cities: ['Detroit', 'Grand Rapids', 'Warren', 'Sterling Heights', 'Ann Arbor', 'Lansing', 'Flint', 'Dearborn'] },
      { name: 'Washington', cities: ['Seattle', 'Spokane', 'Tacoma', 'Vancouver', 'Bellevue', 'Kent', 'Everett', 'Renton'] },
      { name: 'Arizona', cities: ['Phoenix', 'Tucson', 'Mesa', 'Chandler', 'Scottsdale', 'Glendale', 'Gilbert', 'Tempe'] },
      { name: 'Massachusetts', cities: ['Boston', 'Worcester', 'Springfield', 'Cambridge', 'Lowell', 'Brockton', 'New Bedford', 'Quincy'] },
      { name: 'Colorado', cities: ['Denver', 'Colorado Springs', 'Aurora', 'Fort Collins', 'Lakewood', 'Thornton', 'Arvada', 'Westminster'] },
      { name: 'Nevada', cities: ['Las Vegas', 'Henderson', 'Reno', 'North Las Vegas', 'Sparks', 'Carson City'] },
    ],
  },
  {
    name: 'United Kingdom',
    code: 'GB',
    states: [
      { name: 'England', cities: ['London', 'Birmingham', 'Manchester', 'Leeds', 'Liverpool', 'Sheffield', 'Bristol', 'Nottingham', 'Leicester', 'Newcastle upon Tyne', 'Brighton', 'Oxford', 'Cambridge'] },
      { name: 'Scotland', cities: ['Glasgow', 'Edinburgh', 'Aberdeen', 'Dundee', 'Inverness', 'Stirling'] },
      { name: 'Wales', cities: ['Cardiff', 'Swansea', 'Newport', 'Bangor', 'St Davids'] },
      { name: 'Northern Ireland', cities: ['Belfast', 'Derry', 'Lisburn', 'Newry', 'Armagh'] },
    ],
  },
  {
    name: 'Canada',
    code: 'CA',
    states: [
      { name: 'Ontario', cities: ['Toronto', 'Ottawa', 'Mississauga', 'Brampton', 'Hamilton', 'London', 'Markham', 'Vaughan', 'Kitchener', 'Windsor'] },
      { name: 'Quebec', cities: ['Montreal', 'Quebec City', 'Laval', 'Gatineau', 'Longueuil', 'Sherbrooke', 'Saguenay', 'Levis', 'Trois-Rivieres'] },
      { name: 'British Columbia', cities: ['Vancouver', 'Surrey', 'Burnaby', 'Richmond', 'Abbotsford', 'Kelowna', 'Victoria', 'Coquitlam'] },
      { name: 'Alberta', cities: ['Calgary', 'Edmonton', 'Red Deer', 'Lethbridge', 'St. Albert', 'Medicine Hat', 'Grande Prairie'] },
      { name: 'Manitoba', cities: ['Winnipeg', 'Brandon', 'Steinbach', 'Thompson', 'Portage la Prairie'] },
      { name: 'Saskatchewan', cities: ['Saskatoon', 'Regina', 'Prince Albert', 'Moose Jaw', 'Swift Current'] },
      { name: 'Nova Scotia', cities: ['Halifax', 'Dartmouth', 'Sydney', 'Truro', 'New Glasgow'] },
      { name: 'New Brunswick', cities: ['Moncton', 'Saint John', 'Fredericton', 'Dieppe', 'Riverview'] },
    ],
  },
  {
    name: 'Australia',
    code: 'AU',
    states: [
      { name: 'New South Wales', cities: ['Sydney', 'Newcastle', 'Wollongong', 'Central Coast', 'Maitland', 'Coffs Harbour', 'Wagga Wagga', 'Albury'] },
      { name: 'Victoria', cities: ['Melbourne', 'Geelong', 'Ballarat', 'Bendigo', 'Shepparton', 'Latrobe Valley', 'Wodonga', 'Warrnambool'] },
      { name: 'Queensland', cities: ['Brisbane', 'Gold Coast', 'Sunshine Coast', 'Townsville', 'Cairns', 'Toowoomba', 'Mackay', 'Rockhampton'] },
      { name: 'Western Australia', cities: ['Perth', 'Bunbury', 'Geraldton', 'Kalgoorlie', 'Albany', 'Mandurah', 'Fremantle'] },
      { name: 'South Australia', cities: ['Adelaide', 'Mount Gambier', 'Whyalla', 'Port Augusta', 'Murray Bridge', 'Port Lincoln'] },
      { name: 'Tasmania', cities: ['Hobart', 'Launceston', 'Devonport', 'Burnie', 'Ulverstone'] },
    ],
  },
  {
    name: 'United Arab Emirates',
    code: 'AE',
    states: [
      { name: 'Dubai', cities: ['Dubai', 'Deira', 'Bur Dubai', 'Jumeirah', 'Business Bay', 'Dubai Marina', 'Downtown Dubai'] },
      { name: 'Abu Dhabi', cities: ['Abu Dhabi', 'Al Ain', 'Khalifa City', 'Mohammed Bin Zayed City'] },
      { name: 'Sharjah', cities: ['Sharjah', 'Khor Fakkan', 'Kalba'] },
      { name: 'Ajman', cities: ['Ajman'] },
      { name: 'Ras Al Khaimah', cities: ['Ras Al Khaimah', 'Al Jazirah Al Hamra'] },
      { name: 'Fujairah', cities: ['Fujairah', 'Dibba Al Fujairah'] },
      { name: 'Umm Al Quwain', cities: ['Umm Al Quwain'] },
    ],
  },
  {
    name: 'Singapore',
    code: 'SG',
    states: [
      { name: 'Singapore', cities: ['Singapore', 'Jurong', 'Tampines', 'Woodlands', 'Ang Mo Kio', 'Toa Payoh', 'Bedok', 'Clementi', 'Yishun', 'Punggol'] },
    ],
  },
  {
    name: 'Germany',
    code: 'DE',
    states: [
      { name: 'Bavaria', cities: ['Munich', 'Nuremberg', 'Augsburg', 'Regensburg', 'Ingolstadt', 'Würzburg', 'Fürth'] },
      { name: 'Berlin', cities: ['Berlin', 'Mitte', 'Charlottenburg', 'Prenzlauer Berg', 'Kreuzberg', 'Friedrichshain'] },
      { name: 'Hamburg', cities: ['Hamburg', 'Altona', 'Wandsbek', 'Harburg'] },
      { name: 'North Rhine-Westphalia', cities: ['Cologne', 'Düsseldorf', 'Dortmund', 'Essen', 'Duisburg', 'Bochum', 'Wuppertal', 'Bonn', 'Münster'] },
      { name: 'Baden-Württemberg', cities: ['Stuttgart', 'Karlsruhe', 'Mannheim', 'Freiburg', 'Heidelberg', 'Heilbronn', 'Ulm'] },
      { name: 'Saxony', cities: ['Dresden', 'Leipzig', 'Chemnitz', 'Zwickau', 'Plauen'] },
      { name: 'Hesse', cities: ['Frankfurt', 'Wiesbaden', 'Kassel', 'Darmstadt', 'Offenbach', 'Hanau'] },
    ],
  },
  {
    name: 'France',
    code: 'FR',
    states: [
      { name: 'Île-de-France', cities: ['Paris', 'Versailles', 'Nanterre', 'Créteil', 'Argenteuil', 'Montreuil', 'Saint-Denis', 'Boulogne-Billancourt'] },
      { name: 'Auvergne-Rhône-Alpes', cities: ['Lyon', 'Grenoble', 'Saint-Étienne', 'Clermont-Ferrand', 'Chambéry', 'Annecy'] },
      { name: 'Provence-Alpes-Côte d\'Azur', cities: ['Marseille', 'Nice', 'Toulon', 'Aix-en-Provence', 'Cannes', 'Antibes', 'Avignon'] },
      { name: 'Nouvelle-Aquitaine', cities: ['Bordeaux', 'Pau', 'Limoges', 'Bayonne', 'Poitiers', 'La Rochelle', 'Niort'] },
      { name: 'Occitanie', cities: ['Toulouse', 'Montpellier', 'Nîmes', 'Perpignan', 'Narbonne', 'Béziers', 'Sète'] },
      { name: 'Grand Est', cities: ['Strasbourg', 'Reims', 'Mulhouse', 'Nancy', 'Metz', 'Colmar', 'Troyes'] },
      { name: 'Hauts-de-France', cities: ['Lille', 'Amiens', 'Roubaix', 'Tourcoing', 'Dunkerque', 'Valenciennes'] },
    ],
  },
  {
    name: 'Netherlands',
    code: 'NL',
    states: [
      { name: 'North Holland', cities: ['Amsterdam', 'Haarlem', 'Alkmaar', 'Zaandam', 'Hilversum'] },
      { name: 'South Holland', cities: ['Rotterdam', 'The Hague', 'Dordrecht', 'Leiden', 'Delft', 'Zoetermeer'] },
      { name: 'Utrecht', cities: ['Utrecht', 'Amersfoort', 'Veenendaal', 'Nieuwegein', 'Zeist'] },
      { name: 'North Brabant', cities: ['Eindhoven', 'Tilburg', 'Breda', 'Den Bosch', 'Helmond'] },
      { name: 'Gelderland', cities: ['Nijmegen', 'Arnhem', 'Apeldoorn', 'Ede', 'Doetinchem'] },
    ],
  },
  {
    name: 'Pakistan',
    code: 'PK',
    states: [
      { name: 'Punjab', cities: ['Lahore', 'Faisalabad', 'Rawalpindi', 'Gujranwala', 'Multan', 'Sargodha', 'Sialkot', 'Bahawalpur', 'Sheikhupura'] },
      { name: 'Sindh', cities: ['Karachi', 'Hyderabad', 'Sukkur', 'Larkana', 'Nawabshah', 'Mirpurkhas', 'Jacobabad'] },
      { name: 'Khyber Pakhtunkhwa', cities: ['Peshawar', 'Mardan', 'Abbottabad', 'Mansehra', 'Kohat', 'Swat', 'Nowshera'] },
      { name: 'Balochistan', cities: ['Quetta', 'Turbat', 'Khuzdar', 'Hub', 'Gwadar', 'Sibi'] },
      { name: 'Islamabad Capital Territory', cities: ['Islamabad'] },
      { name: 'Azad Kashmir', cities: ['Muzaffarabad', 'Mirpur', 'Rawalakot'] },
    ],
  },
  {
    name: 'Bangladesh',
    code: 'BD',
    states: [
      { name: 'Dhaka Division', cities: ['Dhaka', 'Narayanganj', 'Gazipur', 'Tangail', 'Faridpur', 'Manikganj'] },
      { name: 'Chittagong Division', cities: ['Chittagong', 'Comilla', 'Cox\'s Bazar', 'Noakhali', 'Feni', 'Brahmanbaria'] },
      { name: 'Rajshahi Division', cities: ['Rajshahi', 'Bogra', 'Pabna', 'Naogaon', 'Sirajganj', 'Chapai Nawabganj'] },
      { name: 'Khulna Division', cities: ['Khulna', 'Jessore', 'Bagerhat', 'Satkhira', 'Chuadanga', 'Kushtia'] },
      { name: 'Sylhet Division', cities: ['Sylhet', 'Moulvibazar', 'Habiganj', 'Sunamganj'] },
    ],
  },
  {
    name: 'Sri Lanka',
    code: 'LK',
    states: [
      { name: 'Western Province', cities: ['Colombo', 'Dehiwala', 'Moratuwa', 'Sri Jayawardenepura Kotte', 'Negombo', 'Kalutara'] },
      { name: 'Central Province', cities: ['Kandy', 'Matale', 'Nuwara Eliya', 'Dambulla'] },
      { name: 'Southern Province', cities: ['Galle', 'Matara', 'Hambantota', 'Tangalle'] },
      { name: 'Northern Province', cities: ['Jaffna', 'Kilinochchi', 'Mannar', 'Vavuniya'] },
      { name: 'Eastern Province', cities: ['Trincomalee', 'Batticaloa', 'Ampara', 'Kalmunai'] },
    ],
  },
  {
    name: 'Nepal',
    code: 'NP',
    states: [
      { name: 'Bagmati Province', cities: ['Kathmandu', 'Lalitpur', 'Bhaktapur', 'Kirtipur', 'Hetauda', 'Bharatpur'] },
      { name: 'Gandaki Province', cities: ['Pokhara', 'Gorkha', 'Baglung', 'Damauli'] },
      { name: 'Lumbini Province', cities: ['Butwal', 'Bhairahawa', 'Tulsipur', 'Nepalgunj', 'Tansen'] },
      { name: 'Koshi Province', cities: ['Biratnagar', 'Dharan', 'Itahari', 'Inaruwa', 'Ilam'] },
    ],
  },
  {
    name: 'South Africa',
    code: 'ZA',
    states: [
      { name: 'Gauteng', cities: ['Johannesburg', 'Pretoria', 'Soweto', 'Sandton', 'Randburg', 'Benoni', 'Boksburg', 'Germiston', 'Centurion'] },
      { name: 'Western Cape', cities: ['Cape Town', 'Stellenbosch', 'George', 'Paarl', 'Worcester', 'Knysna'] },
      { name: 'KwaZulu-Natal', cities: ['Durban', 'Pietermaritzburg', 'Newcastle', 'Richards Bay', 'Ulundi'] },
      { name: 'Eastern Cape', cities: ['Port Elizabeth', 'East London', 'Bhisho', 'Mthatha', 'Uitenhage'] },
    ],
  },
  {
    name: 'Nigeria',
    code: 'NG',
    states: [
      { name: 'Lagos', cities: ['Lagos', 'Ikeja', 'Badagry', 'Ikorodu', 'Epe'] },
      { name: 'Abuja', cities: ['Abuja', 'Gwagwalada', 'Kuje', 'Bwari', 'Abaji'] },
      { name: 'Rivers', cities: ['Port Harcourt', 'Obio-Akpor', 'Okrika', 'Eleme', 'Bonny'] },
      { name: 'Kano', cities: ['Kano', 'Fagge', 'Dala', 'Gwale', 'Ungogo'] },
      { name: 'Oyo', cities: ['Ibadan', 'Ogbomosho', 'Oyo', 'Iseyin', 'Saki'] },
    ],
  },
  {
    name: 'Kenya',
    code: 'KE',
    states: [
      { name: 'Nairobi County', cities: ['Nairobi', 'Westlands', 'Eastleigh', 'Karen', 'Kibera', 'Kasarani'] },
      { name: 'Mombasa County', cities: ['Mombasa', 'Mvita', 'Changamwe', 'Kisauni', 'Likoni', 'Nyali'] },
      { name: 'Kisumu County', cities: ['Kisumu', 'Ahero', 'Muhoroni', 'Maseno'] },
      { name: 'Nakuru County', cities: ['Nakuru', 'Naivasha', 'Gilgil', 'Molo'] },
    ],
  },
  {
    name: 'Malaysia',
    code: 'MY',
    states: [
      { name: 'Selangor', cities: ['Shah Alam', 'Petaling Jaya', 'Subang Jaya', 'Klang', 'Ampang Jaya', 'Puchong', 'Kajang'] },
      { name: 'Kuala Lumpur', cities: ['Kuala Lumpur', 'Chow Kit', 'Bukit Bintang', 'Brickfields', 'Bangsar'] },
      { name: 'Johor', cities: ['Johor Bahru', 'Muar', 'Batu Pahat', 'Kluang', 'Segamat', 'Skudai'] },
      { name: 'Penang', cities: ['George Town', 'Butterworth', 'Bukit Mertajam', 'Nibong Tebal'] },
      { name: 'Sabah', cities: ['Kota Kinabalu', 'Sandakan', 'Tawau', 'Lahad Datu', 'Keningau'] },
      { name: 'Sarawak', cities: ['Kuching', 'Miri', 'Sibu', 'Bintulu', 'Limbang'] },
    ],
  },
  {
    name: 'Indonesia',
    code: 'ID',
    states: [
      { name: 'DKI Jakarta', cities: ['Jakarta', 'Central Jakarta', 'North Jakarta', 'East Jakarta', 'South Jakarta', 'West Jakarta'] },
      { name: 'West Java', cities: ['Bandung', 'Bekasi', 'Depok', 'Bogor', 'Tasikmalaya', 'Cimahi', 'Sukabumi'] },
      { name: 'East Java', cities: ['Surabaya', 'Malang', 'Kediri', 'Jember', 'Madiun', 'Blitar', 'Mojokerto'] },
      { name: 'Central Java', cities: ['Semarang', 'Solo', 'Yogyakarta', 'Magelang', 'Pekalongan', 'Salatiga'] },
      { name: 'Bali', cities: ['Denpasar', 'Kuta', 'Seminyak', 'Ubud', 'Singaraja', 'Tabanan'] },
    ],
  },
  {
    name: 'Philippines',
    code: 'PH',
    states: [
      { name: 'Metro Manila', cities: ['Manila', 'Quezon City', 'Makati', 'Pasig', 'Taguig', 'Caloocan', 'Las Piñas', 'Pasay', 'Mandaluyong', 'Marikina'] },
      { name: 'Cebu', cities: ['Cebu City', 'Mandaue', 'Lapu-Lapu', 'Talisay', 'Danao', 'Toledo', 'Carcar'] },
      { name: 'Davao Region', cities: ['Davao City', 'Tagum', 'Panabo', 'Digos', 'Mati'] },
      { name: 'Calabarzon', cities: ['Antipolo', 'Bacoor', 'Dasmariñas', 'Calamba', 'San Jose del Monte', 'Imus', 'Lucena'] },
    ],
  },
];

// Helper: find a country by name
export function findCountry(name: string): CountryData | undefined {
  return worldCountries.find((c) => c.name === name);
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
