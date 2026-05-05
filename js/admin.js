function showModalAlert(message, type = 'error') {
    const container = document.getElementById('modalAlert');
    if (!container) return;
    container.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
}

// ===== Dashboard =====
async function loadDashboard() {
    try {
        const [carsData, bookingsData] = await Promise.all([
            apiRequest('/cars'),
            apiRequest('/bookings')
        ]);

        const cars = carsData.cars || [];
        const bookings = bookingsData.bookings || [];
        const pending = bookings.filter(b => b.status === 'pending');

        document.getElementById('totalCars').textContent = cars.length;
        document.getElementById('totalBookings').textContent = bookings.length;
        document.getElementById('pendingBookings').textContent = pending.length;
        document.getElementById('totalUsers').textContent = [...new Set(bookings.map(b => b.userId))].length || 0;

        const recent = bookings.slice(0, 5);
        const recentContainer = document.getElementById('recentBookings');
        if (recent.length === 0) {
            recentContainer.innerHTML = '<div class="empty-state">No bookings yet.</div>';
        } else {
            recentContainer.innerHTML = `
                <table class="table">
                    <thead>
                        <tr>
                            <th>Customer</th>
                            <th>Car</th>
                            <th>Dates</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${recent.map(b => `
                            <tr>
                                <td>${b.userName}<br><small>${b.userEmail}</small></td>
                                <td>${b.carName}</td>
                                <td>${new Date(b.startDate).toLocaleDateString()} - ${new Date(b.endDate).toLocaleDateString()}</td>
                                <td><span class="badge badge-${b.status}">${b.status}</span></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        }
    } catch (error) {
        console.error('Dashboard error:', error);
    }
}

// ===== Cars Management =====
async function loadAdminCars() {
    const container = document.getElementById('carsContainer');
    container.innerHTML = '<div class="loading">Loading cars...</div>';

    try {
        const data = await apiRequest('/cars');
        const cars = data.cars || [];

        container.innerHTML = `
            <table class="table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Image</th>
                        <th>Name</th>
                        <th>Type</th>
                        <th>Price/Day</th>
                        <th>Available</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${cars.map(car => `
                        <tr>
                            <td>${car.id}</td>
                            <td><img src="${car.image || 'https://via.placeholder.com/60?text=No+Image'}" style="width: 60px; height: 40px; object-fit: cover; border-radius: 4px;"></td>
                            <td>${car.name}</td>
                            <td>${car.type}</td>
                            <td>$${car.pricePerDay}</td>
                            <td>
                                <span class="badge ${car.isAvailable ? 'badge-confirmed' : 'badge-cancelled'}">
                                    ${car.isAvailable ? 'Yes' : 'No'}
                                </span>
                            </td>
                            <td>
                                <button class="btn btn-sm btn-secondary" onclick="editCar(${car.id}, '${car.name}', '${car.type}', ${car.pricePerDay}, '${car.image || ''}', ${car.isAvailable})">Edit</button>
                                <button class="btn btn-sm btn-danger" onclick="deleteCar(${car.id})">Delete</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } catch (error) {
        container.innerHTML = `<div class="alert alert-error">${error.message}</div>`;
    }
}

function openCarModal() {
    document.getElementById('carId').value = '';
    document.getElementById('carForm').reset();
    document.getElementById('modalTitle').textContent = 'Add Car';
    document.getElementById('carModal').classList.add('active');
}

function closeCarModal() {
    document.getElementById('carModal').classList.remove('active');
}

function editCar(id, name, type, price, image, available) {
    document.getElementById('carId').value = id;
    document.getElementById('carName').value = name;
    document.getElementById('carType').value = type;
    document.getElementById('carPrice').value = price;
    document.getElementById('carImage').value = image;
    document.getElementById('carAvailable').checked = available;
    document.getElementById('modalTitle').textContent = 'Edit Car';
    document.getElementById('carModal').classList.add('active');
}

const carForm = document.getElementById('carForm');
if (carForm) {
    carForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('carId').value;
        const body = {
            name: document.getElementById('carName').value,
            type: document.getElementById('carType').value,
            pricePerDay: parseFloat(document.getElementById('carPrice').value),
            image: document.getElementById('carImage').value,
            isAvailable: document.getElementById('carAvailable').checked
        };

        try {
            if (id) {
                await apiRequest(`/cars/${id}`, { method: 'PUT', body });
            } else {
                await apiRequest('/cars', { method: 'POST', body });
            }
            closeCarModal();
            loadAdminCars();
        } catch (error) {
            showModalAlert(error.message);
        }
    });
}

async function deleteCar(id) {
    if (!confirm('Are you sure you want to delete this car?')) return;
    try {
        await apiRequest(`/cars/${id}`, { method: 'DELETE' });
        loadAdminCars();
    } catch (error) {
        alert(error.message);
    }
}

// ===== Bookings Management =====
async function loadAdminBookings() {
    const container = document.getElementById('bookingsContainer');
    container.innerHTML = '<div class="loading">Loading bookings...</div>';

    try {
        const data = await apiRequest('/bookings');
        const bookings = data.bookings || [];

        if (bookings.length === 0) {
            container.innerHTML = '<div class="empty-state">No bookings found.</div>';
            return;
        }

        container.innerHTML = `
            <table class="table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Customer</th>
                        <th>Car</th>
                        <th>Dates</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${bookings.map(b => `
                        <tr>
                            <td>${b.id}</td>
                            <td>${b.userName}<br><small>${b.userEmail}</small></td>
                            <td>${b.carName}</td>
                            <td>${new Date(b.startDate).toLocaleDateString()} - ${new Date(b.endDate).toLocaleDateString()}</td>
                            <td>$${b.totalPrice}</td>
                            <td><span class="badge badge-${b.status}">${b.status}</span></td>
                            <td>
                                ${b.status === 'pending' ? `
                                    <button class="btn btn-sm btn-success" onclick="updateBookingStatus(${b.id}, 'confirmed')">Approve</button>
                                    <button class="btn btn-sm btn-danger" onclick="updateBookingStatus(${b.id}, 'cancelled')">Reject</button>
                                ` : ''}
                                ${b.status === 'confirmed' ? `
                                    <button class="btn btn-sm btn-primary" onclick="returnCar(${b.id})">Mark Returned</button>
                                ` : ''}
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } catch (error) {
        container.innerHTML = `<div class="alert alert-error">${error.message}</div>`;
    }
}

async function updateBookingStatus(id, status) {
    try {
        await apiRequest(`/bookings/${id}/status`, {
            method: 'PUT',
            body: { status }
        });
        loadAdminBookings();
    } catch (error) {
        alert(error.message);
    }
}

async function returnCar(id) {
    try {
        await apiRequest(`/bookings/${id}/return`, { method: 'PUT' });
        loadAdminBookings();
    } catch (error) {
        alert(error.message);
    }
}

