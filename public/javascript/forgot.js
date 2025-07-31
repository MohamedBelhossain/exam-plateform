document.getElementById('forgot-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value;

  try {
    const response = await fetch('/forgot-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email })
    });

    const data = await response.json();

    if (response.ok) {
      alert('Un email a été envoyé avec le lien de réinitialisation.');
    } else {
      alert(data.message || 'Erreur.');
    }

  } catch (error) {
    alert('Erreur côté client.');
    console.error(error);
  }
});

