(() => {
    const style = document.createElement('style');
    style.textContent = `
      .duplicate-song {  position: relative; outline: 2px solid #ff4136 !important; }
      .original-song { position: relative; outline: 2px solid #2ecc40 !important; }
      .duplicate-song::after, .original-song::after {
        position: absolute; top: 0; right: 0; padding: 2px 5px; font-size: 12px; color: white;
      }
   .duplicate-song::after {
      content: 'Duplicate';
      position: absolute;
      top: 0;
      right: 0;
      background-color: #ff4136;
      color: white;
      padding: 2px 5px;
      font-size: 12px;
      border-bottom-left-radius: 4px;
    }
      .original-song::after { content: 'Original'; background-color: #2ecc40; }
      
      #result-overlay {
        position: fixed; top: 10px; right: 10px; background: rgba(0,0,0,0.8); color: white;
        padding: 10px; border-radius: 5px; z-index: 9999; font-family: Arial, sans-serif;
      }
    `;
    document.head.appendChild(style);
  
    const showMessage = (message) => {
      let overlay = document.getElementById('result-overlay');
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'result-overlay';
        document.body.appendChild(overlay);
      }
      overlay.innerHTML = message;
    };
  
    const detectDuplicates = () => {
      const songs = document.querySelectorAll('[data-clip-id]');
      const songMap = new Map();
  
      songs.forEach(song => {
        const clipId = song.getAttribute('data-clip-id');
        songMap.set(clipId, (songMap.get(clipId) || []).concat(song));
      });
  
      let duplicateCount = 0;
      songMap.forEach((occurrences, clipId) => {
        if (occurrences.length > 1) {
          occurrences[0].classList.add('original-song');
          occurrences.slice(1).forEach(song => {
            song.classList.add('duplicate-song');
            duplicateCount++;
          });
        }
      });
  
      return { total: songs.length, unique: songMap.size, duplicates: duplicateCount };
    };
  
    const autoScroll = (callback) => {
      const playlistDiv = document.querySelector('div.css-1cgip5k');
      if (!playlistDiv) {
        showMessage('Playlist div not found. Aborting.');
        return;
      }
  
      let lastScrollHeight = playlistDiv.scrollHeight;
      let scrollAttempts = 0;
      const maxScrollAttempts = 50; 
      
      const scrollStep = () => {
        playlistDiv.scrollTo(0, playlistDiv.scrollHeight);
        scrollAttempts++;
        showMessage(`Scrolling... Attempt ${scrollAttempts}/${maxScrollAttempts}`);
  
        setTimeout(() => {
          if (playlistDiv.scrollHeight > lastScrollHeight && scrollAttempts < maxScrollAttempts) {
            lastScrollHeight = playlistDiv.scrollHeight;
            scrollStep();
          } else {
            callback();
          }
        }, 4000); 
      };
      scrollStep();
    };
  
    showMessage('Starting playlist scan. This may take a moment...');
    setTimeout(() => {
      autoScroll(() => {
        const results = detectDuplicates();
        showMessage(`
          Scan completed:<br>
          Total songs: ${results.total}<br>
          Unique songs: ${results.unique}<br>
          Duplicates found: ${results.duplicates}
        `);
        console.log('Scan completed:', results);
      });
    }, 2000);
  })();