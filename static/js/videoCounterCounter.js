const counterArea = document.getElementById('counter_area')
const formCounter = document.getElementById('counter_form')
const btnCounterSave = document.getElementById('counter_save_btn')
const btnCounterDelete = document.getElementById('counter_delete_btn')

const counterList = {}
const counterBaseTemplate = {
  'sum':
    '<li>' +
    '  <div class="uk-button uk-button-default uk-inline counter-container">' +
    '    <div class="uk-text-small uk-text-bold counter-name" style="overflow: scroll; height: 20px;"></div>' +
    '    <div class="uk-label uk-label-default uk-position-bottom-left no-padding counter-type"></div>' +
    '    <div class="uk-position-center">' +
    '      <div class="uk-text uk-text-large counter-sum">0</div>' +
    '    </div>' +
    '    <a href="#" class="uk-icon-link uk-position-top-right" uk-icon="pencil" onclick="editCounter(this);event.stopPropagation();"></a>' +
    '  </div' +
    '</li>',
  'time':
    '<li>' +
    '  <div class="uk-button uk-button-default uk-inline counter-container">' +
    '    <div class="uk-text-small uk-text-bold counter-name" style="overflow: scroll; height: 20px;"></div>' +
    '    <div class="uk-label uk-label-warning uk-position-bottom-left no-padding counter-type"></div>' +
    '    <div class="uk-position-center">' +
    '      <div class="uk-text uk-text-small uk-text-muted counter-time-start">0</div>' +
    '      <div class="uk-text uk-text-small uk-text-muted counter-time-end">0</div>' +
    '      <div class="uk-text uk-text-large uk-text-emphasis uk-text-primary counter-time-duration">0</div>' +
    '    </div>' +
    '    <a href="#" class="uk-icon-link uk-position-top-right" uk-icon="pencil" onclick="editCounter(this);event.stopPropagation();"></a>' +
    '  </div' +
    '</li>',
  'label':
    '<li>' +
    '  <div class="uk-button uk-button-default uk-inline counter-container">' +
    '    <div class="uk-text-small uk-text-bold counter-name"  style="overflow: scroll; height: 20px;"></div>' +
    '    <div class="uk-label uk-label-danger uk-position-bottom-left no-padding counter-type"></div>' +
    '    <div class="uk-position-center">' +
    '      <div class="uk-text uk-text-large counter-label">-</div>' +
    '    </div>' +
    '    <a href="#" class="uk-icon-link uk-position-top-right" uk-icon="pencil" onclick="editCounter(this);event.stopPropagation();"></a>' +
    '  </div' +
    '</li>',
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
    counter.type = formCounter.querySelector('#type_sum_input').checked ? 'sum' :
      formCounter.querySelector('#type_time_input').checked ? 'time' :
        'label'
    counter.key = key ? key : counter.key
    counter.color = formCounter.querySelector('#color_input').value
    counterList[counter.name] = counter
    let child = null
    counter.type === 'sum' ? child = createDOM(counterBaseTemplate['sum']) :
      counter.type === 'time' ? child = createDOM(counterBaseTemplate['time']) :
        child = createDOM(counterBaseTemplate['label'])
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
  let key = ''
  formCounter.querySelector('#key_input').onkeyup = (e) => {
    key = keyCharMap[e.key] ? keyCharMap[e.key] : e.key.toUpperCase()
    formCounter.querySelector('#key_input').value = key
  }
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

function manageCounter (dom, counter) {
  switch (counter.type) {
    case 'sum': {
      if (counter.sum) {
        counter.sum += 1
      } else {
        counter.sum = 1
      }
      dom.querySelector('.counter-sum').innerText = counter.sum
      updateCounterList(counter)
      break
    }

    case 'time': {
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
        counter.timeStart = null
        counter.timeEnd = null
      }
      updateCounterList(counter)
      break
    }

    case 'label': {
      if (!counter.label || counter.label === 'no') {
        counter.label = 'yes'
        dom.querySelector('.counter-label').innerText = counter.label
      } else {
        counter.label = 'no'
        dom.querySelector('.counter-label').innerText = counter.label
      }
      updateCounterList(counter)
      break
    }
  }
}

function updateCounterList (counter) {
  Object.assign(counter)
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
