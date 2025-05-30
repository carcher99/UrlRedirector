document.addEventListener('DOMContentLoaded', () => {
    const formContainer = document.getElementById('form-container');
    formContainer.style.display = 'none'; // Hide the form initially
    const acronymInput = document.getElementById('acronym');
    const destinationInput = document.getElementById('destination');
    const saveBtn = document.getElementById('save-btn');
    const redirectsTableBody = document.querySelector('#redirects-list tbody');    
    const toggleFormBtn = document.getElementById('toggle-form-btn');

    const toggleFormVisibility = () => {
        //console.log('Toggle button clicked'); // Log when the button is clicked
        //console.log('Current display state:', formContainer.style.display); // Log current display state
        if (formContainer.style.display === 'none' || formContainer.style.display === '') {
            formContainer.style.display = 'block'; // Show the form
        } else {
            formContainer.style.display = 'none'; // Hide the form
        }
    };

    toggleFormBtn.addEventListener('click', toggleFormVisibility);

    const fetchRedirects = async () => {
        // Fetch redirects from the server
        const response = await fetch('/api/redirects');
        const redirects = await response.json();
        displayRedirects(redirects);
    };

    const displayRedirects = (redirects) => {
        redirectsTableBody.innerHTML = '';
        const sortedRedirects = Object.keys(redirects).sort(); // Sort the acronyms alphabetically
        for (const acronym of sortedRedirects) {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>/${acronym}</td>
                <td>${redirects[acronym].url}</td>
                <td>${redirects[acronym].count}</td>
                <td>
                    <i class="fas fa-edit edit-btn" data-acronym="${acronym}" data-destination="${redirects[acronym].url}"></i>
                    <i class="fas fa-trash-alt delete-btn" data-acronym="${acronym}"></i>
                </td>
            `;
            redirectsTableBody.appendChild(tr);
        }
    };

    const saveRedirect = async () => {
        console.log('saveRedirect function called');
        const acronym = acronymInput.value.trim();
        const destination = destinationInput.value.trim();

        console.log('Acronym:', acronym, 'Destination:', destination);

        if (!acronym || !destination) {
            alert('Please enter both acronym and destination.');
            return;
        }

        const response = await fetch('/api/redirects', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ acronym, destination })
        });

        if (response.ok) {
            acronymInput.value = '';
            destinationInput.value = '';
            fetchRedirects();
        } else {
            alert('Failed to save redirect.');
        }
    };

    const deleteRedirect = async (acronym) => {
        const response = await fetch(`/api/redirects/${acronym}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            fetchRedirects();
        } else {
            alert('Failed to delete redirect.');
        }
    };

    saveBtn.addEventListener('click', async () => {
        await saveRedirect(); // Call the save function
    }, { once: true }); // The listener will be removed after the first call

    redirectsTableBody.addEventListener('click', (event) => {
        if (event.target.classList.contains('delete-btn')) {
            const acronym = event.target.dataset.acronym;
            if (confirm(`Are you sure you want to delete the shortcut /to/${acronym}?`)) {
                deleteRedirect(acronym);
            }
        } else if (event.target.classList.contains('edit-btn')) {
            const acronym = event.target.dataset.acronym;
            const destination = event.target.dataset.destination;
            acronymInput.value = acronym;
            destinationInput.value = destination;
            // Show the form if it's hidden
            const formContainer = document.getElementById('form-container');
            if (formContainer.style.display === 'none') {
                toggleFormVisibility();
            }
        }
    });

    // Initial fetch of redirects
    fetchRedirects();
});
