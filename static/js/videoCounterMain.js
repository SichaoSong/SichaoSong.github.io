// eslint settings
/* UIkit */

/* インタフェース関連 */
const open = document.getElementById('open')
const read = document.getElementById('read')
const save = document.getElementById('save')
const video = document.getElementById('video').querySelector('video')
const btnPlay = document.getElementById('btn_play')
const btnForward = document.getElementById('btn_forward')
const btnForwardBadge = btnForward.querySelector('.uk-badge')
const btnBackward = document.getElementById('btn_backward')
const btnBackwardBadge = btnBackward.querySelector('.uk-badge')
const btnForward10s = document.getElementById('btn_forward10s')
const btnBackward10s = document.getElementById('btn_backward10s')
/* 内部制御関連 */
let forwardRate = 1
let backwardRate = 1
let videoName = ''
let isNewVideo = true
let shiftFlag = false
let readFile = []
let results = []
let newResult = true

open.addEventListener('change', (e) => {
  init()
  const url = URL || webkitURL
  const file = e.target.files[0]
  video.src = url.createObjectURL(file)
  video.hidden = false
  video.parentNode.querySelector('i').hidden = true
  // check out if it is a new video or not
  isNewVideoOrNot(videoName, file)
  // update video name
  videoName = file.name
})

read.addEventListener('change', (e) => {
  if (videoName === '') {
    UIkit.notification({
      message: '<span uk-icon=\'icon: close\'></span><span class="notif">先に動画を開いてください</span>',
      status: 'danger',
      timeout: 4000,
      pos: 'top-right'
    })
    read.value = ''
    return
  }
  const file = e.target.files[0]
  const reader = new FileReader()
  reader.readAsText(file)
  reader.onload = (event) => {
    const result = event.target.result
    makeCSV(result, file)
  }
})

save.addEventListener('click', () => {
  updateResults()
  if (results.length > 0) {
    downloadCSV(results.map(e => e.toString()).join('\n'), videoName.slice(0, videoName.length - 4) + '.csv')
  }
})

btnPlay.addEventListener('click', (e) => {
  let icon = null
  if (e.target.tagName.toUpperCase() === 'A') {
    icon = e.target.querySelector('i')
  } else {
    icon = e.target
  }
  // play or pause
  if (!video || video.src === null) return
  if (icon.classList.contains('fa-play-circle')) {
    play(video)
    icon.classList.remove('fa-play-circle')
    icon.classList.add('fa-pause-circle')
  } else {
    pause(video)
    icon.classList.remove('fa-pause-circle')
    icon.classList.add('fa-play-circle')
  }
})

btnForward.addEventListener('click', (e) => {
  const icon = e.target
  if (video.paused) return
  if (backwardRate < 1) {
    backwardRate = 1
    btnBackwardBadge.innerText = backwardRate
    changeSpeed(video, backwardRate)
  } else if (forwardRate > 8) {
    forwardRate = 1
    btnForwardBadge.innerText = forwardRate
    changeSpeed(video, forwardRate)
  } else {
    forwardRate *= 2
    btnForwardBadge.innerText = forwardRate
    changeSpeed(video, forwardRate)
  }
})

btnBackward.addEventListener('click', (e) => {
  const icon = e.target
  if (video.paused) return
  if (forwardRate > 1) {
    forwardRate = 1
    btnForwardBadge.innerText = forwardRate
    changeSpeed(video, forwardRate)
  } else if (backwardRate < 1/4) {
    backwardRate = 1
    btnBackwardBadge.innerText = backwardRate
    changeSpeed(video, backwardRate)
  } else {
    backwardRate /= 2
    btnBackwardBadge.innerText = backwardRate
    changeSpeed(video, backwardRate)
  }
})

btnForward10s.addEventListener('click', () => {
  if (video.currentTime > video.duration - 10) {
    video.currentTime = video.duration
  } else {
    video.currentTime += 10
  }
})

btnBackward10s.addEventListener('click', () => {
  if (video.currentTime < 10) {
    video.currentTime = 0
  } else {
    video.currentTime -= 10
  }
})

video.addEventListener('playing', () => {
  const icon = btnPlay.querySelector('i')
  if (icon.classList.contains('fa-play-circle')) {
    icon.classList.remove('fa-play-circle')
  }
  if (!icon.classList.contains('fa-pause-circle')) {
    icon.classList.add('fa-pause-circle')
  }
})

video.addEventListener('pause', () => {
  const icon = btnPlay.querySelector('i')
  if (icon.classList.contains('fa-pause-circle')) {
    icon.classList.remove('fa-pause-circle')
  }
  if (!icon.classList.contains('fa-play-circle')) {
    icon.classList.add('fa-play-circle')
  }
})

function init () {
  const btnPlayIcon = btnPlay.querySelector('i')
  if (btnPlayIcon.classList.contains('fa-pause-circle')) {
    btnPlayIcon.classList.remove('fa-pause-circle')
    btnPlayIcon.classList.add('fa-play-circle')
  }
  forwardRate = 1
  btnForwardBadge.innerText = 1
  backwardRate = 1
  btnForwardBadge.innerText = 1
  // update results
  updateResults()
  // initialize counters
  initCounters()
}

function play (e) {
  if (e && e.src !== null) {
    e.play()
  }
}

function pause (e) {
  if (e && e.src !== null) {
    e.pause()
  }
}

function changeSpeed (e, speed) {
  if (e && e.src !== null) {
    e.playbackRate = speed
  }
}

function makeCSV (result, file) {
  const tmp = result.split("\n").filter(e => e !== '')
  let data = []
  for (let i = 0; i < tmp.length; i++) {
    const rowDate = tmp[i]
    data[i] = rowDate.split(",")
  }
  readFile = data
  console.log(readFile)
  // check out if it is a new video or not
  isNewVideoOrNot(file.name, file)
  // make buttons
  createCounters(readFile)
  // update results
  updateResults()
}

function downloadCSV(data, filename) {
  //BOMを付与する（Excelでの文字化け対策）
  const bom = new Uint8Array([0xef, 0xbb, 0xbf]);
  //Blobでデータを作成する
  const blob = new Blob([bom, data], { type: "text/csv" });

  //IE10/11用(download属性が機能しないためmsSaveBlobを使用）
  if (window.navigator.msSaveBlob) {
    window.navigator.msSaveBlob(blob, filename);
    //その他ブラウザ
  } else {
    //BlobからオブジェクトURLを作成する
    const url = (window.URL || window.webkitURL).createObjectURL(blob);
    //ダウンロード用にリンクを作成する
    const download = document.createElement("a");
    //リンク先に上記で生成したURLを指定する
    download.href = url;
    //download属性にファイル名を指定する
    download.download = filename;
    //作成したリンクをクリックしてダウンロードを実行する
    download.click();
    //createObjectURLで作成したオブジェクトURLを開放する
    (window.URL || window.webkitURL).revokeObjectURL(url);
  }
}

function isNewVideoOrNot (videoname, file) {
  if (readFile.length > 0) {
    const latestvideoname = readFile[readFile.length - 1][0]
    isNewVideo = videoname === latestvideoname ? false : true
  } else {
    isNewVideo = videoname === file.name ? false : true
  }
  console.log(isNewVideo)
}

window.addEventListener('beforeunload', (event) => {
  updateResults()
  if (results.length > 0) {
    downloadCSV(results.map(e => e.toString()).join('\n'), 'backup_' + videoName.slice(0, videoName.length - 4) + '.csv')
  }
})
