# Suno Music Tweaks 

Little one-off scripts I wrote for myself I may as well share. 

1. Audio Visualizer Chrome Extension
2. UI Tweak Bookmarket: add custom notes to each track, direct song part links, create data and duration metadata.

## 1. Chrome Extension Audio Visualizer for Suno's Chirp [Music AI](https://app.suno.ai/)

"I wonder if I can get a Chirp visualizer working in less than an hour..." 

![image](https://github.com/JonathanFly/chirp-studio/assets/163408/22398352-00f7-4153-b4d9-3737211752bb)

## Install
1. Download zip https://github.com/JonathanFly/chirp-studio/releases
2. Extract files
3. Chrome -> Extensions -> Load Unpacked -> Pick folder "chirp-studio-chrome-extension"
   
https://github.com/JonathanFly/chirp-studio/assets/163408/914813b2-fd1f-431e-8b5a-f0e70c2a7376

Might have to refresh on the Chirp site, there's no proper load order code. Just a big blob of javasscript.

## 2. Jonathan's Janky Chirp UI Tweaks 

Bit of code to make it easier to deal with large Chirp libraries.

1. Show song creation date and song duration.
2. Directly link to the previous clips making up a full song.
3. Add custom user notes to any song.

![chirp_tweaks](https://github.com/JonathanFly/chirp-studio/assets/163408/128662ab-ea80-4629-9b12-adb4f6f2fe3e)

## How to use this bookmarket
1. Pick "Add New Bookmark" in Booksmarks Manager (or "Add Page" in the bookmark bar)
2. **Bookmark Name:** "Chirp Tweaks" (whatever name you want)
3. **Bookmark URL:** copy the block of code below that starts with "javascript" including the word javascript. 
4. On Chirp website, click this newly added bookmark link. Then navigate through your library, after the page loads, the script will add the extra metadata to each song. You will have to click the bookmark each new time you go to the site, but any notes added to songs will persist.

This is just a big yarn ball of javascript on a timer, but it does work on my system. 


```
javascript:(function()%7B(function()%20%7B%0A%20%20%20%20const%20originalFetch%20%3D%20window.fetch%3B%0A%0A%20%20%20%20window.fetch%20%3D%20function()%20%7B%0A%20%20%20%20%20%20%20%20return%20originalFetch.apply(this%2C%20arguments).then(response%20%3D%3E%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20(response.url.includes('api%2Ffeed'))%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20return%20response.clone().json().then(json%20%3D%3E%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20setTimeout(()%20%3D%3E%20%7B%20%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20json.forEach(item%20%3D%3E%20%7B%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20console.log(%60%24%7Bitem.id%7D%60)%3B%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20const%20linkSelector%20%3D%20%60a.chakra-link%5Bhref%3D%22%2Fsong%2F%24%7Bitem.id%7D%2F%22%5D%60%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20var%20linkElement%20%3D%20document.querySelector(linkSelector)%3B%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20if%20(linkElement%20%26%26%20!linkElement.classList.contains('processed-item'))%20%7B%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20var%20parentElement%20%3D%20linkElement.parentElement%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20var%20targetDiv%20%3D%20parentElement.parentElement.parentElement.parentElement.parentElement%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20var%20buttonDiv%20%3D%20parentElement.parentElement.parentElement.parentElement%3B%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20var%20parentDiv%20%3D%20parentElement%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20if%20(parentDiv)%20%7B%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20linkElement.classList.add('processed-item')%3B%0A%0A%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%2F*%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20const%20collapseBtn%20%3D%20document.createElement('button')%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20collapseBtn.innerText%20%3D%20'hide%E2%99%BB%EF%B8%8F'%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20collapseBtn.classList.add('collapse-btn')%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20collapseBtn.addEventListener('click'%2C%20function()%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20const%20isCollapsed%20%3D%20targetDiv.classList.toggle('collapsed')%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20localStorage.setItem(%60song_collapse_state_%24%7Bitem.id%7D%60%2C%20isCollapsed)%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D)%3B%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20const%20savedCollapseState%20%3D%20localStorage.getItem(%60song_collapse_state_%24%7Bitem.id%7D%60)%20%3D%3D%3D%20'true'%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20if%20(savedCollapseState)%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20targetDiv.classList.add('collapsed')%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20targetDiv.insertBefore(collapseBtn%2C%20targetDiv.firstChild)%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20*%2F%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20const%20dateElement%20%3D%20document.createElement('span')%3B%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20var%20history%20%3D%20item.metadata.history%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20var%20concat_history%20%3D%20item.metadata.concat_history%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20var%20audio_prompt_id%20%3D%20item.metadata.audio_prompt_id%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20var%20historyContent%20%3D%20''%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20var%20some_history%20%3D%20%5B%5D%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20if%20(Boolean(history))%20%7B%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20some_history%20%3D%20some_history.concat(history)%3B%0A%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20if%20(Boolean(concat_history))%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20some_history%20%3D%20some_history.concat(concat_history)%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20if%20(Boolean(some_history))%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20for%20(var%20i%20%3D%20some_history.length-1%3B%20i%20%3E%3D%200%3B%20i--)%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20var%20historyItem%20%3D%20some_history%5Bi%5D%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20var%20historyItemElement%20%3D%20document.createElement('span')%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20var%20styleb%20%3D%20%22background%3A%20rgb(63%2C%2069%2C%2099)%3B%22%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20if%20(historyItem%5BhistoryItem.length-2%5D%20%3D%3D%3D%20%22_%22)%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20styleb%20%3D%20%22background%3A%20%23000000%3B%22%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20historyContent%20%2B%3D%20%60%3Ca%20href%3D%22%2Fsong%2F%24%7BhistoryItem%7D%2F%22%20class%3D%22css-18etihr%22%20style%3D%22%24%7Bstyleb%7D%22%3EPart%20%24%7Bi%2B1%7D%3C%2Fa%3E%20%60%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20var%20duration%20%3D%20item.metadata.duration%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20if%20(duration%20%3D%3D%3D%20null)%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20duration%20%3D%20'Full%20Song'%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20else%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20duration%20%3D%20%60%24%7Bduration%7Ds%60%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20var%20storedNotes%20%3D%20localStorage.getItem(%60song_notes_%24%7Bitem.id%7D%60)%20%7C%7C%20''%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20var%20notesInput%20%3D%20%60%3Ctextarea%20style%3D%22border%3A%202px%20dashed%20rgb(247%20228%20143%20%2F%2048%25)%3B%20width%3A%2080%25%3B%20padding%3A%200px%205px%3B%20overflow-y%3A%20hidden%3B%20height%3A%2025px%3B%20max-height%3A%20160px%3B%20%20%20%20%20color%3A%20%23f7f0bc%3B%22%20class%3D%22chakra-textarea%20css-ca7733%20songnotes%22%20placeholder%3D%22Your%20song%20notes%20here%22%20id%3D%22notes_%24%7Bitem.id%7D%22%3E%24%7BstoredNotes%7D%3C%2Ftextarea%3E%60%3B%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20dateElement.innerHTML%20%3D%20%60%3Cp%20data-theme%3D%22dark%22%20style%3D%22font-size%3A%2015px%3B%20color%3A%20%23ff0000c7%22%3E%24%7Bduration%7D%20%3Cspan%20style%3D%22font-size%3A%2012px%3B%20color%3A%20%23ff8400%3B%22%3E%24%7Bnew%20Date(item.created_at).toLocaleDateString()%7D%20%24%7Bnew%20Date(item.created_at).toLocaleTimeString()%7D%3C%2Fspan%3E%20%24%7BhistoryContent%7D%20%3C%2Fp%3E%20%3Cp%20data-theme%3D%22dark%22%3E%24%7BnotesInput%7D%3C%2Fp%3E%60%3B%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20parentDiv.insertBefore(dateElement%2C%20parentDiv.firstChild)%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20document.getElementById(%60notes_%24%7Bitem.id%7D%60).addEventListener('change'%2C%20function()%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20localStorage.setItem(%60song_notes_%24%7Bitem.id%7D%60%2C%20this.value)%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D)%3B%0A%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D)%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%2C%201500)%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20return%20response%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D).catch(error%20%3D%3E%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20console.error('Error%20parsing%20JSON%3A'%2C%20error)%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D)%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20%7D%20else%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20return%20response%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%7D)%3B%0A%20%20%20%20%7D%3B%0A%0A%20%20%20%20%2F%2F%20CSS%20for%20collapsed%20state%0A%20%20%20%20const%20style%20%3D%20document.createElement('style')%3B%0A%20%20%20%20style.innerHTML%20%3D%20%60%0A%20%20%20%20%20%20%20%20.collapsed%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20padding%3A%200%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20margin%3A%200%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20height%3A%2022px%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20overflow%3A%20hidden%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20vertical-align%3A%20top%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20flex-direction%3A%20column-reverse%3B%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%60%3B%0A%20%20%20%20document.head.appendChild(style)%3B%0A%7D)()%3B%7D)()%3B
```
