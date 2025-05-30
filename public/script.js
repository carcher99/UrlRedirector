document.addEventListener('DOMContentLoaded', () => {
    const formContainer = document.getElementById('form-container');
    formContainer.style.display = 'none'; // Hide the form initially
    const acronymInput = document.getElementById('acronym');
    const destinationInput = document.getElementById('destination');
    const saveBtn = document.getElementById('save-btn');
    const redirectsTableBody = document.querySelector('#redirects-list tbody');
    const toggleFormBtn = document.getElementById('toggle-form-btn');
    const searchInput = document.getElementById('search-input');

    let allRedirects = {}; // Store all redirects for filtering
    let currentSortColumn = 'acronym'; // Default sort column
    let currentSortDirection = 'asc'; // Default sort direction

    const toggleFormVisibility = () => {


        if (formContainer.style.display === 'none' || formContainer.style.display === '') {
            formContainer.style.display = 'block'; // Show the form
        } else {
            formContainer.style.display = 'none'; // Hide the form
        }
    };

    toggleFormBtn.addEventListener('click', toggleFormVisibility);

    const fetchRedirects = async () => {
        const response = await fetch('/api/redirects');
        const fetchedRedirects = await response.json();
        allRedirects = {};
        for (const acronym in fetchedRedirects) {
            allRedirects[acronym] = { ...fetchedRedirects[acronym], acronym: acronym };
        }
        sortAndFilterAndDisplayRedirects(); // Use the combined function
    };

    // Remove the old filterAndDisplayRedirects as it's now combined

    const sortAndFilterAndDisplayRedirects = () => {
        const searchTerm = searchInput.value.toLowerCase();
        let redirectsToDisplay = Object.values(allRedirects);

        // Apply filter
        redirectsToDisplay = redirectsToDisplay.filter(redirect => {
            return redirect.acronym.toLowerCase().includes(searchTerm) ||
                   redirect.url.toLowerCase().includes(searchTerm);
        });

        // Apply sort
        redirectsToDisplay.sort((a, b) => {
            let valA, valB;
            if (currentSortColumn === 'acronym') {
                valA = a.acronym.toLowerCase();
                valB = b.acronym.toLowerCase();
            } else if (currentSortColumn === 'url') {
                valA = a.url.toLowerCase();
                valB = b.url.toLowerCase();
            } else if (currentSortColumn === 'count') {
                valA = a.count;
                valB = b.count;
            }

            if (valA < valB) return currentSortDirection === 'asc' ? -1 : 1;
            if (valA > valB) return currentSortDirection === 'asc' ? 1 : -1;
            return 0;
        });

        displayRedirects(redirectsToDisplay);
    };

    const sortRedirects = (column) => {
        if (currentSortColumn === column) {
            currentSortDirection = currentSortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            currentSortColumn = column;
            currentSortDirection = 'asc';
        }
        sortAndFilterAndDisplayRedirects();
    };

    const displayRedirects = (redirectsArrayToDisplay) => {
        redirectsTableBody.innerHTML = '';
        redirectsArrayToDisplay.forEach(redirect => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><a href="/${redirect.acronym}" target="_blank">/${redirect.acronym}</a></td>
                <td><a href="${redirect.url}" target="_blank">${redirect.url}</a></td>
                <td>${redirect.count}</td>
                <td>
                    <i class="fas fa-edit edit-btn" data-acronym="${redirect.acronym}" data-destination="${redirect.url}"></i>
                    <i class="fas fa-trash-alt delete-btn" data-acronym="${redirect.acronym}"></i>
                </td>
            `;
            redirectsTableBody.appendChild(tr);
        });
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
    });

    redirectsTableBody.addEventListener('click', (event) => {
        if (event.target.classList.contains('delete-btn')) {
            const acronym = event.target.dataset.acronym;
            if (confirm(`Are you sure you want to delete the shortcut /${acronym}?`)) {
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

    searchInput.addEventListener('keyup', sortAndFilterAndDisplayRedirects);

    // Add event listeners for sorting
    document.querySelectorAll('th[data-sort]').forEach(header => {
        header.addEventListener('click', () => {
            sortRedirects(header.dataset.sort);
        });
    });

    // Initial fetch of redirects
    fetchRedirects();
});
