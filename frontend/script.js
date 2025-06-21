document.addEventListener('DOMContentLoaded', () => {
    const banner = document.getElementById('banner');
    const moviesGrid = document.querySelector('#movies-grid .grid');
    const seriesGrid = document.querySelector('#series-grid .grid');

    // IMPORTANT: This is a placeholder URL.
    // We will replace this with our real backend URL after we deploy to Render.
    const apiUrl = 'https://netflix-backend-npgj.onrender.com';

    const loadContent = async () => {
        try {
            // We construct the full path to our API endpoint
            const res = await fetch(`${apiUrl}/api/posts`);

            // This is a fallback for testing. If the fetch fails, it tries a local file.
            if (!res.ok) {
                console.warn("Could not fetch from API, trying local fallback.");
                const fallbackRes = await fetch('posts.json'); // This won't work on the live site, but is useful for some testing.
                if (!fallbackRes.ok) throw new Error("API and fallback both failed.");
                posts = await fallbackRes.json();
            } else {
               posts = await res.json();
            }


            // Clear existing content
            moviesGrid.innerHTML = '';
            seriesGrid.innerHTML = '';

            // Set the banner to the latest post
            if (posts.length > 0) {
                const latestPost = posts[0];
                banner.style.backgroundImage = `linear-gradient(to top, rgba(0,0,0,0.8), transparent), url(${latestPost.poster})`;
                banner.innerHTML = `
                    <h1>${latestPost.title}</h1>
                    <p>${latestPost.description}</p>
                `;
            }

            // Populate movies and series grids
            posts.forEach(post => {
                const posterElement = document.createElement('div');
                posterElement.classList.add('poster');
                posterElement.innerHTML = `<img src="${post.poster}" alt="${post.title}">`;

                if (post.category.toLowerCase() === 'movie') {
                    moviesGrid.appendChild(posterElement);
                } else if (post.category.toLowerCase() === 'series') {
                    seriesGrid.appendChild(posterElement);
                }
            });

        } catch (error) {
            console.error('Error loading content:', error);
            // Display an error message on the page for better feedback
            moviesGrid.innerHTML = '<p style="color:red;">Could not load content. Please check the API connection.</p>';
            seriesGrid.innerHTML = '';
        }
    };

    loadContent();
});
