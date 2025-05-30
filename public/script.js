document.addEventListener('DOMContentLoaded', () => {
    const acronymInput = document.getElementById('acronym');
    const destinationInput = document.getElementById('destination');
    const saveBtn = document.getElementById('save-btn');
    const redirectsTableBody = document.querySelector('#redirects-list tbody');

    const fetchRedirects = async () => {
        const response = await fetch('/api/redirects');
        const redirects = await response.json();
        displayRedirects(redirects);
    };

    const displayRedirects = (redirects) => {
        redirectsTableBody.innerHTML = '';
        for (const acronym in redirects) {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>/to/${acronym}</td>
                <td>${redirects[acronym]}</td>
                <td>
                    <button class="edit-btn" data-acronym="${acronym}" data-destination="${redirects[acronym]}">Edit</button>
                    <button class="delete-btn" data-acronym="${acronym}">Delete</button>
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

    saveBtn.addEventListener('click', saveRedirect);

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
        }
    });

    // Initial fetch of redirects
    fetchRedirects();
});
