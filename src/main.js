let htmlDecode = (input) => {
    let x;
    x = input.replace(/&amp;/gi, '&');
    x = x.replace(/&lt;/gi, '<');
    x = x.replace(/&gt;/gi, '>');
    x = x.replace(/&quot;/gi, '"');
    x = x.replace(/&#39;/gi, "'");
    x = x.replace(/&#039;/gi, "'");
    return x;
}

let side
let newDiv
let titleDiv
let select
let langCode = 'en'
let captionDiv
let captionTracks
let displaySubs = []
let subFontSize = 20
let oldUrl = ""

let getCaptionTracks = async () => {
console.log(window.location.href, "window.location.href")
let response = await fetch(window.location.href)
const data = await response.text();

// Extract title and description from the page data
const titleMatch = data.match(
    /<meta name="title" content="([^"]*|[^"]*[^&]quot;[^"]*)">/
);
const descriptionMatch = data.match(
    /<meta name="description" content="([^"]*|[^"]*[^&]quot;[^"]*)">/
);

const title = titleMatch ? titleMatch[1] : 'No title found';
const description = descriptionMatch
    ? descriptionMatch[1]
    : 'No description found';

// Check if the video page contains captions
if (!data.includes('captionTracks')) {
    console.warn(`No captions found for video:`);
    return {
    title,
    description,
    subtitles: [],
    };
}

// Extract caption tracks JSON string from video page data
const regex = /"captionTracks":(\[.*?\])/;
const regexResult = regex.exec(data);

if (!regexResult) {
    console.warn(`Failed to extract captionTracks from video: `);
    return {
    title,
    description,
    subtitles: [],
    };
}

const [_, captionTracksJson] = regexResult;
const captionTracks = JSON.parse(captionTracksJson);
return captionTracks;
}

// add newDiv
let initializeView = async () => {
newDiv = document.createElement("div")
// newDiv.style.height = player.offsetHeight + "px"
newDiv.id = "subtitle"

titleDiv = document.createElement("div")
titleDiv.style.padding = "10px"
titleDiv.style.height = "40px"

let refreshButton = document.createElement("button")
refreshButton.textContent = "Refresh"
refreshButton.style.float = "right"
refreshButton.style.margin = "5px"
refreshButton.marginTop = "0px"
refreshButton.marginBottom = "10px"
refreshButton.style.padding = "10px"
refreshButton.style.border = "none"
refreshButton.style.backgroundColor = "rgb(240, 240, 240)"

// hover effect
refreshButton.addEventListener("mouseover", function() {
    refreshButton.style.backgroundColor = "lightgray"
})
refreshButton.addEventListener("mouseout", function() {
    refreshButton.style.backgroundColor = "rgb(240, 240, 240)"
})
// round corner
refreshButton.style.borderRadius = "5px"


refreshButton.style.cursor = "pointer"
refreshButton.addEventListener("click", async function() {
    captionTracks = await getCaptionTracks()
    refreshLang(captionTracks)
    refreshCaption(captionTracks, langCode)
    // newDiv.style.height = player.offsetHeight + "px"
    captionDiv.style.height = (player.offsetHeight - 40 - 40) + "px"
})
titleDiv.appendChild(refreshButton)

select = document.createElement("select")
select.style.float = "left"
select.style.margin = "5px"
select.marginTop = "0px"
select.marginBottom = "10px"
select.style.padding = "10px"
select.style.border = "none"
select.style.backgroundColor = "rgb(240, 240, 240)"
select.style.borderRadius = "5px"
select.style.cursor = "pointer"
// set the select option to langCode
select.value = langCode

// hover effect
select.addEventListener("mouseover", function() {
    select.style.backgroundColor = "lightgray"
})
select.addEventListener("mouseout", function() {
    select.style.backgroundColor = "rgb(240, 240, 240)"
})
captionDiv = document.createElement("div")
captionDiv.style.padding = "10px"
captionDiv.style.height = (player.offsetHeight - 40 - 40) + "px"
captionDiv.style.overflow = "auto"
newDiv.appendChild(captionDiv)

// add hide button
let hideButton = document.createElement("button")
hideButton.style.height = "40px"
hideButton.textContent = "Hide"
hideButton.style.float = "right"
hideButton.style.margin = "5px"
hideButton.marginTop = "0px"
hideButton.marginBottom = "10px"
hideButton.style.padding = "10px"
hideButton.style.border = "none"
hideButton.style.backgroundColor = "rgb(240, 240, 240)"
hideButton.style.borderRadius = "5px"
hideButton.style.cursor = "pointer"
hideButton.addEventListener("click", function() {
    if (captionDiv.style.display === "none") {
    captionDiv.style.display = "block"
    } else {
    captionDiv.style.display = "none"
    }
    hideButton.textContent = captionDiv.style.display === "none" ? "Show" : "Hide"
})
titleDiv.appendChild(hideButton)


titleDiv.appendChild(select)
newDiv.appendChild(titleDiv)
side.insertBefore(newDiv, side.firstChild)

// add font size decrease button
let fontSizeDown = document.createElement("button")
fontSizeDown.textContent = "-"
fontSizeDown.style.float = "right"
fontSizeDown.style.margin = "5px"
fontSizeDown.marginTop = "0px"
fontSizeDown.marginBottom = "10px"
fontSizeDown.style.padding = "10px"
fontSizeDown.style.border = "none"
fontSizeDown.style.backgroundColor = "rgb(240, 240, 240)"
fontSizeDown.style.borderRadius = "5px"
fontSizeDown.style.cursor = "pointer"
fontSizeDown.addEventListener("click", function() {
    subFontSize -= 2
    captionDiv.textContent = ""
    refreshCaption(captionTracks, langCode, subFontSize)
})
titleDiv.appendChild(fontSizeDown)

// add font size increase button
let fontSizeUp = document.createElement("button")
fontSizeUp.textContent = "+"
fontSizeUp.style.float = "right"
fontSizeUp.style.margin = "5px"
fontSizeUp.marginTop = "0px"
fontSizeUp.marginBottom = "10px"
fontSizeUp.style.padding = "10px"
fontSizeUp.style.border = "none"
fontSizeUp.style.backgroundColor = "rgb(240, 240, 240)"
fontSizeUp.style.borderRadius = "5px"
fontSizeUp.style.cursor = "pointer"
fontSizeUp.addEventListener("click", function() {
    subFontSize += 2
    captionDiv.textContent = ""
    refreshCaption(captionTracks, langCode, subFontSize)
})
titleDiv.appendChild(fontSizeUp)

captionTracks = await getCaptionTracks()
refreshLang(captionTracks)
refreshCaption(captionTracks, langCode)
}

