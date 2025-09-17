addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const userAgent = request.headers.get('user-agent') || '';
  const isBot = /Googlebot|Bingbot|Slurp/.test(userAgent); // Add more crawlers if needed
  const url = new URL(request.url);
  const path = url.pathname;

  if (path === '/pages/freshPlayer.html') {
    const trackId = url.searchParams.get('track');
    if (trackId && isBot) {
      // Fetch song JSON from your API
      const resourceUrl = `https://www.frithhilton.com.ng/resource/${trackId}`;
      const response = await fetch(resourceUrl);
      if (response.ok) {
        const data = await response.json();
        const song = data.json;
        const albumId = data.album;

        // Album mapping (hardcode or fetch if dynamic)
        const albums = {
          "1": { name: "H.I.V", date: "September 13, 2019" },
          "2": { name: "Colourful Light", date: "January 18, 2023" },
          "3": { name: "December 13", date: "January 30, 2022" },
          "4": { name: "Frith", date: "June 19, 2022" },
          "5": { name: "screen time", date: "September 19, 2022" },
          "6": { name: "Jacaranda", date: "November 30, 2022" },
          "7": { name: "Hilton", date: "February 15, 2022" },
          "8": { name: "lantern", date: "June 4, 2023" },
          "9": { name: "the Lover tap3", date: "July 16, 2023" },
          "10": { name: "Nightswan", date: "January 15, 2024" },
          "11": { name: "Troubadour", date: "March 7, 2024" },
          "12": { name: "it's pop", date: "May 28, 2024" },
          "13": { name: "the Sessions", date: "July 26, 2024" },
          "14": { name: "Farther Memes", date: "December 12, 2024" },
          "15": { name: "Valence Eve", date: "March 13, 2025" },
          "16": { name: "whereIsTheMoodRobot", date: "August 27, 2025" },
          "17": { name: "sev.en.ton (In Session)", date: "September 17, 2025" } // Updated with current date if needed
        };
        const album = albums[albumId] || { name: "Unknown Album", date: "" };

        // Format lyrics
        let lyricsHtml = '<pre>';
        song.lyrics.forEach(lineObj => {
          if (lineObj.line) {
            lyricsHtml += `${lineObj.timestamp ? `[${lineObj.timestamp}] ` : ''}${lineObj.line}\n`;
            if (Object.keys(lineObj.annotations).length > 0) {
              lyricsHtml += 'Annotations: ' + JSON.stringify(lineObj.annotations) + '\n';
            }
          }
        });
        lyricsHtml += '</pre>';

        // Generate HTML (with full schema.org including your artist images – paste the array here)
        const html = `
          <!DOCTYPE html>
          <html lang="en">
            <head>
              <title>${song.song_title} by Frith Hilton</title>
              <meta name="description" content="Lyrics and cover for ${song.song_title} by Frith Hilton from ${album.name}.">
              <script type="application/ld+json">
                // Full MusicRecording schema here, as in previous message
              </script>
            </head>
            <body>
              <h1>${song.song_title}</h1>
              <img src="${data.cover}" alt="Cover for ${song.song_title}">
              <h2>Lyrics</h2>
              ${lyricsHtml}
            </body>
          </html>
        `;
        return new Response(html, { headers: { 'Content-Type': 'text/html' } });
      } else {
        return new Response('Song not found', { status: 404 });
      }
    }
  }

  // Proxy to GitHub Pages for non-bots
  return fetch(request);
}
