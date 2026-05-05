function showBookingAlert(message, type = 'error') {
    const container = document.getElementById('bookingAlert');
    if (!container) return;
    container.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
}

function calculatePrice() {
    const startDate = document.getElementById('startDate')?.value;
    const endDate = document.getElementById('endDate')?.value;
    const preview = document.getElementById('pricePreview');
    const car = window.currentCar;

    if (!startDate || !endDate || !car || !preview) return;

    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

    if (days > 0) {
        const total = days * car.pricePerDay;
        preview.textContent = `Total: $${total} for ${days} day${days > 1 ? 's' : ''}`;
    } else {
        preview.textContent = '';
    }
}

const bookingForm = document.getElementById('bookingForm');
if (bookingForm) {
    bookingForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!requireAuth()) return;

        const params = new URLSearchParams(window.location.search);
        const carId = params.get('id');
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;

        try {
            const data = await apiRequest('/bookings', {
                method: 'POST',
                body: { carId: parseInt(carId), startDate, endDate }
            });

            showBookingAlert('Booking successful! Redirecting to your bookings...', 'success');
            setTimeout(() => {
                window.location.href = 'my-bookings.html';
            }, 1000);
        } catch (error) {
            showBookingAlert(error.message);
        }
    });

    document.getElementById('startDate')?.addEventListener('change', calculatePrice);
    document.getElementById('endDate')?.addEventListener('change', calculatePrice);
}

async function loadMyBookings() {
    const container = document.getElementById('bookingsContainer');
    container.innerHTML = '<div class="loading">Loading your bookings...</div>';

    try {
        const data = await apiRequest('/bookings/my');
        const bookings = data.bookings || [];

        if (bookings.length === 0) {
            container.innerHTML = '<div class="empty-state">You have no bookings yet. <a href="index.html">Browse cars</a></div>';
            return;
        }

        container.innerHTML = `
            <table class="table">
                <thead>
                    <tr>
                        <th>Car</th>
                        <th>Dates</th>
                        <th>Total Price</th>
                        <th>Status</th>
                        <th>Booked On</th>
                    </tr>
                </thead>
                <tbody>
                    ${bookings.map(b => `
                        <tr>
                            <td>
                                <strong>${b.carName}</strong><br>
                                <small style="color: var(--secondary);">${b.carType}</small>
                            </td>
                            <td>${new Date(b.startDate).toLocaleDateString()} - ${new Date(b.endDate).toLocaleDateString()}</td>
                            <td>$${b.totalPrice}</td>
                            <td><span class="badge badge-${b.status}">${b.status}</span></td>
                            <td>${new Date(b.created_at).toLocaleDateString()}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } catch (error) {
        container.innerHTML = `<div class="alert alert-error">${error.message}</div>`;
    }
}

