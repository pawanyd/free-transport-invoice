/**
 * City Dropdown Component
 * Provides searchable dropdown functionality for city selection
 */

class CityDropdown {
    constructor() {
        this.cities = [
            'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Ahmedabad',
            'Chennai', 'Kolkata', 'Pune', 'Jaipur', 'Surat',
            'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane',
            'Bhopal', 'Visakhapatnam', 'Pimpri-Chinchwad', 'Patna', 'Vadodara',
            'Ghaziabad', 'Ludhiana', 'Agra', 'Nashik', 'Faridabad',
            'Meerut', 'Rajkot', 'Kalyan-Dombivali', 'Vasai-Virar', 'Varanasi',
            'Srinagar', 'Aurangabad', 'Dhanbad', 'Amritsar', 'Navi Mumbai',
            'Allahabad', 'Ranchi', 'Howrah', 'Coimbatore', 'Jabalpur',
            'Gwalior', 'Vijayawada', 'Jodhpur', 'Madurai', 'Raipur',
            'Kota', 'Chandigarh', 'Guwahati', 'Solapur', 'Hubli-Dharwad',
            'Mysore', 'Tiruchirappalli', 'Bareilly', 'Aligarh', 'Tiruppur',
            'Moradabad', 'Jalandhar', 'Bhubaneswar', 'Salem', 'Warangal',
            'Guntur', 'Bhiwandi', 'Saharanpur', 'Gorakhpur', 'Bikaner',
            'Amravati', 'Noida', 'Jamshedpur', 'Bhilai', 'Cuttack',
            'Firozabad', 'Kochi', 'Nellore', 'Bhavnagar', 'Dehradun',
            'Durgapur', 'Asansol', 'Rourkela', 'Nanded', 'Kolhapur',
            'Ajmer', 'Akola', 'Gulbarga', 'Jamnagar', 'Ujjain',
            'Loni', 'Siliguri', 'Jhansi', 'Ulhasnagar', 'Jammu',
            'Sangli-Miraj & Kupwad', 'Mangalore', 'Erode', 'Belgaum', 'Ambattur',
            'Tirunelveli', 'Malegaon', 'Gaya', 'Jalgaon', 'Udaipur', 'Maheshtala'
        ];
    }

    /**
     * Initialize dropdown for a specific input field
     */
    init(inputId, dropdownId) {
        const input = document.getElementById(inputId);
        const dropdown = document.getElementById(dropdownId);

        if (!input || !dropdown) return;

        // Show dropdown on focus
        input.addEventListener('focus', () => {
            this.showDropdown(input, dropdown);
        });

        // Filter cities as user types
        input.addEventListener('input', () => {
            this.filterCities(input, dropdown);
        });

        // Hide dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!input.contains(e.target) && !dropdown.contains(e.target)) {
                dropdown.classList.add('hidden');
            }
        });

        // Handle keyboard navigation
        input.addEventListener('keydown', (e) => {
            this.handleKeyboard(e, dropdown);
        });
    }

    /**
     * Show dropdown with all cities or filtered results
     */
    showDropdown(input, dropdown) {
        const searchTerm = input.value.toLowerCase().trim();
        const filteredCities = searchTerm 
            ? this.cities.filter(city => city.toLowerCase().includes(searchTerm))
            : this.cities;

        this.renderDropdown(dropdown, filteredCities, input);
        dropdown.classList.remove('hidden');
    }

    /**
     * Filter cities based on input value
     */
    filterCities(input, dropdown) {
        const searchTerm = input.value.toLowerCase().trim();
        
        if (searchTerm === '') {
            this.renderDropdown(dropdown, this.cities, input);
        } else {
            const filteredCities = this.cities.filter(city => 
                city.toLowerCase().includes(searchTerm)
            );
            this.renderDropdown(dropdown, filteredCities, input);
        }

        dropdown.classList.remove('hidden');
    }

    /**
     * Render dropdown items
     */
    renderDropdown(dropdown, cities, input) {
        dropdown.innerHTML = '';

        if (cities.length === 0) {
            const noResults = document.createElement('div');
            noResults.className = 'px-4 py-3 text-sm text-gray-500 italic';
            noResults.textContent = 'No cities found. You can type a custom city name.';
            dropdown.appendChild(noResults);
            return;
        }

        cities.forEach(city => {
            const item = document.createElement('div');
            item.className = 'px-4 py-2 hover:bg-blue-50 cursor-pointer text-gray-800 transition-colors duration-150';
            item.textContent = city;
            
            // Highlight matching text
            const searchTerm = input.value.toLowerCase().trim();
            if (searchTerm) {
                const regex = new RegExp(`(${searchTerm})`, 'gi');
                item.innerHTML = city.replace(regex, '<span class="font-semibold text-blue-600">$1</span>');
            }

            item.addEventListener('click', () => {
                input.value = city;
                dropdown.classList.add('hidden');
                input.focus();
            });

            dropdown.appendChild(item);
        });
    }

    /**
     * Handle keyboard navigation
     */
    handleKeyboard(e, dropdown) {
        const items = dropdown.querySelectorAll('div[class*="hover:bg-blue-50"]');
        const currentActive = dropdown.querySelector('.bg-blue-100');
        let currentIndex = Array.from(items).indexOf(currentActive);

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (currentIndex < items.length - 1) {
                if (currentActive) currentActive.classList.remove('bg-blue-100');
                items[currentIndex + 1].classList.add('bg-blue-100');
                items[currentIndex + 1].scrollIntoView({ block: 'nearest' });
            } else if (items.length > 0) {
                if (currentActive) currentActive.classList.remove('bg-blue-100');
                items[0].classList.add('bg-blue-100');
                items[0].scrollIntoView({ block: 'nearest' });
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (currentIndex > 0) {
                if (currentActive) currentActive.classList.remove('bg-blue-100');
                items[currentIndex - 1].classList.add('bg-blue-100');
                items[currentIndex - 1].scrollIntoView({ block: 'nearest' });
            } else if (items.length > 0) {
                if (currentActive) currentActive.classList.remove('bg-blue-100');
                items[items.length - 1].classList.add('bg-blue-100');
                items[items.length - 1].scrollIntoView({ block: 'nearest' });
            }
        } else if (e.key === 'Enter') {
            if (currentActive) {
                e.preventDefault();
                currentActive.click();
            }
        } else if (e.key === 'Escape') {
            dropdown.classList.add('hidden');
        }
    }
}

// Export for use in other modules
export default CityDropdown;
