// Suno Search bookmarklet 
/*
    <h1>Suno Music Search Bookmarklet</h1>
    <p>One off search tool wrote for myself before Suno had a search.</p>
    <p>Terrible mess of hacks, never intended to be reused or seen by others, but still partially works.</p>
    <p>Maybe some other people find it useful. It still does some things official Suno search does not.</p>
    <p>
    "Indexing" songs is manual process of clicking through your library pages.
    This was done to avoid any using unofficial APIs or using automation - all Suno data is passively observed and recorded. 
</p>
    <p>Search data and notes stored locally in your browser. Clear site data to reset.</p>
*/

(function () {
	const originalFetch = window.fetch;

	let popup = document.getElementById("songPreviewPopup");
	let totalClips = 0;

	let notyf = null;
	window.fetch = function () {
		return originalFetch.apply(this, arguments).then((response) => {

			if (
				!response.url.includes("api/feed") 
                && !response.url.includes("api/search") // for partial indexing 
				// && !response.url.includes("api/playlist") # this indexes all songs you browse, no longer needed with new Suno update
			)
				return response;

			return processFeedResponse(response);
		});
	};



	const dbPromise = idbOpen("songsDB", 1, (upgradeDB) => {
		if (!upgradeDB.objectStoreNames.contains("songs")) {
			upgradeDB.createObjectStore("songs");
		}
	});

	function setCompressedItem(key, value) {
		const stringValue = JSON.stringify(value);
		localStorage.setItem(key, stringValue);
	}

	function getDecompressedItem(key) {
		const Value = localStorage.getItem(key);
		if (!Value) return null;
		return JSON.parse(Value);
	}

	function idbOpen(name, version, upgradeCallback) {
		return new Promise((resolve, reject) => {
			const request = indexedDB.open(name, version);
			request.onerror = () => reject(request.error);
			request.onsuccess = () => resolve(request.result);
			request.onupgradeneeded = () => upgradeCallback(request.result);
		});
	}

	function idbSetItem(key, value) {
		return dbPromise.then((db) => {
			const tx = db.transaction("songs", "readwrite");
			tx.objectStore("songs").put(JSON.stringify(value), key);
			return tx.complete;
		});
	}
    function addTemplateFunctionality() {
        if (!window.location.href.includes('/create')) {
            return;
        }
    
        function containerExists(className) {
            return !!document.querySelector(`.template-container.${className}`);
        }
    
        function createTemplateUI(textareaSelector, placeholderText, className) {
            if (containerExists(className)) {
                return;
            }
    
            const container = document.createElement('div');
            container.className = `template-container ${className}`; 
            container.style.marginBottom = '10px'; 
            container.style.display = 'none'; 
            document.body.appendChild(container);
    
            const toggleButton = document.createElement('button');
            toggleButton.textContent = `▼/▲ Toggle ${className} Template`;
            container.appendChild(toggleButton);
    
            const templateInput = document.createElement('textarea');
            templateInput.placeholder = placeholderText;
            container.appendChild(templateInput);
    
            templateInput.value = "{winter|spring|summer|fall} is coming";
    
            const randomButton = document.createElement('button');
            randomButton.textContent = "Render Randomly";
            randomButton.className = 'random';
            container.appendChild(randomButton);
    
            const sequenceButton = document.createElement('button');
            sequenceButton.textContent = "Render Sequentially";
            sequenceButton.className = 'sequence';
            container.appendChild(sequenceButton);
    
            let sequenceIndices = {};
    
            function renderTemplate(random = true) {
                const textarea = document.querySelector(textareaSelector);
                if (!textarea) {
                    return;
                }
    
                let content = templateInput.value;
                const regex = /\{([^}]+)\}/g;
                let matchCount = 0;
    
                content = content.replace(regex, (match) => {
                    const options = match.slice(1, -1).split('|');
                    if (random) {
                        return options[Math.floor(Math.random() * options.length)];
                    } else {
                        let currentIndex = sequenceIndices[matchCount] || 0;
                        sequenceIndices[matchCount] = (currentIndex + 1) % options.length;
                        matchCount++;
                        return options[currentIndex];
                    }
                });
    
                textarea.value = content;
            }
    
            randomButton.addEventListener('click', () => renderTemplate(true));
            sequenceButton.addEventListener('click', () => renderTemplate(false));
    
            toggleButton.addEventListener('click', () => {
                const isShown = templateInput.style.display !== 'none';
                templateInput.style.display = isShown ? 'none' : 'block';
                randomButton.style.display = isShown ? 'none' : 'inline';
                sequenceButton.style.display = isShown ? 'none' : 'inline';
                toggleButton.textContent = isShown ? `▲ Show ${className}` : `▼ Hide ${className}`;
            });
    
            container.style.display = 'block';
        }
    
        createTemplateUI('[data-testid="lyrics-textarea"]', "Enter template for lyrics...", "lyrics");
        createTemplateUI('[data-testid="style-textarea"]', "Enter template for style...", "style");
    }
    

    
    function addCharacterCounter() {
  
            if (!window.location.href.includes('create')) {
              return; 
            }
          
            const textarea = document.querySelector('[data-testid="lyrics-textarea"]');
          
            if (!textarea) {
              return;
            }
          
            if (textarea.nextElementSibling && textarea.nextElementSibling.classList.contains('char-count')) {
              return;
            }
          
            const charCount = document.createElement('div');
            charCount.id = 'char-count';
            charCount.className = 'char-count';
          
            textarea.parentNode.insertBefore(charCount, textarea.nextSibling);
          

            const updateCharCount = () => {
              const maxLength = textarea.getAttribute('maxlength');
              if (!maxLength) {
                return;
              }
              const currentLength = textarea.value.length;
              charCount.textContent = `${currentLength} / ${maxLength}`;
            };
          
            updateCharCount();
          
            textarea.addEventListener('input', updateCharCount);   
            
            addTemplateFunctionality();
        }

	function idbGetItem(key) {
		return dbPromise.then((db) => {
			return new Promise((resolve, reject) => {
				const transaction = db.transaction("songs");
				const objectStore = transaction.objectStore("songs");
				const request = objectStore.get(key);

				request.onsuccess = () => {
					if (request.result === undefined) {
						resolve(null);
					} else {
						try {
							const decompressedValue = JSON.parse(request.result);
							resolve(decompressedValue);
						} catch (e) {
							reject(e);
						}
					}
				};
				request.onerror = () => {
					reject(request.error);
				};
			});
		});
	}

	function processFeedResponse(response) {
		/* feed format 3/15/2024
    [
    {
        "id": "7e58e171-1594-4847-ba84-addea68bd93e"
    }
    /*

    /* playlist format 
    {
        "id": "1190bf92-10dc-4ce5-968a-7a377f37f984",
        "playlist_clips": [
            {
                "clip": {
                    "id": "8d54adbf-2d42-4d5a-ab72-7c815450893b"
                }
            }
        ]
    }
    */

    /*Search format 
    {
    "result": {
        "library_song": {
            "total_hits": 545,
            "result": [
                {
                    "id": "abddcbdd-7385-4643-a174-45d9bc0cdaef",

    */

		if (response.url.includes("api/playlist")) {
			return response
				.clone()
				.json()
				.then((json) => {
					setTimeout(() => processPlaylistItems(json.playlist_clips), 1);
					return response;
				})
				.catch((error) => console.error("Error parsing Suno Playlist:", error));
		} else if (response.url.includes("api/search")) {
            return response
                .clone()
                .json()
                .then((json) => {
                    setTimeout(() => processFeedItems(json.result.library_song.result), 1);
                    return response;
                })
                .catch((error) => console.error("Error parsing Suno Search:", error));
            } else if (response.url.includes("api/feed")) {
			return response
				.clone()
				.json()
				.then((json) => {
					setTimeout(() => processFeedItems(json), 1);
					return response;
				})
				.catch((error) => console.error("Error parsing Suno Feed:", error));
		}
	}

	function processPlaylistItems(items) {
		// console.log("processing Playlist of items: ", items.length);
		// console.log(items);
		clearOldDivs();

		items.forEach((item) => {
			StoreItemOnly(item.clip);
		});
	}

	function processFeedItems(items) {
		// console.log("processing feed of items: ", items.length);
		// console.log(items);
		clearOldDivs();
        addCharacterCounter();

		if (items !== undefined && items !== null && items.length > 0) {
        items.forEach((item) => {
			const targetDiv = document.querySelector(`div[data-key="${item.id}"]`);
			if (!targetDiv || targetDiv.classList.contains("processed-item")) return;

			targetDiv.classList.add("processed-item");

			insertMetadataDiv(item, targetDiv);
		});
    }
	}

	function clearOldDivs() {
		document
			.querySelectorAll(".chirp-tweaks-div")
			.forEach((div) => div.remove());
	}

	async function StoreItemOnly(item) {
		// console.log("storing: ", item.id);
		// console.log(item);
		await idbSetItem(`song_data_${item.id}`, item);
	}

	async function insertMetadataDiv(item, targetDiv) {
		const metadataDiv = document.createElement("div");
		metadataDiv.classList.add("chirp-tweaks-div");
		const isFirstChild = targetDiv.parentNode.firstElementChild === targetDiv;

		metadataDiv.innerHTML = generateMetadataContent(item, isFirstChild);

		targetDiv.insertAdjacentElement("afterend", metadataDiv);

		document
			.getElementById(`notes_${item.id}`)
			.addEventListener("change", async function () {
				setCompressedItem(`song_notes_${item.id}`, this.value);
			});

		await idbSetItem(`song_data_${item.id}`, item);
	}

	function generateMetadataContent(item, isFirstChild) {
		const historyContent = generateHistoryContent(item.metadata);

		const duration = formatDuration(item.metadata.duration);
		var created_at = "";
		if (isFirstChild) {
			created_at = new Date(item.created_at).toLocaleString();
			created_at = `<p class="song_created">${created_at}</p>`;
		}

		const storedNotes = getDecompressedItem(`song_notes_${item.id}`) || "";

		const playCountClass = item.play_count === 0 ? "zero_play_count" : "";

		var pcount = "";
		if (item.play_count == 0) {
			pcount = "0";
		}
        else
        {
            pcount = item.play_count;
        }

		var hasNotes = "";
		if (storedNotes.trim() !== "") {
			hasNotes = "has_note";
		}

        var modelName = item.model_name.replace("chirp-", "");

		return `${created_at}<p class="song_duration ${playCountClass}">${duration}</p>
            <p class="song_play_count ${playCountClass}">&nbsp;${pcount}&nbsp;<span class="model_name">${modelName}</span></p>
            
            ${historyContent}

            <textarea class="song_notes chakra-textarea ${hasNotes}" placeholder="notes" id="notes_${item.id}">${storedNotes}</textarea>`;
	}

	function generateHistoryContent(metadata) {
		let content = "";
		["history", "concat_history"].forEach((type) => {
			if (!metadata[type]) return;
			content += `<span class="${
				type === "history" ? "song_parts" : "song_concats"
			}">`;
			metadata[type].forEach((item, i) => {
				content += generateLink(item, type, i);
			});
			content += "</span>";
		});
		return content;
	}

	async function updatePopupContent(url) {
		popup.innerHTML = "";

		const songId = url.split("/").pop();
		const songData = await idbGetItem("song_data_" + songId);

		var songMeta = generateMetadataContent(songData, false);


        
		popup.innerHTML = `<iframe src="${url}" frameborder="0" style="width:100%; height:100%"></iframe>`;

		popup.style.display = "block";

		const songDataDiv = document.createElement("div");

		songDataDiv.classList.add("PopupSongDataDiv");
		songDataDiv.classList.add("chirp-tweaks-div");

		if (songMeta.includes("song_parts") || songMeta.includes("song_concats")) {
			songDataDiv.innerHTML = `<div><a href="${url}" target="_blank">Song Link</a></div><br> <h2>Continued From Times:</h2>${songMeta}`;
		} else {
			songDataDiv.innerHTML = `<div><a href="${url}" target="_blank">Song Link</a></div><br> ${songMeta}`;
		}

		popup.appendChild(songDataDiv);

		document
			.querySelector(`#notes_${songData.id}`)
			.addEventListener("change", async function () {
				await setCompressedItem(`song_notes_${songData.id}`, this.value);
			});
	}
	function injectDataTable() {
		const notify = document.createElement("script");
		notify.src = `https://cdn.jsdelivr.net/npm/notyf@3/notyf.min.js`;
		document.head.appendChild(notify);

		const notyfCss = document.createElement("link");
		notyfCss.rel = "stylesheet";
		notyfCss.href = "https://cdn.jsdelivr.net/npm/notyf@3/notyf.min.css";
		document.head.appendChild(notyfCss);

		notify.onload = () => {
			notyf = new Notyf({
				duration: 4000,
				position: {
					x: "left",
					y: "top",
				},
				types: [
					{
						type: "info",
						background: "green",
						dismissible: true,
						color: "black",
					},
				],
			});

			const dataTableScript = document.createElement("script");
			dataTableScript.src =
				"https://cdn.jsdelivr.net/npm/simple-datatables@latest";
			document.head.appendChild(dataTableScript);

			dataTableScript.onload = () => {
				populateDataTable();
                addCharacterCounter();
			};
		};
	}

	async function populateDataTable() {
		const searchContainer = document.createElement("div");
		searchContainer.id = "songSearchContainer";
		searchContainer.innerHTML = `<table id="songDataTable"></table>`;
		document.body.insertBefore(searchContainer, document.body.firstChild);

		const db = await dbPromise;
		const tx = db.transaction("songs", "readonly");
		const store = tx.objectStore("songs");
		const songsArray = [];

		const request = store.openCursor();

		notyf.open({
			type: "info",
			message: `Loading Clips...`,
		});

		request.onsuccess = async (e) => {
			const cursor = e.target.result;
			if (cursor) {
				if (cursor.key.startsWith("song_data_")) {
					const song = JSON.parse(cursor.value);

					if (
						song.model_name !== undefined 
						&& (song.metadata !== undefined)
						// && !song.model_name.includes("bark")
					) {
						var prompt = song.metadata.prompt;

						if (prompt !== null && prompt.length > 500) {
							prompt = prompt.substring(0, 500) + "...";
						}

						var media_link = "";

						if (song.video_url !== null && song.video_url !== "") {
							if (!song.video_url.endsWith("None.mp4")) {
								media_link = song.video_url;
								//media_link = `onclick="playMedia('${media_link}')"`
							} else if (!song.audio_url.endsWith("None.mp3")) {
								media_link = song.audio_url;
								// media_link = `onclick="playMedia('${media_link}')"`
							}
						}

						var html_image_url = "";

						if (
							song.image_url !== null &&
							song.image_url !== "" &&
							song.image_url.endsWith("png")
						) {
							html_image_url = `<img src="${song.image_url}">`;
						} else {
							html_image_url = `<img src="https://via.placeholder.com/40">`;
						}

						html_media_link = `<a class="m_link" href="${media_link}" target="_blank">${html_image_url}</a>`;

						title = song.title;
						title = title.replace(/</g, "");
						title = title.replace(/>/g, "");

						if (title === null || title === "") {
							title = "Untitled";
						}
						linked_title = `<a class="s_link" href="https://suno.com/song/${song.id}" target="_blank">${title}</a>`;

						const storedNotes =
							getDecompressedItem(`song_notes_${song.id}`) || "";

						var song_part = song.metadata.history
							? song.metadata.history.length + 1
							: 1;

						var is_full = "x";



						if (
							song_part === 1 &&
							song.metadata.concat_history !== null &&
							song.metadata.concat_history.length > 0
						) {
							is_full = `F-${song.metadata.concat_history.length}`;
						}

                        if (song.metadata.type === "upload") {
                            is_full = "UP💾";
                        }

               
						var song_is_liked = "x";
						if (
							song.reaction !== null &&
							song.reaction.reaction_type !== null
						) {
							song_is_liked = song.reaction.reaction_type === "L" ? "U👍" : "D👎";
                            // song_is_liked = song.reaction.reaction_type === "L" ? "U" : "D";
						}

						var user_id = song.user_id;

                        var display_name = " ";
                        if (song.display_name !== null && song.display_name !== "") {

                        display_name = song.display_name;
                        display_name = display_name.replace(/\s/g, '');
                        display_name = display_name.substring(0, 3);
                        }
         
         
 

            



                        // var user_page_link = `https://suno.com/@${display_name}`;
                        // var user_link = `<a href="${user_page_link}" target="_blank">${display_first_three}</a>`;

                        var model_version = song.major_model_version;
                        if (song.metadata.type === "upload") {
                            model_version = "UP💾";
                        }
						const songObject = {
							"": html_media_link,
							"Title 🔗": linked_title,
							Style: song.metadata.tags || "",
							Lyrics: prompt || "",

							Notes: storedNotes,
							Model: model_version,
							Dur: formatDuration(song.metadata.duration),
							Created: song.created_at,
							Part: song_part,
							Full: is_full,
							"▶️s": song.play_count || 0,
							"👍": song_is_liked,
							"🌐": song.is_public ? "P🌐" : "x",
							"👍s": song.upvote_count,
							U: display_name,
							// "🗑️": song.is_trashed ? "🗑️" : "", // Suno updated the site, now have to index differently
						};

						songsArray.push(songObject);
					}
                    else {
                        // console.log("Skipping item:", song);
                    }
					totalClips++;
					cursor.continue();
				} else {
					cursor.continue();
				}
			} else {
				const songsJson = JSON.stringify(songsArray);

				const convertedData = simpleDatatables.convertJSON({
					data: songsJson,
				});
				const dataTable = new window.simpleDatatables.DataTable(
					"#songDataTable",
					{
						data: convertedData,
						labels: {
							placeholder: "Search All...",
							searchTitle: "Search within table",
							pageTitle: "My Title",
							perPage: "clips per page",
							noRows: "No clips found",
							info: "Showing {start} to {end} of {rows} clips",
							noResults: "No results match your search query",
						},
						template: (options) => `<div class='${
							options.classes.top
						} fixed-table-toolbar'>
                    ${
											options.paging && options.perPageSelect
												? `<div class='${options.classes.dropdown} bs-bars float-left'>
                    <label>
                        <select class='${options.classes.selector}'></select>
                    </label>
                    </div><div id="scan_button">

                    <button class="btn btn-primary">Suno Search 🐦</button>
                    </div>`
												: ""
										}
                    ${
											options.searchable
												? `<div class='${options.classes.search} float-right search btn-group'>
                    <input class='${options.classes.input} form-control search-input' placeholder='Search Everything' type='search' title='Search within table'>
                    </div>`
												: ""
										}
                    </div>
                    <div class='${options.classes.container}'${
							options.scrollY.length
								? ` style='height: ${options.scrollY}; overflow-Y: auto;'`
								: ""
						}></div>
                    <div class='${options.classes.bottom}'>
                    ${
											options.paging
												? `<div class='${options.classes.info}'></div>`
												: ""
										}
                    <nav class='${options.classes.pagination}'></nav>
                    </div>`,
						columns: [
							{ select: 0, sortable: false, searchable: false },

							{ select: 1, sortable: true, cellClass: "song_cell" },

							{ select: 2, type: "string", sortable: true, cellClass: "st" },
							{ select: 3, type: "string", sortable: true, cellClass: "pr" },
							{ select: 6, type: "string", sortable: true, cellClass: "dt" },
							{
								select: 7,
								type: "date",
								format: "ISO_8601",
								cellClass: "date",
								sortable: true,
								sort: "desc",
							},
						],
						fixedColumns: true,
						rowRender: (row, tr, _index) => {
							if (!row.selected) {
								return;
							}
							if (!tr.attributes) {
								tr.attributes = {};
							}
							if (!tr.attributes.class) {
								tr.attributes.class = "";
							}
							tr.attributes.class += " selected";
							return tr;
						},
						tableRender: (_data, table, type) => {
							if (type === "print") {
								return table;
							}
							const tHead = table.childNodes[0];

							const filterHeaders = {
								nodeName: "TR",
								childNodes: tHead.childNodes[0].childNodes.map(
									(_th, index) => ({
										nodeName: "TH",
										childNodes: [
											{
												nodeName: "INPUT",
												attributes: {
													class: `datatable-input search_${index}`,
													type: "search",
													"data-columns": `[${index}]`,
												},
											},
										],
									})
								),
							};
							tHead.childNodes.push(filterHeaders);
							return table;
						},
					}
				);

				const topDiv = searchContainer.querySelector(".datatable-top");

				topDiv.addEventListener("click", function () {
					searchContainer.classList.toggle("expanded");
				});

				if (!popup) {
					popup = document.createElement("div");
					popup.id = "songPreviewPopup";
					Object.assign(popup.style, {
						display: "none",
					});
					document.body.appendChild(popup);
				}

				document.addEventListener("click", function (e) {
					if (e.target.closest(".song_cell")) {
						e.preventDefault();

						document.querySelectorAll("tr.selected").forEach((row) => {
							row.classList.remove("selected");
						});

						const songCell = e.target.closest(".song_cell");
						const songLink = songCell.querySelector("a.s_link").href;

						const row = songCell.closest("tr");
						row.classList.add("selected");

						updatePopupContent(songLink);
					} else if (!e.target.closest("#songPreviewPopup")) {
						popup.style.display = "none";
					}
				});

				if (totalClips > 0) {
					notyf.open({
						type: "info",
						message: `Loaded ${totalClips} Clips. (Browse recent library pages to update.)`,
					});
				} else {
					notyf.open({
						type: "info",
						message: `No clips found. To index clips, click through your library pages one time. Then reload this search.`,
					});
				}
			}

			request.onerror = (e) => {
				console.error("Error reading data from IndexedDB:", e.target.error);
			};
		};
	}

	function generateLink(item, type, index) {
		var historyItem = item.id || item;

        const is_upload = historyItem.startsWith("m_");
        if (is_upload) {
            historyItem = historyItem.substring(2);
        }

		const continueAt = formatContinueAt(item.continue_at);
		const styleClass =
			historyItem[historyItem.length - 2] === "_"
				? `${type}_part_broken` // V2 clip history with _0 or _1 requires searching all songs to find the actual web link, probably not worth 
				: `${type}_part`;

		var letter = type.charAt(0).toUpperCase();
        if (is_upload) {
            letter = "U";
        }
        else {
		if (letter === "H") {
			letter = "P";
		}
    }
		return `<span class="css-1mkx5w1"><a href="/song/${historyItem}/" class="${styleClass}">${letter} ${
			index + 1
		} ${continueAt}</a></span>`;
	}

	function formatDuration(duration) {
		return duration === null ? "" : `${Math.round(duration * 10) / 10}s`;
	}

	function formatContinueAt(continueAt) {
		if (isNaN(continueAt) || continueAt === null) return "";
		return `@${Math.round(continueAt * 10) / 10}s`;
	}

	// TODO: Can override Suno wavform or visuallization? Some js based DAW to plug in?
	/*

    window.onclick = function (event) {
    const modal = document.getElementById("videoModal");
    if (event.target == modal) {
        modal.style.display = "none";
        modal.querySelector(".modal-content").innerHTML = ""; 
    }
};

    const script = document.createElement("script");
    script.innerHTML = `
    function playMedia(mediaUrl) {
      const modal = document.getElementById("videoModal");
      const modalContent = document.querySelector(".modal-content");
    
      modalContent.innerHTML = '<span class="close">&times;</span>'; 
    
      const player = document.createElement('video');
      player.setAttribute('controls', '');
    
      const source = document.createElement('source');
      source.setAttribute('src', mediaUrl);
      source.setAttribute('type', 'video/mp4');
    
      player.appendChild(source);
      modalContent.appendChild(player);
    
      modal.style.display = "block";
    
      modalContent.querySelector('.close').onclick = function() {
        modal.style.display = "none";
        player.pause(); 
        modalContent.innerHTML = ''; 
      }
    
      player.play();
    }
    
    window.onclick = function(event) {
      const modal = document.getElementById("videoModal");
      if (event.target == modal) {
        modal.style.display = "none";
        modal.querySelector(".modal-content").innerHTML = '';
      }
    }
    `;
    document.head.appendChild(script);
  
    function setupModal() {
      if (document.getElementById("videoModal")) {

        return;
      }
    
      const modal = document.createElement('div');
      modal.id = "videoModal";
      modal.classList.add("modal");
    
      const modalContent = document.createElement('div');
      modalContent.classList.add("modal-content");
    
      const closeBtn = document.createElement('span');
      closeBtn.classList.add("close");
      closeBtn.innerHTML = "&times;";
      closeBtn.onclick = function() {
        modal.style.display = "none";
        modalContent.innerHTML = '<span class="close">&times;</span>';
      };
    
      modalContent.appendChild(closeBtn);
      modal.appendChild(modalContent);
      document.body.appendChild(modal);
    
      window.onclick = function(event) {
        if (event.target == modal) {
          modal.style.display = "none";
          modalContent.innerHTML = '<span class="close">&times;</span>'; 
        }
      };
    }
    
    setupModal();
    */


	injectDataTable();

	const style = document.createElement("style");
	style.innerHTML = `

  .chirp-tweaks-div {
    position: relative;
    left: 40px;
    top: -8px;
  }
    

              
  .song_play_count, .song_duration {
    float: left;
}
.chirp-tweaks-div .notes_p {
    margin-right: 100px;
    max-width: 75%;
    min-width: 50%;
    float: left;
}


.template-container {
    position: fixed;
    top: 10px;
    right: 10px;
    z-index: 1000;
    padding: 10px;
}

.template-container.style {
    top: 450px !important;
}
.template-container button {
    margin-bottom: 3px;
    background-color: #007BFF;
    color: white;
    border: none;
    border-radius: 5px;
    padding: 2px;
    cursor: pointer;
}

.template-container button.random,
.template-container button.sequence {
    margin-right: 5px;
    padding: 10px;
    display: inline;
}

.template-container button.random {
    background-color: #28a745;
}

.template-container button.sequence {
    background-color: #17a2b8;
}

.template-container textarea {
    width: 300px;
    height: 300px;
    display: block;
    padding: 10px;
}


        .song_play_count.zero_play_count {
            color: green;
            font-weight: bold;
        }
        .song_play_count  {
            padding-right: 6px;
            color: #87abff;
            min-width: 30px;
            font-weight: bold;
        }

        .song_duration.zero_play_count {
                    color: #ff0000;
        
        }

        .song_p {
            min-width: 150px;
        }


        .processed-item {

            display: block;
        clear: left;
        }
        

        .song_created {
            font-size: 14px;
            position: fixed;
            color: #ff8400;
            right: 55px;
            top: -67px;
            position: absolute;
        }
        .song_parts .song_part {
            background: rgb(63, 69, 99);
        }
        .song_concats .concat_history_part {
            margin-top: 0px;
        }
        .song_concats a.concat_history_part:hover {
            background: #000000;
        
        }
        .history_part_broken, .concat_history_part_broken {
            background: #000000;
        }
        textarea.song_notes {
            border: 1px dashed rgb(247 228 143 / 48%);
            width: 40%;
            padding: 2px 6px;
            overflow-y: hidden;
            height: 30px;
            max-height: 160px;
            color: #ffffff;
            display: block;
            clear: both;
            top: -62px;
            position: absolute;
            left: 416px;
            opacity: 40%;

        }
        textarea.song_notes.has_note, textarea.song_notes:focus {
        opacity: 100%;
  
        }
        .PopupSongDataDiv .song_duration {
            display: none;

        }
        .PopupSongDataDiv textarea.song_notes {
            width: 180px;
    height: 160px;
    position: static;
        }
        .PopupSongDataDiv.chirp-tweaks-div {
            left: 0px;
            top: 150px;
        }

        .song_p {
            float: left;
            margin-right: 25px;
            }

            .prompt_p {
                display: none;
                margin-right: 25px;
                align: left;
                clear: both;
            }  



            .datatable-wrapper.no-header .datatable-container {
                border-top: 1px solid #d9d9d9;
            }
            
            .datatable-wrapper.no-footer .datatable-container {
                border-bottom: 1px solid #d9d9d9;
            }
            
            .datatable-top,
            .datatable-bottom {
                padding: 1px 6px;
            }
            
            .datatable-top > nav:first-child,
            .datatable-top > div:first-child,
            .datatable-bottom > nav:first-child,
            .datatable-bottom > div:first-child {
                float: left;
            }
            
            .datatable-top > nav:last-child,
            .datatable-top > div:not(first-child),
            .datatable-bottom > nav:last-child,
            .datatable-bottom > div:last-child {
                float: right;
            }
            .datatable-bottom > nav:last-child.datatable-pagination {
                float: left;
            margin-left: 50px;

            }
            .datatable-selector {
                padding: 6px;
            }
            
            .datatable-input {
                padding: 6px 12px;
            }
            
            .datatable-info {
                margin: 7px 0;
            }
            
            .datatable-pagination ul {
                margin: 0;
                padding-left: 0;
            }
            
            .datatable-pagination li {
                list-style: none;
                float: left;
            }
            
            .datatable-pagination li.datatable-hidden {
                visibility: hidden;
            }
            
            .datatable-pagination a,
            .datatable-pagination button {
                border: 1px solid transparent;
                float: left;
                margin-left: 2px;
                padding: 6px 12px;
                position: relative;
                text-decoration: none;
                color: #333;
                cursor: pointer;
            }
            
            .datatable-pagination a:hover,
            .datatable-pagination button:hover {
                background-color: #d9d9d9;
            }
            
            .datatable-pagination .datatable-active a,
            .datatable-pagination .datatable-active a:focus,
            .datatable-pagination .datatable-active a:hover,
            .datatable-pagination .datatable-active button,
            .datatable-pagination .datatable-active button:focus,
            .datatable-pagination .datatable-active button:hover {
                background-color: #d9d9d9;
                cursor: default;
            }
            
            .datatable-pagination .datatable-ellipsis a,
            .datatable-pagination .datatable-disabled a,
            .datatable-pagination .datatable-disabled a:focus,
            .datatable-pagination .datatable-disabled a:hover,
            .datatable-pagination .datatable-ellipsis button,
            .datatable-pagination .datatable-disabled button,
            .datatable-pagination .datatable-disabled button:focus,
            .datatable-pagination .datatable-disabled button:hover {
                pointer-events: none;
                cursor: default;
            }
            
            .datatable-pagination .datatable-disabled a,
            .datatable-pagination .datatable-disabled a:focus,
            .datatable-pagination .datatable-disabled a:hover,
            .datatable-pagination .datatable-disabled button,
            .datatable-pagination .datatable-disabled button:focus,
            .datatable-pagination .datatable-disabled button:hover {
                cursor: not-allowed;
                opacity: 0.4;
            }
            
            .datatable-pagination .datatable-pagination a,
            .datatable-pagination .datatable-pagination button {
                font-weight: bold;
            }
            
            .datatable-table {
                max-width: 100%;
                width: 100%;
                border-spacing: 0;
                border-collapse: separate;
            }
            .datatable-table a {
            color: #2cf561;
            font-weight: bold;
            }

            .datatable-table > tbody > tr > td,
            .datatable-table > tbody > tr > th,
            .datatable-table > tfoot > tr > td,
            .datatable-table > tfoot > tr > th,
            .datatable-table > thead > tr > td,
            .datatable-table > thead > tr > th {
                vertical-align: top;
                padding: 8px 10px;
            }
            
            .datatable-table > thead > tr > th {
                vertical-align: bottom;
                text-align: left;
                border-bottom: 1px solid #d9d9d9;
            }
            
            .datatable-table > tfoot > tr > th {
                vertical-align: bottom;
                text-align: left;
                border-top: 1px solid #d9d9d9;
            }
            
            .datatable-table th {
                vertical-align: bottom;
                text-align: left;
            }
            
            .datatable-table th a {
                text-decoration: none;
                color: inherit;
            }
            
            .datatable-table th button,
            .datatable-pagination-list button {
                color: inherit;
                border: 0;
                background-color: inherit;
                cursor: pointer;
                text-align: inherit;
                font-weight: inherit;
                font-size: inherit;
            }
            
            .datatable-sorter, .datatable-filter {
                display: inline-block;
                height: 100%;
                position: relative;
                width: 100%;
            }
            
            .datatable-sorter::before,
            .datatable-sorter::after {
                content: "";
                height: 0;
                width: 0;
                position: absolute;
                right: 4px;
                border-left: 4px solid transparent;
                border-right: 4px solid transparent;
                opacity: 0.2;
            }
            
            
            .datatable-sorter::before {
                border-top: 4px solid #000;
                bottom: 0px;
            }
            
            .datatable-sorter::after {
                border-bottom: 4px solid #000;
                border-top: 4px solid transparent;
                top: 0px;
            }
            
            .datatable-ascending .datatable-sorter::after,
            .datatable-descending .datatable-sorter::before,
            .datatable-ascending .datatable-filter::after,
            .datatable-descending .datatable-filter::before {
                opacity: 0.6;
            }
            
            .datatable-filter::before {
                content: "";
                position: absolute;
                right: 4px;
                opacity: 0.2;
                width: 0;
                height: 0;
                border-left: 7px solid transparent;
                border-right: 7px solid transparent;
                border-radius: 50%;
                border-top: 10px solid #000;
                top: 25%;
            }
            
            .datatable-filter-active .datatable-filter::before {
                opacity: 0.6;
            }
            
            .datatable-empty {
                text-align: center;
            }
            
            .datatable-top::after, .datatable-bottom::after {
                clear: both;
                content: " ";
                display: table;
            }
            
            table.datatable-table:focus tr.datatable-cursor > td:first-child {
                border-left: 3px blue solid;
            }
            
            table.datatable-table:focus {
                outline: solid 1px black;
                outline-offset: -1px;
            }

            .datatable-table > thead > tr > th {
                vertical-align: bottom;
                text-align: left;
                border-bottom: 1px solid #d9d9d9;
            }
            input.search_0 {
                visibility: hidden;
                width: 40px;
            } 
            body .datatable-input {
                padding: 3px 6px;
            }

            input.search_1, input.search_2, input.search_3 {
                width: 100%;
            } 

            input.search_5, input.search_6, input.search_8, input.search_9, input.search_10, input.search_11, input.search_12, input.search_13, input.search_14,  input.search_15    {
  
                width: 45px;
            } 
            td.date {
              font-size: 80%;
              max-width: 100px;
          }

            td.song_cell {
            white-space: nowrap;
            overflow: hidden;
                font-size: 80%;
                 max-width: 250px;
}

          body td.pr {

            max-width: 350px; 
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            transition: max-width 0.3s ease;
          
          }

          body td.st {

            max-width: 275px; 
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            transition: max-width 0.3s ease;
          
          }


          .char-count {
            position: absolute;
            left: 240px;
            top: 50px;
            color: #ff8400;

          }

          
#songSearchContainer .datatable-wrapper {
  transition: max-height 0.3s ease-out;
  overflow: hidden;
  max-height: 20px; 
}

#songSearchContainer.expanded .datatable-wrapper {
  max-height: 100%; 
}
#songSearchContainer {
    font-size: 90%;
    
        
    }
    td.song_cell:hover {
        background-color: #ffeb3b91;
        cursor: help;
    }
    .model_name {
        color: #ff8400;
    }

    .PopupSongDataDiv a {
 
        background-color: rgb(188 113 2);
        font-size: 12px;
        padding: 5px;
        color: #f5f5f5;
        font-weight: bold;
        border-radius: var(--chakra-radii-md);
     }
     .PopupSongDataDiv .song_parts {
         clear: both;
         display: block;
         margin-top: 20px;
         margin-bottom: 20px;
     }
     .PopupSongDataDiv .song_concats {
             margin-top: 20px;
             margin-bottom: 20px;
         clear: both;
         display: block;
     }
     .PopupSongDataDiv {
         padding: 5px;
         margin: 15px;
         position: absolute;

     }

     .datatable-wrapper   tr {
        cursor: pointer;
    }

    .datatable-wrapper    tr.selected {
        background-color: #ffeb3b4d;
    }
    .PopupSongDataDiv h2 {

        font-weight: bold;
        color: #FF9800;
    }


    #songPreviewPopup {
      position: fixed;
      top: 20px;
      right: 20px;
      width: 750px;
      height: 80%;
      border: 1px solid black;
      z-index: 1000;
      overflow: hidden;
    }

    a.m_link {
      cursor: cell;
    }

    .datatable-top {
      cursor: n-resize;
    }

    .modal {
      display: none;
      position: fixed;
      z-index: 1;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      overflow: auto;
      background-color: rgb(0,0,0,0.4);
    }
    
    .modal-content {
      margin: auto;
      padding: 20px;
      width: 500px;
    }
    

    .close {
      color: #aaa;
      float: right;
      font-size: 28px;
      font-weight: bold;
    }
    
    .close:hover,
    .close:focus {
      color: black;
      text-decoration: none;
      cursor: pointer;
    }

    .m_link img {

      width: 40px;
      height: 40px;
      }
      
      
#songDataTable tr th {
    font-size: 120%;
    color: #FF9800;
    font-weight: bold;
}
#scan_button {
    float: left;
    margin-left: 40px;
}

.notyf__message {
    width: 700px !important;
}
    `;
	document.head.appendChild(style);
})();
