// Album ranges from API Worker (capped at 452)
const albumRanges = {
  1: { start: 1, end: 13, count: 13 },
  2: { start: 14, end: 43, count: 30 },
  3: { start: 44, end: 68, count: 25 },
  4: { start: 69, end: 91, count: 23 },
  5: { start: 92, end: 125, count: 34 },
  6: { start: 126, end: 147, count: 22 },
  7: { start: 148, end: 183, count: 36 },
  8: { start: 184, end: 206, count: 23 },
  9: { start: 207, end: 215, count: 9 },
  10: { start: 216, end: 238, count: 23 },
  11: { start: 239, end: 261, count: 23 },
  12: { start: 262, end: 283, count: 22 },
  13: { start: 284, end: 297, count: 14 },
  14: { start: 298, end: 330, count: 33 },
  15: { start: 331, end: 351, count: 21 },
  16: { start: 352, end: 370, count: 19 },
  17: { start: 371, end: 452, count: 82 }
};

const baseUrl = 'https://raw.githubusercontent.com/DbRDYZmMRu/freshPlayerBucket/main';

function getAlbumForId(id) {
  for (const [album, range] of Object.entries(albumRanges)) {
    if (id >= range.start && id <= range.end) {
      return album;
    }
  }
  return null;
}

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const userAgent = request.headers.get('user-agent') || '';
  const isBot = /Googlebot|Bingbot|Slurp|DuckDuckBot|Baiduspider|YandexBot|facebookexternalhit|Twitterbot|LinkedInBot|Pinterestbot|Applebot|SemrushBot|AhrefsBot/.test(userAgent);
  console.log('User-Agent:', userAgent, 'IsBot:', isBot);
  const url = new URL(request.url);
  const path = url.pathname;

  if (path === '/pages/freshPlayer.html') {
    const trackId = url.searchParams.get('track');
    if (trackId && isBot) {
      const id = parseInt(trackId);
      console.log('Handling bot request for track ID:', id);

      // Validate ID
      if (isNaN(id) || id < 1 || id > 452) {
        return new Response(JSON.stringify({ error: 'Invalid track ID', id }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Get album
      const album = getAlbumForId(id);
      if (!album) {
        return new Response(JSON.stringify({ error: 'Track ID not found in any album', id }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Construct resource URLs
      const jsonUrl = `${baseUrl}/json/${album}/${id}.json`;
      const audioUrl = `${baseUrl}/audio/${album}/${id}.mp3`;
      const coverUrl = `${baseUrl}/cover/${album}/${id}.jpg`;

      try {
        // Fetch JSON
        console.log('Fetching JSON from:', jsonUrl);
        const response = await fetch(jsonUrl);
        console.log('JSON response status:', response.status);
        if (!response.ok) {
          return new Response(JSON.stringify({ error: 'JSON file not found', url: jsonUrl, status: response.status, details: await response.text() }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        const song = await response.json();

        // Album metadata
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
          "17": { name: "sev.en.ton (In Session)", date: "September 17, 2025" }
        };
        const albumData = albums[album] || { name: "Unknown Album", date: "" };

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

        // Generate HTML
        const html = `
          <!DOCTYPE html>
          <html lang="en">
            <head>
              <title>${song.song_title} by Frith Hilton</title>
              <meta name="description" content="Lyrics and cover for ${song.song_title} by Frith Hilton from ${albumData.name}. Released ${song.release_date}.">
              <meta name="robots" content="index,follow">
              <script type="application/ld+json">
                {
                  "@context": "https://schema.org",
                  "@type": "MusicRecording",
                  "name": "${song.song_title}",
                  "duration": "PT${Math.floor(song.duration / 60)}M${song.duration % 60}S",
                  "datePublished": "${song.release_date}",
                  "image": "${coverUrl}",
                  "url": "${request.url}",
                  "inAlbum": {
                    "@type": "MusicAlbum",
                    "name": "${albumData.name}",
                    "datePublished": "${albumData.date}"
                  },
                  "byArtist": {
                    "@type": "Person",
                    "name": "Frith Hilton",
                    "alternateName": "Howard Frith Hilton",
                    "birthPlace": "Ogun State, Nigeria",
                    "url": "https://www.frithhilton.com.ng/pages/bio.html",
                    "description": "Frith Hilton is a Nigerian author, poet, songwriter, and musician with over 330 songs and 1,000 poems across 25 books. Discover his work at frithhilton.com.ng.",
                    "image": [
                      {
                        "@type": "ImageObject",
                        "url": "https://www.frithhilton.com.ng/images/Frith-Hilton/frith-hilton-author.jpg",
                        "contentUrl": "https://www.frithhilton.com.ng/images/Frith-Hilton/frith-hilton-author.jpg",
                        "caption": "Frith Hilton, poet and musician, as an author",
                        "creator": {"@type": "Person", "name": "Frith Hilton"},
                        "width": 1920,
                        "height": 1920,
                        "license": "https://creativecommons.org/licenses/by/4.0/",
                        "creditText": "Frith Hilton",
                        "copyrightNotice": "Copyright © Frith Hilton, licensed under CC BY 4.0",
                        "acquireLicensePage": "https://creativecommons.org/licenses/by/4.0/"
                      },
                      {
                        "@type": "ImageObject",
                        "url": "https://www.frithhilton.com.ng/images/Frith-Hilton/frith-hilton-musician.jpg",
                        "contentUrl": "https://www.frithhilton.com.ng/images/Frith-Hilton/frith-hilton-musician.jpg",
                        "caption": "Frith Hilton, poet and musician, performing as a musician",
                        "creator": {"@type": "Person", "name": "Frith Hilton"},
                        "width": 612,
                        "height": 773,
                        "license": "https://creativecommons.org/licenses/by/4.0/",
                        "creditText": "Frith Hilton",
                        "copyrightNotice": "Copyright © Frith Hilton, licensed under CC BY 4.0",
                        "acquireLicensePage": "https://creativecommons.org/licenses/by/4.0/"
                      },
                      {
                        "@type": "ImageObject",
                        "url": "https://www.frithhilton.com.ng/images/Frith-Hilton/frith-hilton-poet-author-musician-songwriter.jpg",
                        "contentUrl": "https://www.frithhilton.com.ng/images/Frith-Hilton/frith-hilton-poet-author-musician-songwriter.jpg",
                        "caption": "Frith Hilton, poet, author, musician, and songwriter",
                        "creator": {"@type": "Person", "name": "Frith Hilton"},
                        "width": 720,
                        "height": 720,
                        "license": "https://creativecommons.org/licenses/by/4.0/",
                        "creditText": "Frith Hilton",
                        "copyrightNotice": "Copyright © Frith Hilton, licensed under CC BY 4.0",
                        "acquireLicensePage": "https://creativecommons.org/licenses/by/4.0/"
                      },
                      {
                        "@type": "ImageObject",
                        "url": "https://www.frithhilton.com.ng/images/Frith-Hilton/frith-hilton-poet.jpg",
                        "contentUrl": "https://www.frithhilton.com.ng/images/Frith-Hilton/frith-hilton-poet.jpg",
                        "caption": "Frith Hilton, poet and musician, as a poet",
                        "creator": {"@type": "Person", "name": "Frith Hilton"},
                        "width": 4080,
                        "height": 4080,
                        "license": "https://creativecommons.org/licenses/by/4.0/",
                        "creditText": "Frith Hilton",
                        "copyrightNotice": "Copyright © Frith Hilton, licensed under CC BY 4.0",
                        "acquireLicensePage": "https://creativecommons.org/licenses/by/4.0/"
                      },
                      {
                        "@type": "ImageObject",
                        "url": "https://www.frithhilton.com.ng/images/Frith-Hilton/frith-hilton-songwriter.jpg",
                        "contentUrl": "https://www.frithhilton.com.ng/images/Frith-Hilton/frith-hilton-songwriter.jpg",
                        "caption": "Frith Hilton, poet and musician, as a songwriter",
                        "creator": {"@type": "Person", "name": "Frith Hilton"},
                        "width": 720,
                        "height": 720,
                        "license": "https://creativecommons.org/licenses/by/4.0/",
                        "creditText": "Frith Hilton",
                        "copyrightNotice": "Copyright © Frith Hilton, licensed under CC BY 4.0",
                        "acquireLicensePage": "https://creativecommons.org/licenses/by/4.0/"
                      },
                      {
                        "@type": "ImageObject",
                        "url": "https://www.frithhilton.com.ng/images/Frith-Hilton/frith-hilton.jpg",
                        "contentUrl": "https://www.frithhilton.com.ng/images/Frith-Hilton/frith-hilton.jpg",
                        "caption": "Frith Hilton, poet and musician",
                        "creator": {"@type": "Person", "name": "Frith Hilton"},
                        "width": 1920,
                        "height": 1920,
                        "license": "https://creativecommons.org/licenses/by/4.0/",
                        "creditText": "Frith Hilton",
                        "copyrightNotice": "Copyright © Frith Hilton, licensed under CC BY 4.0",
                        "acquireLicensePage": "https://creativecommons.org/licenses/by/4.0/"
                      },
                      {
                        "@type": "ImageObject",
                        "url": "https://www.frithhilton.com.ng/images/Frith-Hilton/howard-frith-hilton.jpg",
                        "contentUrl": "https://www.frithhilton.com.ng/images/Frith-Hilton/howard-frith-hilton.jpg",
                        "caption": "Frith Hilton, poet and musician",
                        "creator": {"@type": "Person", "name": "Frith Hilton"},
                        "width": 720,
                        "height": 900,
                        "license": "https://creativecommons.org/licenses/by/4.0/",
                        "creditText": "Frith Hilton",
                        "copyrightNotice": "Copyright © Frith Hilton, licensed under CC BY 4.0",
                        "acquireLicensePage": "https://creativecommons.org/licenses/by/4.0/"
                      },
                      {
                        "@type": "ImageObject",
                        "url": "https://www.frithhilton.com.ng/images/Frith-Hilton/younger-frith-hilton.jpg",
                        "contentUrl": "https://www.frithhilton.com.ng/images/Frith-Hilton/younger-frith-hilton.jpg",
                        "caption": "Younger Frith Hilton, poet and musician",
                        "creator": {"@type": "Person", "name": "Frith Hilton"},
                        "width": 612,
                        "height": 772,
                        "license": "https://creativecommons.org/licenses/by/4.0/",
                        "creditText": "Frith Hilton",
                        "copyrightNotice": "Copyright © Frith Hilton, licensed under CC BY 4.0",
                        "acquireLicensePage": "https://creativecommons.org/licenses/by/4.0/"
                      }
                    ],
                    "jobTitle": "Poet, Musical artist",
                    "nationality": {"@type": "Country", "name": "Nigeria"},
                    "sameAs": [
                      "https://x.com/frithhilton17",
                      "https://www.youtube.com/@frithhilton17",
                      "https://soundcloud.com/frithhilton17",
                      "https://genius.com/artists/Frith-hilton",
                      "https://instagram.com/frithhilton17"
                    ],
                    "contactPoint": {"@type": "ContactPoint", "email": "hello@frithhilton.com.ng", "contactType": "Professional Contact"},
                    "worksFor": {"@type": "Organization", "name": "Frith Nightswan Enterprises", "url": "https://www.frithnightswanenterprises.com.ng"}
                  },
                  "recordingOf": {
                    "@type": "MusicComposition",
                    "lyrics": {"@type": "CreativeWork", "text": "${song.lyrics.map(l => l.line).join('\\n').replace(/"/g, '\\"')}"},
                    "lyricist": {"@type": "Person", "name": "${song.writer}"}
                  }
                }
              </script>
            </head>
            <body>
              <h1>${song.song_title} by Frith Hilton</h1>
              <p>From album: ${albumData.name} (${albumData.date}) | Released: ${song.release_date} | Duration: ${song.duration} seconds</p>
              <img src="${coverUrl}" alt="Cover for ${song.song_title} by Frith Hilton" width="300">
              <h2>Lyrics</h2>
              ${lyricsHtml}
              <audio controls><source src="${audioUrl}" type="audio/mpeg"></audio>
            </body>
          </html>
        `;
        return new Response(html, { headers: { 'Content-Type': 'text/html' } });
      } catch (error) {
        console.log('Fetch error:', error.message, 'URL:', jsonUrl);
        return new Response(JSON.stringify({ error: 'Fetch failed', details: error.message, url: jsonUrl }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
  }

  return fetch(request, { cf: { cacheTtl: 0 } });
}
