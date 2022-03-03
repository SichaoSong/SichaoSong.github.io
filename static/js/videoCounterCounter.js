const counterArea = document.getElementById('counter_area')
const formCounter = document.getElementById('counter_form')
const btnCounterSave = document.getElementById('counter_save_btn')
const btnCounterDelete = document.getElementById('counter_delete_btn')

let timeHistory = [null, null, null] // [timeStart, timeEnd, timeDuration]
const counterList = {}
const counterBaseTemplate = {
  'sum':
    '<li style="padding: 0px;">' +
    '  <div class="uk-button uk-button-default uk-inline counter-container">' +
    '    <div class="uk-text-small uk-text-bold counter-name" style="overflow: scroll; height: 40px;"></div>' +
    '    <div class="uk-label uk-label-default uk-position-bottom-left no-padding counter-type"></div>' +
    '    <div class="uk-position-center">' +
    '      <div class="uk-text uk-text-large counter-sum">null</div>' +
    '    </div>' +
    '    <a href="#" class="uk-icon-link uk-position-top-right" uk-icon="pencil" onclick="editCounter(this);event.stopPropagation();"></a>' +
    '  </div>' +
    '</li>',
  'time':
    '<li style="padding: 0px;">' +
    '  <div class="uk-button uk-button-default uk-inline counter-container">' +
    '    <div class="uk-text-small uk-text-bold counter-name" style="overflow: scroll; height: 40px;"></div>' +
    '    <div class="uk-label uk-label-warning uk-position-bottom-left no-padding counter-type"></div>' +
    '    <div class="uk-position-center">' +
    '      <div class="uk-text uk-text-small uk-text-muted counter-time-start">null</div>' +
    '      <div class="uk-text uk-text-small uk-text-muted counter-time-end">null</div>' +
    '      <div class="uk-text uk-text-large uk-text-emphasis uk-text-primary counter-time-duration">0</div>' +
    '    </div>' +
    '    <a href="#" class="uk-icon-link uk-position-top-right" uk-icon="pencil" onclick="editCounter(this);event.stopPropagation();"></a>' +
    '  </div>' +
    '</li>',
  // 'label':
  //   '<li style="padding: 0px;">' +
  //   '  <div class="uk-button uk-button-default uk-inline counter-container">' +
  //   '    <div class="uk-text-small uk-text-bold counter-name"  style="overflow: scroll; height: 20px;"></div>' +
  //   '    <div class="uk-label uk-label-danger uk-position-bottom-left no-padding counter-type"></div>' +
  //   '    <div class="uk-position-center">' +
  //   '      <div class="uk-text uk-text-large counter-label">-</div>' +
  //   '    </div>' +
  //   '    <a href="#" class="uk-icon-link uk-position-top-right" uk-icon="pencil" onclick="editCounter(this);event.stopPropagation();"></a>' +
  //   '  </div>' +
  //   '</li>',
}

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

function createDOM (htmlString) {
  const template = document.createElement('template')
  htmlString = htmlString.trim()
  template.innerHTML = htmlString
  return template.content.firstChild
}

function addCounter () {
  let key = ''
  formCounter.querySelector('#key_input').onkeyup = (e) => {
    key = keyCharMap[e.key] ? keyCharMap[e.key] : e.key.toUpperCase()
    formCounter.querySelector('#key_input').value = key
  }
  btnCounterSave.onclick = ()=> {
    const counter = {
      name: '例',
      type: 'sum',
      key: 'A',
      color: '#FFFFFF'
    }
    counter.name = formCounter.querySelector('#name_input').value ? formCounter.querySelector('#name_input').value : counter.name
    counter.type = formCounter.querySelector('#type_sum_input').checked ? 'sum' : 'time'
    counter.key = key ? key : counter.key
    counter.color = formCounter.querySelector('#color_input').value
    counterList[counter.name] = counter
    let child = null
    counter.type === 'sum' ? child = createDOM(counterBaseTemplate['sum']) : child = createDOM(counterBaseTemplate['time'])
    child.querySelector('.counter-container').id = counter.name
    child.querySelector('.counter-container').setAttribute('key', counter.key)
    child.querySelector('.counter-name').innerText = counter.name
    child.querySelector('.counter-type').innerText = counter.type
    child.querySelector('.counter-container').onclick = () => {
      manageCounter(child, counter)
    }
    child.querySelector('.counter-container').style.backgroundColor = counter.color
    const children = [...counterArea.childNodes].filter(item => item.tagName === 'LI')
    counterArea.insertBefore(child, children[children - 1])
    UIkit.modal('#counter_form').hide()
  }
}

