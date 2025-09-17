addEventListener("fetch", (event) => {
    event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
    const userAgent = request.headers.get("user-agent") || "";
    const isBot = /Googlebot|Bingbot|Slurp/.test(userAgent); // Add more crawlers if needed
    const url = new URL(request.url);
    const path = url.pathname;

    if (path === "/pages/freshPlayer.html") {
        const trackId = url.searchParams.get("track");
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
                    "17": { name: "sev.en.ton (In Session)", date: "September 17, 2025" }, // Updated with current date if needed
                };
                const album = albums[albumId] || { name: "Unknown Album", date: "" };

                // Format lyrics
                let lyricsHtml = "<pre>";
                song.lyrics.forEach((lineObj) => {
                    if (lineObj.line) {
                        lyricsHtml += `${lineObj.timestamp ? `[${lineObj.timestamp}] ` : ""}${lineObj.line}\n`;
                        if (Object.keys(lineObj.annotations).length > 0) {
                            lyricsHtml += "Annotations: " + JSON.stringify(lineObj.annotations) + "\n";
                        }
                    }
                });
                lyricsHtml += "</pre>";

                // Generate HTML (with full schema.org including your artist images – paste the array here)
                const html = `
          <!DOCTYPE html>
          <html lang="en">
            <head>
              <title>${song.song_title} by Frith Hilton</title>
              <meta name="description" content="Lyrics and cover for ${song.song_title} by Frith Hilton from ${album.name}.">
                            <script type="application/ld+json">
                {
                  "@context": "https://schema.org",
                  "@type": "MusicRecording",
                  "name": "${song.song_title}",
                  "duration": "PT${Math.floor(song.duration / 60)}M${song.duration % 60}S",
                  "datePublished": "${song.release_date}",
                  "image": "${data.cover}",
                  "url": "${request.url}",
                  "inAlbum": {
                    "@type": "MusicAlbum",
                    "name": "${album.name}",
                    "datePublished": "${album.date}"
                  },
                  "byArtist": {
                    "@type": "Person",
                    "name": "Frith Hilton",
                    "alternateName": "Howard Frith Hilton",
                    "birthPlace": "Ogun State, Nigeria",
                    "url": "https://www.frithhilton.com.ng/pages/bio.html",
                    "description": "Frith Hilton is a Nigerian author, poet, songwriter, and musician with over 330 songs and 1,000 poems across 25 books. Discover his work at frithhilton.com.ng.",
                    "image": ${JSON.stringify([
                        {
                            "@type": "ImageObject",
                            url: "https://www.frithhilton.com.ng/images/Frith-Hilton/frith-hilton-author.jpg",
                            contentUrl: "https://www.frithhilton.com.ng/images/Frith-Hilton/frith-hilton-author.jpg",
                            caption: "Frith Hilton, poet and musician, as an author",
                            creator: {
                                "@type": "Person",
                                name: "Frith Hilton",
                            },
                            width: 1920,
                            height: 1920,
                            license: "https://creativecommons.org/licenses/by/4.0/",
                            creditText: "Frith Hilton",
                            copyrightNotice: "Copyright © Frith Hilton, licensed under CC BY 4.0",
                            acquireLicensePage: "https://creativecommons.org/licenses/by/4.0/",
                        },
                        {
                            "@type": "ImageObject",
                            url: "https://www.frithhilton.com.ng/images/Frith-Hilton/frith-hilton-musician.jpg",
                            contentUrl: "https://www.frithhilton.com.ng/images/Frith-Hilton/frith-hilton-musician.jpg",
                            caption: "Frith Hilton, poet and musician, performing as a musician",
                            creator: {
                                "@type": "Person",
                                name: "Frith Hilton",
                            },
                            width: 612,
                            height: 773,
                            license: "https://creativecommons.org/licenses/by/4.0/",
                            creditText: "Frith Hilton",
                            copyrightNotice: "Copyright © Frith Hilton, licensed under CC BY 4.0",
                            acquireLicensePage: "https://creativecommons.org/licenses/by/4.0/",
                        },
                        {
                            "@type": "ImageObject",
                            url: "https://www.frithhilton.com.ng/images/Frith-Hilton/frith-hilton-poet-author-musician-songwriter.jpg",
                            contentUrl: "https://www.frithhilton.com.ng/images/Frith-Hilton/frith-hilton-poet-author-musician-songwriter.jpg",
                            caption: "Frith Hilton, poet, author, musician, and songwriter",
                            creator: {
                                "@type": "Person",
                                name: "Frith Hilton",
                            },
                            width: 720,
                            height: 720,
                            license: "https://creativecommons.org/licenses/by/4.0/",
                            creditText: "Frith Hilton",
                            copyrightNotice: "Copyright © Frith Hilton, licensed under CC BY 4.0",
                            acquireLicensePage: "https://creativecommons.org/licenses/by/4.0/",
                        },
                        {
                            "@type": "ImageObject",
                            url: "https://www.frithhilton.com.ng/images/Frith-Hilton/frith-hilton-poet.jpg",
                            contentUrl: "https://www.frithhilton.com.ng/images/Frith-Hilton/frith-hilton-poet.jpg",
                            caption: "Frith Hilton, poet and musician, as a poet",
                            creator: {
                                "@type": "Person",
                                name: "Frith Hilton",
                            },
                            width: 4080,
                            height: 4080,
                            license: "https://creativecommons.org/licenses/by/4.0/",
                            creditText: "Frith Hilton",
                            copyrightNotice: "Copyright © Frith Hilton, licensed under CC BY 4.0",
                            acquireLicensePage: "https://creativecommons.org/licenses/by/4.0/",
                        },
                        {
                            "@type": "ImageObject",
                            url: "https://www.frithhilton.com.ng/images/Frith-Hilton/frith-hilton-songwriter.jpg",
                            contentUrl: "https://www.frithhilton.com.ng/images/Frith-Hilton/frith-hilton-songwriter.jpg",
                            caption: "Frith Hilton, poet and musician, as a songwriter",
                            creator: {
                                "@type": "Person",
                                name: "Frith Hilton",
                            },
                            width: 720,
                            height: 720,
                            license: "https://creativecommons.org/licenses/by/4.0/",
                            creditText: "Frith Hilton",
                            copyrightNotice: "Copyright © Frith Hilton, licensed under CC BY 4.0",
                            acquireLicensePage: "https://creativecommons.org/licenses/by/4.0/",
                        },
                        {
                            "@type": "ImageObject",
                            url: "https://www.frithhilton.com.ng/images/Frith-Hilton/frith-hilton.jpg",
                            contentUrl: "https://www.frithhilton.com.ng/images/Frith-Hilton/frith-hilton.jpg",
                            caption: "Frith Hilton, poet and musician",
                            creator: {
                                "@type": "Person",
                                name: "Frith Hilton",
                            },
                            width: 1920,
                            height: 1920,
                            license: "https://creativecommons.org/licenses/by/4.0/",
                            creditText: "Frith Hilton",
                            copyrightNotice: "Copyright © Frith Hilton, licensed under CC BY 4.0",
                            acquireLicensePage: "https://creativecommons.org/licenses/by/4.0/",
                        },
                        {
                            "@type": "ImageObject",
                            url: "https://www.frithhilton.com.ng/images/Frith-Hilton/howard-frith-hilton.jpg",
                            contentUrl: "https://www.frithhilton.com.ng/images/Frith-Hilton/howard-frith-hilton.jpg",
                            caption: "Frith Hilton, poet and musician",
                            creator: {
                                "@type": "Person",
                                name: "Frith Hilton",
                            },
                            width: 720,
                            height: 900,
                            license: "https://creativecommons.org/licenses/by/4.0/",
                            creditText: "Frith Hilton",
                            copyrightNotice: "Copyright © Frith Hilton, licensed under CC BY 4.0",
                            acquireLicensePage: "https://creativecommons.org/licenses/by/4.0/",
                        },
                        {
                            "@type": "ImageObject",
                            url: "https://www.frithhilton.com.ng/images/Frith-Hilton/younger-frith-hilton.jpg",
                            contentUrl: "https://www.frithhilton.com.ng/images/Frith-Hilton/younger-frith-hilton.jpg",
                            caption: "Younger Frith Hilton, poet and musician",
                            creator: {
                                "@type": "Person",
                                name: "Frith Hilton",
                            },
                            width: 612,
                            height: 772,
                            license: "https://creativecommons.org/licenses/by/4.0/",
                            creditText: "Frith Hilton",
                            copyrightNotice: "Copyright © Frith Hilton, licensed under CC BY 4.0",
                            acquireLicensePage: "https://creativecommons.org/licenses/by/4.0/",
                        },
                    ])},
                    "jobTitle": "Poet, Musical artist",
                    "nationality": {"@type": "Country", "name": "Nigeria"},
                    "sameAs": ["https://x.com/frithhilton17", "https://www.youtube.com/@frithhilton17", "https://soundcloud.com/frithhilton17", "https://genius.com/artists/Frith-hilton", "https://instagram.com/frithhilton17"],
                    "contactPoint": {"@type": "ContactPoint", "email": "hello@frithhilton.com.ng", "contactType": "Professional Contact"},
                    "worksFor": {"@type": "Organization", "name": "Frith Nightswan Enterprises", "url": "https://www.frithnightswanenterprises.com.ng"}
                  },
                  "recordingOf": {
                    "@type": "MusicComposition",
                    "lyrics": {"@type": "CreativeWork", "text": "${song.lyrics
                        .map((l) => l.line)
                        .join("\\n")
                        .replace(/"/g, '\\"')}"},
                    "lyricist": {"@type": "Person", "name": "${song.writer}"}
                  }
                }
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
                return new Response(html, { headers: { "Content-Type": "text/html" } });
            } else {
                return new Response("Song not found", { status: 404 });
            }
        }
    }

    // Proxy to GitHub Pages for non-bots
    return fetch(request);
}
