addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const userAgent = request.headers.get('user-agent') || '';
  // Expanded regex to include Google-InspectionTool and other Google crawlers
  const isBot = /Googlebot|Google-InspectionTool|Googlebot-Image|Googlebot-Video|Mediapartners-Google|Bingbot|Slurp|DuckDuckBot|Baiduspider|YandexBot|facebookexternalhit|Twitterbot|LinkedInBot|Pinterestbot|Applebot|SemrushBot|AhrefsBot/i.test(userAgent);
  console.log('User-Agent:', userAgent, 'IsBot:', isBot);

  if (isBot) {
    // Parse track ID from query string
    const url = new URL(request.url);
    const trackId = parseInt(url.searchParams.get("track"));
    if (isNaN(trackId) || trackId < 1 || trackId > 452) {
      return new Response("Invalid track ID", { status: 400 });
    }

    // Fetch albums.json
    const albumsUrl = "https://raw.githubusercontent.com/freshBoyChilling/discography/main/data/albums.json";
    let albums;
    try {
      const res = await fetch(albumsUrl);
      if (!res.ok) throw new Error("Failed to fetch albums.json");
      albums = await res.json();
    } catch (e) {
      return new Response("Error fetching albums data: " + e.message, { status: 500 });
    }

    // Find album and song
    let song, album;
    for (const alb of albums) {
      const foundSong = alb.songs.find((s) => s.id === trackId);
      if (foundSong) {
        song = foundSong;
        album = alb;
        break;
      }
    }
    if (!song || !album) {
      return new Response("Track not found", { status: 404 });
    }

    // Fetch track-specific JSON for lyrics and duration
    const baseUrl = "https://raw.githubusercontent.com/DbRDYZmMRu/freshPlayerBucket/main";
    const jsonUrl = `${baseUrl}/json/${album.id}/${trackId}.json`;
    let trackData;
    try {
      const res = await fetch(jsonUrl);
      if (!res.ok) throw new Error("Failed to fetch track JSON");
      trackData = await res.json();
    } catch (e) {
      return new Response("Error fetching track data: " + e.message, { status: 500 });
    }

    // Generate track list for schema
    const trackList = album.songs.map((s) => ({
      "@type": "MusicRecording",
      position: s.track,
      name: s.title,
      url: `https://www.frithhilton.com.ng/pages/freshPlayer.html?track=${s.id}`,
      ...(s.about && s.about !== "Song information will be displayed here when available." && { description: s.about }),
      additionalProperty: { "@type": "PropertyValue", name: "muse", value: s.muse },
    }));

    // Build lyrics HTML
    const lyricsHtml = `<pre>${trackData.lyrics.map((l) => l.line ? l.line : "").join("\n")}</pre>`;

    // Calculate prev/next track
    const songIndex = album.songs.findIndex((s) => s.id === trackId);
    const prevId = songIndex > 0 ? album.songs[songIndex - 1].id : null;
    const nextId = songIndex < album.songs.length - 1 ? album.songs[songIndex + 1].id : null;

    // Generate HTML for bots
    const html = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="utf-8">
          <meta http-equiv="X-UA-Compatible" content="IE=edge">
          <meta name="author" content="Frith Hilton">
          <meta name="description" content="Stream and read lyrics to ${song.title} by Frith Hilton from the ${album.title} album, released ${trackData.release_date}.">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <meta property="og:url" content="${request.url}">
          <meta property="og:type" content="music.song">
          <meta property="og:title" content="${song.title} by Frith Hilton - ${album.title} album">
          <meta property="og:description" content="Stream and read lyrics to ${song.title} by Frith Hilton from the ${album.title} album, released ${trackData.release_date}.">
          <meta property="og:image" content="${baseUrl}/cover/${album.id}/${trackId}.jpg">
          <meta name="twitter:card" content="summary_large_image">
          <meta name="twitter:title" content="${song.title} by Frith Hilton - ${album.title} album">
          <meta name="twitter:description" content="Stream and read lyrics to ${song.title} by Frith Hilton from the ${album.title} album, released ${trackData.release_date}.">
          <meta name="twitter:image" content="${baseUrl}/cover/${album.id}/${trackId}.jpg">
          <link rel="canonical" href="${request.url}">
          <meta name="robots" content="index,follow">
          <title>${song.title} by Frith Hilton - ${album.title} album</title>
          <style>#seo-content { display: none; }</style>
          <script type="application/ld+json">
            {
              "@context": "https://schema.org",
              "@type": "MusicAlbum",
              "id": "${album.id}",
              "name": "${album.title}",
              "image": "${album.cover}",
              "datePublished": "${album.releaseDate}",
              ${album.paymentLink ? `"url": "${album.paymentLink}",` : ""}
              "numTracks": ${album.songs.length},
              "track": ${JSON.stringify(trackList, null, 2)},
              "byArtist": {
                "@type": "Person",
                "name": "Frith Hilton",
                "alternateName": "Howard Frith Hilton",
                "birthPlace": "Ogun State, Nigeria",
                "url": "https://www.frithhilton.com.ng/pages/bio.html",
                "description": "Frith Hilton is a Nigerian author, poet, songwriter, and musician with over 370 songs and almost 1,000 poems across over 35 books. Discover his work at www.frithhilton.com.ng.",
                "sameAs": [
                  "https://x.com/frithhilton17",
                  "https://www.youtube.com/@frithhilton17",
                  "https://soundcloud.com/frithhilton17",
                  "https://genius.com/artists/Frith-hilton",
                  "https://instagram.com/frithhilton17"
                ],
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
                "contactPoint": {"@type": "ContactPoint", "email": "hello@frithhilton.com.ng", "contactType": "Professional Contact"},
                "worksFor": {"@type": "Organization", "name": "Frith Nightswan Enterprises", "url": "https://www.frithnightswanenterprises.com.ng"}
              },
              "contains": {
                "@type": "MusicRecording",
                "name": "${song.title}",
                "url": "${request.url}",
                "duration": "PT${Math.floor(trackData.duration / 60)}M${trackData.duration % 60}S",
                "datePublished": "${trackData.release_date}",
                "image": "${baseUrl}/cover/${album.id}/${trackId}.jpg",
                "audio": "${baseUrl}/audio/${album.id}/${trackId}.mp3",
                ${song.about && song.about !== "Song information will be displayed here when available." ? `"description": "${song.about.replace(/"/g, '\\"')}",` : ""}
                "additionalProperty": {"@type": "PropertyValue", "name": "muse", "value": "${song.muse}"},
                "recordingOf": {
                  "@type": "MusicComposition",
                  "lyrics": {"@type": "CreativeWork", "text": "${trackData.lyrics
                    .map((l) => l.line)
                    .join("\\n")
                    .replace(/"/g, '\\"')}"},
                  "lyricist": {"@type": "Person", "name": "${trackData.writer}"}
                },
                "interactionStatistic": {
                  "@type": "InteractionCounter",
                  "interactionType": "https://schema.org/ListenAction",
                  "userInteractionCount": "14300" // Replace with actual data if available
                }
              },
              "breadcrumb": {
                "@type": "BreadcrumbList",
                "itemListElement": [
                  {"@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.frithhilton.com.ng/"},
                  {"@type": "ListItem", "position": 2, "name": "Albums", "item": "https://www.frithhilton.com.ng/pages/freshPlayer.html"},
                  {"@type": "ListItem", "position": 3, "name": "${song.title}", "item": "${request.url}"}
                ]
              }
            }
          </script>
        </head>
        <body>
          <div id="seo-content">
            <nav aria-label="Breadcrumb">
              <ol>
                <li><a href="/">Home</a></li>
                <li><a href="/albums">Albums</a></li>
                <li aria-current="page">${song.title}</li>
              </ol>
            </nav>
            <h1>${song.title} Lyrics by Frith Hilton - Official Audio</h1>
            <p>From album: ${album.title} (${album.releaseDate}) | Released: ${trackData.release_date} | Duration: ${trackData.duration} seconds</p>
            ${song.about && song.about !== "Song information will be displayed here when available." ? `<p>${song.about}</p>` : ""}
            <img src="${baseUrl}/cover/${album.id}/${trackId}.jpg" alt="${song.title} cover art by Frith Hilton - Official music record artwork" width="300">
            <h2>Full Lyrics for ${song.title}</h2>
            ${lyricsHtml}
            <audio controls><source src="${baseUrl}/audio/${album.id}/${trackId}.mp3" type="audio/mpeg"></audio>
            <nav aria-label="Track Navigation">
              ${prevId ? `<a href="https://www.frithhilton.com.ng/pages/freshPlayer.html?track=${prevId}">Previous Track</a>` : ""}
              <a href="${album.paymentLink || `/albums/${album.id}`}">${album.title} Album</a>
              ${nextId ? `<a href="https://www.frithhilton.com.ng/pages/freshPlayer.html?track=${nextId}">Next Track</a>` : ""}
            </nav>
          </div>
          <div id="player">Loading music player...</div>
          <script src="js/inject-for-bots.js" async></script>
        </body>
      </html>
    `;
    return new Response(html, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  } else {
    // Proxy to GitHub Pages for non-bots
    return fetch(request, { cf: { cacheTtl: 0 } });
  }
}