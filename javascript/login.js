document.querySelector('.join-us__form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
        email: e.target.email.value,
        password: e.target.password.value
    };
    
    try {
        const response = await fetch('http://localhost:3000/api/login', {
            method: 'POST',
            mode: 'cors',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Login failed');
        }
        
        const data = await response.json();
        
        if (data.success) {
            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('token', data.token);
            window.location.href = 'personal_cab.html';
        } else {
            throw new Error(data.message || 'Login failed');
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('Error: ' + error.message);
    }
});