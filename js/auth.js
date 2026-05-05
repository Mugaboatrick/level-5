function showAlert(message, type = 'error') {
    const container = document.getElementById('alertContainer');
    if (!container) return;
    container.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
}

const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const data = await apiRequest('/auth/login', {
                method: 'POST',
                body: { email, password }
            });

            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            showAlert('Login successful! Redirecting...', 'success');
            setTimeout(() => {
                window.location.href = data.user.role === 'admin' ? 'admin/dashboard.html' : 'index.html';
            }, 500);
        } catch (error) {
            showAlert(error.message);
        }
    });
}

const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const data = await apiRequest('/auth/register', {
                method: 'POST',
                body: { name, email, password }
            });

            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            showAlert('Registration successful! Redirecting...', 'success');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 500);
        } catch (error) {
            showAlert(error.message);
        }
    });
}

updateNavbar();

