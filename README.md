# chirp-studio

## Chrome Extension Audio Visualizer for Suno's Chirp [Music AI](https://app.suno.ai/)


"I wonder if I can get a Chirp visualizer working in less than an hour..." 

![image](https://github.com/JonathanFly/chirp-studio/assets/163408/22398352-00f7-4153-b4d9-3737211752bb)

## Install
1. Download zip https://github.com/JonathanFly/chirp-studio/releases
2. Extract files
3. Chrome -> Extensions -> Load Unpacked -> Pick folder "chirp-studio-chrome-extension"
   
https://github.com/JonathanFly/chirp-studio/assets/163408/914813b2-fd1f-431e-8b5a-f0e70c2a7376

Might have to refresh on the Chirp site, there's no proper load order code. Just a big blob of javasscript.

## Chirp Song Creation Dates Bookmarklet

Useful bit of code I had lying around after going crazy trying to find old songs in my library.

![chirp_dates](https://github.com/JonathanFly/chirp-studio/assets/163408/5a4891e0-aa22-4a35-aab7-6d13a030d873)

1. Pick "Add New Bookmark" in Booksmarks Manager (or "Add Page" in the bookmark bar)
2. **Bookmark Name:** Show Chirp Dates (or whatever name you want)
3. **Bookmark URL:** copy the block of code below that starts with "javascript"
4. On Chirp website, click this newly added bookmark, then prev or next button in library. You will have to click the bookmark each new time you go to the site.


```
javascript:(function()%7B(function()%20%7B%0A%20%20%20%20const%20originalFetch%20%3D%20window.fetch%3B%0A%0A%20%20%20%20window.fetch%20%3D%20function()%20%7B%0A%0A%20%20%20%20%20%20%20%20return%20originalFetch.apply(this%2C%20arguments).then(response%20%3D%3E%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20(response.url.includes('api%2Ffeed'))%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20return%20response.clone().json().then(json%20%3D%3E%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20setTimeout(()%20%3D%3E%20%7B%20%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20json.forEach(item%20%3D%3E%20%7B%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20const%20linkSelector%20%3D%20%60a%5Bhref%3D%22%2Fsong%2F%24%7Bitem.id%7D%2F%22%5D%60%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20const%20linkElement%20%3D%20document.querySelector(linkSelector)%3B%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20const%20parentElement%20%3D%20linkElement.parentElement%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20if%20(linkElement)%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20const%20parentDiv%20%3D%20parentElement.closest('.chakra-stack')%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20if%20(parentDiv)%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20const%20dateElement%20%3D%20document.createElement('span')%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20dateElement.classList.add('chirp_date')%3B%20%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20dateElement.innerHTML%20%3D%20%60%3Cp%20data-theme%3D%22dark%22%20style%3D%22font-size%3A%2090%25%3B%20font-weight%3A%20bold%3B%20color%3Argb(200%2C%20181%2C%2073)%3B%22%3E%24%7Bnew%20Date(item.created_at).toLocaleDateString()%7D%3C%2Fp%3E%60%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20parentDiv.insertBefore(dateElement%2C%20parentDiv.firstChild)%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D)%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%2C%201000)%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20return%20response%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D).catch(error%20%3D%3E%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20console.error('Error%20parsing%20JSON%3A'%2C%20error)%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D)%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20%7D%20else%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20return%20response%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%7D)%3B%0A%20%20%20%20%7D%3B%0A%7D)()%3B%7D)()%3B
```
