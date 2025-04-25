document.addEventListener('DOMContentLoaded', async () => {
    try {
        const user = JSON.parse(localStorage.getItem('user'));
        const token = localStorage.getItem('token');
        
        if (!user?.id || !token) {
            window.location.href = 'login.html';
            return;
        }

        const response = await fetch(`http://localhost:3000/api/user/${user.id}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to load user data: ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
            document.getElementById('user-name').textContent = data.user.name || 'Not specified';
            document.getElementById('user-email').textContent = data.user.email || 'Not specified';
            document.getElementById('user-phone').textContent = data.user.phone || 'Not specified';
        } else {
            throw new Error(data.message || 'Failed to load user data');
        }
    } catch (error) {
        console.error('Error:', error);
        alert(`Error: ${error.message}`);
        window.location.href = 'login.html';
    }

    document.getElementById('logout-btn').addEventListener('click', () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        window.location.href = 'login.html';
    });
});