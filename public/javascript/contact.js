document.getElementById('contactForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const message = document.getElementById('message').value;

    if(name && email && message) {
        // Here you would typically send the form data to a server
        alert('Thank you for your message! We will get back to you soon.');
        this.reset();
    } else {
        alert('Please fill in all fields.');
    }
});