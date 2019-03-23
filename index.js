//https://www.emailjs.com/?src=so

window.onload = function() {
    document.getElementById('contact-form').addEventListener('submit', function(event) {
        event.preventDefault();
        this.contact_number.value = Math.random() * 100000 | 0;
        emailjs.sendForm('gmail', 'template_ZFLpH0gE', this).then(function() {
            $("#sendEmailMessage").show();
        })
    });
}