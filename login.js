document.getElementById('loginForm').addEventListener('submit', function (event) {
    event.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const errorMessage = document.getElementById('loginErrorMessage');
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(user => user.email === email && user.password === password);
    if (user) {
        localStorage.setItem('loggedInUser', JSON.stringify(user));
        errorMessage.textContent = '';
        alert('Login successful');
        window.location.href = 'index.html';
    }
    else {
        errorMessage.textContent = 'Invalid email or password';
    }
    if (!validateEmail(email)) {
        alert('Please enter a valid email address.');
        event.preventDefault();
        return false;
    }
});
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}