function editCounter (dom) {
  UIkit.modal('#counter_form').show()
  const counterOldName = dom.parentNode.id
  const counter = counterList[counterOldName]
  let key = counter.key
  formCounter.querySelector('#key_input').onkeyup = (e) => {
    key = keyCharMap[e.key] ? keyCharMap[e.key] : e.key.toUpperCase()
    formCounter.querySelector('#key_input').value = key
  }
  // update counter setting display before edit
  formCounter.querySelector('#name_input').value = counter.name
  counter.type === 'sum' ? formCounter.querySelector('#type_sum_input').checked = true :
    formCounter.querySelector('#type_time_input').checked = true
  formCounter.querySelector('#key_input').value = counter.key
  formCounter.querySelector('#color_input').value = counter.color
  btnCounterSave.onclick = ()=> {
    counter.name = formCounter.querySelector('#name_input').value
    counter.key = key
    counter.color = formCounter.querySelector('#color_input').value
    if (counter.type === 'sum') {
      counter.sum = counterList[counterOldName].sum
    } else if (counter.type === 'time') {
      counter.timeDuration = counterList[counterOldName].timeDuration
    }
    delete counterList[counterOldName]
    counterList[counter.name] = counter
    updateCounterList(counter)
    // update counter display
    dom.parentNode.id = counter.name
    dom.parentNode.querySelector('.counter-name').innerText = counter.name
    dom.parentNode.querySelector('.counter-type').innerText = counter.type
    dom.parentNode.setAttribute('key', counter.key)
    dom.parentNode.style.backgroundColor = counter.color
    UIkit.modal('#counter_form').hide()
  }
  btnCounterDelete.onclick = ()=> {
    UIkit.modal.confirm('このカウンターを消去しますか？').then(() => {
      dom.parentNode.parentNode.parentNode.removeChild(dom.parentNode.parentNode)
      delete counterList[dom.parentNode.id]
    })
  }
}

function createCounter (name, key, type, color, value) {
  const counter = {
    name: name,
    type: type,
    key: key,
    color: color
  }
  counterList[counter.name] = counter
  let child = null
  counter.type === 'sum' ? child = createDOM(counterBaseTemplate['sum']) : child = createDOM(counterBaseTemplate['time'])
  child.querySelector('.counter-container').id = counter.name
  child.querySelector('.counter-container').setAttribute('key', counter.key)
  child.querySelector('.counter-name').innerText = counter.name
  child.querySelector('.counter-type').innerText = counter.type
  child.querySelector('.counter-container').onclick = () => {
    manageCounter(child, counter)
  }
  child.querySelector('.counter-container').style.backgroundColor = counter.color
  const children = [...counterArea.childNodes].filter(item => item.tagName === 'LI')
  counterArea.insertBefore(child, children[children - 1])
  if (counter.type === 'sum') {
    counter.sum = parseInt(value)
    child.querySelector('.counter-sum').innerText = counter.sum
  } else if (counter.type === 'time') {
    counter.timeDuration = parseFloat(value)
    child.querySelector('.counter-time-duration').innerText = counter.timeDuration.toFixed(2)
  }
  counterList[counter.name] = counter
  updateCounterList(counter)
}

function createCounters (data) {
  if (data.length > 0 && data[0].length > 0) {
    const names = data[0]
    const keys = data[1]
    const types = data[2]
    const colors = data[3]
    const values = data[data.length - 1]
    for (let i = 1; i < names.length; i++) {
      const name = names[i]
      const key = keys[i]
      const type = types[i]
      const color = colors[i]
      const value = values[i]
      createCounter(name, key, type, color, isNewVideo ? null : value)
    }
  }
}

