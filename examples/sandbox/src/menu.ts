import { scenes } from './main'

export function createMenu() {
  const sceneList = document.querySelector('#scene-list')!

  const url = new URL(window.location.href)
  const query = url.searchParams
  for (const name of Object.keys(scenes)) {
    const li = document.createElement('li')
    const sceneLink = document.createElement('a')
    const codeLink = document.createElement('a')

    li.appendChild(sceneLink)
    li.appendChild(codeLink)

    codeLink.href = `https://github.com/mattjennings/excalibur-ui/blob/main/examples/sandbox/src/scenes/${name}/scene.tsx`
    codeLink.textContent = 'view code'
    codeLink.target = '_blank'
    codeLink.rel = 'noopener noreferrer'

    sceneLink.href = `?scene=${name}`
    sceneLink.textContent = name
    if (query.get('scene') === name) {
      sceneLink.classList.add('active')
    }
    sceneList.appendChild(li)

    sceneLink.onclick = (e) => {
      e.preventDefault()
      window.history.pushState({}, '', `?scene=${name}`)

      const prevActive = document.querySelector('.active')
      prevActive?.classList.remove('active')
      sceneLink.classList.add('active')
    }
  }
}
