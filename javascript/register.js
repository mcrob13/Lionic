document.querySelector('.join-us__form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
        name: e.target.name.value,
        email: e.target.email.value,
        password: e.target.password.value,
        phone: e.target.phone.value || null
    };
    
    try {
        const response = await fetch('http://localhost:3000/api/register', {
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
            throw new Error(errorData.message || 'Registration failed');
        }
        
        const data = await response.json();
        
        if (data.success) {
            // Автоматический вход после регистрации
            const loginResponse = await fetch('http://localhost:3000/api/login', {
                method: 'POST',
                mode: 'cors',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password
                })
            });
            
            if (!loginResponse.ok) {
                throw new Error('Automatic login after registration failed');
            }
            
            const loginData = await loginResponse.json();
            
            localStorage.setItem('user', JSON.stringify(loginData.user));
            localStorage.setItem('token', loginData.token);
            window.location.href = 'personal_cab.html';
        } else {
            throw new Error(data.message || 'Registration failed');
        }
    } catch (error) {
        console.error('Registration error:', error);
        alert('Error: ' + error.message);
    }
});