function manageCounter (dom, counter) {
  switch (counter.type) {
    case 'sum': {
      if (counter.sum) {
        if (shiftFlag) {
          counter.sum -= 1
          shiftFlag = !shiftFlag
        } else {
          counter.sum += 1
        }
      } else {
        counter.sum = 1
      }
      dom.querySelector('.counter-sum').innerText = counter.sum
      updateCounterList(counter)
      break
    }

    case 'time': {
      if (shiftFlag) {
        if (!counter.timeStart) {
          if (counter.timeStart) {
            counter.timeStart = timeHistory[0]
            dom.querySelector('.counter-time-start').innerText = counter.timeStart.toFixed(2)
            dom.querySelector('.counter-time-end').innerText = '-'
            counter.timeDuration -= (timeHistory[1] - timeHistory[0])
            dom.querySelector('.counter-time-duration').innerText = counter.timeDuration.toFixed(2)
          }
        } else {
          counter.timeStart = null
          dom.querySelector('.counter-time-start').innerText = '-'
          dom.querySelector('.counter-time-end').innerText = '-'
        }
        shiftFlag = !shiftFlag
        timeHistory = [null, null, null]
      } else {
        if (!counter.timeStart) {
          counter.timeStart = video.currentTime
          dom.querySelector('.counter-time-start').innerText = counter.timeStart.toFixed(2)
          dom.querySelector('.counter-time-end').innerText = '-'
        } else {
          counter.timeEnd = video.currentTime
          // calculate sum of time duration
          if (!counter.timeDuration) {
            counter.timeDuration = counter.timeEnd - counter.timeStart
          } else {
            counter.timeDuration += counter.timeEnd - counter.timeStart
          }
          dom.querySelector('.counter-time-end').innerText = counter.timeEnd.toFixed(2)
          dom.querySelector('.counter-time-duration').innerText = counter.timeDuration.toFixed(2)
          timeHistory = [counter.timeStart, counter.timeEnd, counter.duration]
          counter.timeStart = null
          counter.timeEnd = null
        }
      }
      updateCounterList(counter)
      break
    }

    // case 'label': {
    //   if (!counter.label || counter.label === 'no') {
    //     counter.label = 'yes'
    //     dom.querySelector('.counter-label').innerText = counter.label
    //   } else {
    //     counter.label = 'no'
    //     dom.querySelector('.counter-label').innerText = counter.label
    //   }
    //   updateCounterList(counter)
    //   break
    // }
  }
}

function updateCounterList (counter) {
  Object.assign(counter)
}

function updateResults () {
  let temp = []
  // append readFile to results
  if (Object.keys(counterList).length === 0) return
  if (readFile.length > 0) {
    for (let i = 0; i < readFile.length; i++) {
      results.push(readFile[i])
    }
    readFile = []
    newResult = false
  } else {
    if (newResult) {
      temp = ['']
      // first row
      for (const [name, counter] of Object.entries(counterList)) {
        temp.push(name)
      }
      results.push(temp)
      temp = ['']
      for (const [name, counter] of Object.entries(counterList)) {
        temp.push(counter.key)
      }
      results.push(temp)
      temp = ['']
      for (const [name, counter] of Object.entries(counterList)) {
        temp.push(counter.type)
      }
      results.push(temp)
      temp = ['']
      for (const [name, counter] of Object.entries(counterList)) {
        temp.push(counter.color)
      }
      results.push(temp)
      temp = []
    }
    // append annotation results
    // if it is a same video, remove the old results and add new results
    if (!isNewVideo) {
      results.pop()
    }
    temp.push(videoName)
    for (const [name, counter] of Object.entries(counterList)) {
      // console.log(name)
      switch (counter.type) {
        case 'sum':
          temp.push(counter.sum)
          break

        case 'time':
          temp.push(counter.timeDuration)
          break
      }
    }
    results.push(temp)
    newResult = false
    console.log(results)
  }
}

function initCounters () {
  if (Object.keys(counterList).length === 0) return
  clearCounters()
  createCounters(results)
}

function clearCounters () {
  while (counterArea.firstElementChild.nextElementSibling) {
    counterArea.removeChild(counterArea.firstElementChild.nextElementSibling)
  }
}

document.onkeyup = (e) => {
  if (e.target.tagName === 'BODY') {
    const targetKey = keyCharMap[e.key] ? keyCharMap[e.key] : e.key.toUpperCase()
    switch (targetKey) {
      case 'SPC':
        btnPlay.click()
        break

      case '↑':
        btnForward.click()
        break

      case '↓':
        btnBackward.click()
        break

      case '→':
        btnForward10s.click()
        break

      case '←':
        btnBackward10s.click()
        break

      case keyCharMap.Shift:
        shiftFlag = !shiftFlag
        break

      default: {
        const children = [...counterArea.childNodes]
        children
          .filter(item => item.tagName === 'LI')
          .filter(item => item.querySelector('.counter-container').getAttribute('key') === targetKey)
          .forEach(dom => {
            dom.querySelector('.counter-container').click()
          })
      }
    }
  }
}
