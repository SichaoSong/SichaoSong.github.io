const open = document.getElementById('open')
const video = document.getElementById('video').querySelector('video')
const btnPlay = document.getElementById('btn_play')
const btnForward = document.getElementById('btn_forward')
const btnForwardBadge = btnForward.querySelector('.uk-badge')
const btnBackward = document.getElementById('btn_backward')
const btnBackwardBadge = btnBackward.querySelector('.uk-badge')
const btnForward10s = document.getElementById('btn_forward10s')
const btnBackward10s = document.getElementById('btn_backward10s')

let forwardRate = 1
let backwardRate = 1

const keyCharMap = {
  Escape: 'ESC',
  Control: 'CTL',
  Shift: 'SFT',
  Backspace: 'BS',
  Enter: 'ENT',
  ArrowLeft: '←',
  ArrowUp: '↑',
  ArrowDown: '↓',
  ArrowRight: '→',
  ' ': 'SPC'
}

open.addEventListener('change', (e) => {
  init()
  const url = URL || webkitURL
  const file = e.target.files[0]
  video.src = url.createObjectURL(file)
  video.hidden = false
  video.parentNode.querySelector('i').hidden = true
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
