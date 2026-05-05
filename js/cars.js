async function loadCars() {
    const container = document.getElementById('carsContainer');
    container.innerHTML = '<div class="loading">Loading cars...</div>';

    const search = document.getElementById('searchInput')?.value || '';
    const type = document.getElementById('typeFilter')?.value || '';
    const maxPrice = document.getElementById('maxPriceFilter')?.value || '';

    try {
        let url = '/cars?available=true';
        if (search) url += `&search=${encodeURIComponent(search)}`;
        if (type) url += `&type=${encodeURIComponent(type)}`;
        if (maxPrice) url += `&maxPrice=${encodeURIComponent(maxPrice)}`;

        const data = await apiRequest(url);
        const cars = data.cars || [];

        if (cars.length === 0) {
            container.innerHTML = '<div class="empty-state">No cars found matching your criteria.</div>';
            return;
        }

        container.innerHTML = cars.map(car => `
            <div class="card">
                <img src="${car.image || 'https://via.placeholder.com/400x200?text=No+Image'}" 
                     alt="${car.name}" class="card-image">
                <div class="card-body">
                    <h3 class="card-title">${car.name}</h3>
                    <p class="card-text">${car.type} &bull; ${car.isAvailable ? 'Available' : 'Not Available'}</p>
                </div>
                <div class="card-footer">
                    <span class="price">$${car.pricePerDay}/day</span>
                    <a href="car-detail.html?id=${car.id}" class="btn btn-primary btn-sm">View Details</a>
                </div>
            </div>
        `).join('');
    } catch (error) {
        container.innerHTML = `<div class="alert alert-error">${error.message}</div>`;
    }
}

async function loadCarDetail() {
    const params = new URLSearchParams(window.location.search);
    const carId = params.get('id');
    if (!carId) {
        window.location.href = 'index.html';
        return;
    }

    const container = document.getElementById('carDetails');
    container.innerHTML = '<div class="loading">Loading car details...</div>';

    try {
        const data = await apiRequest(`/cars/${carId}`);
        const car = data.car;

        container.innerHTML = `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 2rem;">
                <img src="${car.image || 'https://via.placeholder.com/600x400?text=No+Image'}" 
                     alt="${car.name}" style="width: 100%; border-radius: var(--radius); object-fit: cover;">
                <div>
                    <h1>${car.name}</h1>
                    <p style="color: var(--secondary); font-size: 1.1rem; margin: 1rem 0;">
                        ${car.type} &bull; 
                        <span class="badge ${car.isAvailable ? 'badge-confirmed' : 'badge-cancelled'}">
                            ${car.isAvailable ? 'Available' : 'Not Available'}
                        </span>
                    </p>
                    <p class="price" style="font-size: 2rem;">$${car.pricePerDay}/day</p>
                    <p style="margin-top: 1rem; color: var(--secondary);">
                        Experience the comfort and reliability of the ${car.name}. 
                        Perfect for both city driving and long road trips.
                    </p>
                </div>
            </div>
        `;

        const today = new Date().toISOString().split('T')[0];
        const startInput = document.getElementById('startDate');
        const endInput = document.getElementById('endDate');
        if (startInput) startInput.min = today;
        if (endInput) endInput.min = today;

        window.currentCar = car;
    } catch (error) {
        container.innerHTML = `<div class="alert alert-error">${error.message}</div>`;
    }
}

