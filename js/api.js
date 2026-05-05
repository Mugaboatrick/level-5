const API_BASE_URL = 'http://localhost:5000/api';

async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = localStorage.getItem('token');

    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` })
        },
        ...options
    };

    if (config.body && typeof config.body === 'object') {
        config.body = JSON.stringify(config.body);
    }

    try {
        const response = await fetch(url, config);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Something went wrong');
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}

function getUser() {
    try {
        return JSON.parse(localStorage.getItem('user'));
    } catch {
        return null;
    }
}

function requireAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

function requireAdmin() {
    const user = getUser();
    if (!user || user.role !== 'admin') {
        window.location.href = 'index.html';
        return false;
    }
    return true;
}

function updateNavbar() {
    const user = getUser();
    const authLinks = document.getElementById('authLinks');
    if (!authLinks) return;

    if (user) {
        authLinks.innerHTML = `
            ${user.role === 'admin' ? `<a href="admin/dashboard.html">Admin</a>` : ''}
            <a href="my-bookings.html">My Bookings</a>
            <span style="color: var(--secondary);">Hello, ${user.name}</span>
            <a href="#" onclick="logout(); return false;" class="btn btn-outline btn-sm">Logout</a>
        `;
    } else {
        authLinks.innerHTML = `
            <a href="login.html">Login</a>
            <a href="register.html" class="btn btn-primary btn-sm">Register</a>
        `;
    }
}

