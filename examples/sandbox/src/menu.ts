import { scenes } from './main'

export function createMenu() {
  const sceneList = document.querySelector('#scene-list')!

  const url = new URL(window.location.href)
  const query = url.searchParams
  for (const name of Object.keys(scenes)) {
    const li = document.createElement('li')
    const a = document.createElement('a')

    a.href = `?scene=${name}`
    a.textContent = name
    if (query.get('scene') === name) {
      a.classList.add('active')
    }
    li.appendChild(a)
    sceneList.appendChild(li)

    a.onclick = (e) => {
      e.preventDefault()
      window.history.pushState({}, '', `?scene=${name}`)

      const prevActive = document.querySelector('.active')
      prevActive?.classList.remove('active')
      a.classList.add('active')
    }
  }
}