let getBaseUrl = (captionTracks, lang) => {
for (let i = 0; i < captionTracks.length; i++) {
    if (captionTracks[i].languageCode === lang) {
    return captionTracks[i].baseUrl
    }
}
return null
}

let fetchCaption = async (baseUrl) => {
console.log(baseUrl, "baseurl")
const subtitlesResponse = await fetch(baseUrl);
const transcript = await subtitlesResponse.text();

// Define regex patterns for extracting start and duration times
const startRegex = /start="([\d.]+)"/;
const durRegex = /dur="([\d.]+)"/;

// Process the subtitles XML to create an array of subtitle objects
const lines = transcript
.replace('<?xml version="1.0" encoding="utf-8" ?><transcript>', '')
.replace('</transcript>', '')
.split('</text>')
.filter((line) => line && line.trim())
.reduce((acc, line) => {
    // Extract start and duration times using regex patterns
    const startResult = startRegex.exec(line);
    const durResult = durRegex.exec(line);

    if (!startResult || !durResult) {
    console.warn(`Failed to extract start or duration from line: \${line}`);
    return acc;
    }

    const [, start] = startResult;
    const [, dur] = durResult;

    // Clean up subtitle text by removing HTML tags and decoding HTML entities
    const htmlText = line
    .replace(/<text.+>/, '')
    .replace(/&amp;/gi, '&')
    .replace(/<\/?[^>]+(>|$)/g, '');
    text = htmlDecode(htmlText)

    // Create a subtitle object with start, duration, and text properties
    acc.push({
        start,
        dur,
        text,
    });

    return acc;
}, []);

let ret = {
    title,
    description,
    subtitles: lines,
}
return ret.subtitles
}

let refreshLang = (urls) => {
let selectExist = false
select.textContent = ""
for (let i = 0; i < urls.length; i++) {
    let option = document.createElement("option")
    // set option hover color
    option.style.backgroundColor = "white"
    option.value = urls[i].languageCode
    option.text = urls[i].name.simpleText
    select.appendChild(option)
    if (urls[i].languageCode === langCode) {
        selectExist = true
    }
}
if (!selectExist && urls.length > 0) {
    langCode = urls[0].languageCode
}

select.onchange = function() {
    langCode = select.value
    refreshCaption(captionTracks, langCode)
}
}

let refreshCaption = async (urls, lang, fontSize = 20) => {
let vpp = document.getElementById("movie_player")
displaySubs = null
let baseUrl = getBaseUrl(urls, lang)
console.log(baseUrl)
captionDiv.textContent = ""
if (baseUrl === null) {
    console.warn(`Could not find \${lang} captions for `)
    return
}
displaySubs = await fetchCaption(baseUrl)
console.log(displaySubs, captionDiv)
for (let i = 0; i < displaySubs.length; i++) {
    let childDiv = document.createElement("div")
    childDiv.style.padding = "10px"
    childDiv.style.fontSize = fontSize + "px"
    let newContent = document.createTextNode(displaySubs[i].text)

    // hover effect
    childDiv.style.cursor = "pointer"
    childDiv.style.transition = "background-color 0.3s"
    childDiv.addEventListener("mouseover", function() {
        childDiv.style.backgroundColor = "lightgray"
    })
    childDiv.addEventListener("mouseout", function() {
        childDiv.style.backgroundColor = "white"
    })
    childDiv.appendChild(newContent)
    childDiv.addEventListener("click", function() {
    console.log(displaySubs[i].start, displaySubs[i].dur)
    vpp.seekTo(displaySubs[i].start, true)
    vpp.playVideo()
    })
    captionDiv.appendChild(childDiv) //add the text node to the newly created div
}
}

let refreshId = setInterval(async () => {
    // console.log(document.querySelector("#secondary"), "side")
    if (document.querySelector("#movie_player") != null &&
        document.querySelector("#columns > div:nth-child(2)") != null) {
    setup()
    }
}, 1000)

let setup = async () => {
side = document.querySelector("#columns > div:nth-child(2)")
oldUrl = window.location.href
clearInterval(refreshId)
setInterval(refreshInterval, 1000)
initializeView()
}

let refreshInterval = async () => {
if (oldUrl != window.location.href) {
    oldUrl = window.location.href
    captionTracks = await getCaptionTracks()
    refreshLang(captionTracks)
    refreshCaption(captionTracks, langCode)
    // newDiv.style.height = player.offsetHeight + "px"
    captionDiv.style.height = (player.offsetHeight - 40 - 40) + "px"
}
}