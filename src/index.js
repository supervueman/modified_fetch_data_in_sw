window.addEventListener('load', async () => {
  if ('serviceWorker' in navigator) {
    try {
      const reg = await navigator.serviceWorker.register('/sw.js')
      console.log('Service worker register success', reg)

      testFetch2()
    } catch (e) {
      console.log('Service worker register fail')
    }
  }

  await loadPosts()

  await testFetch()
})

async function loadPosts() {
  const res = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=11')
  console.log(res)
  if (res) {
    const data = await res.json()
    const container = document.querySelector('#posts')
    container.innerHTML = data.map(toCard).join('\n')
  }
}

async function testFetch() {
  const res = await fetch('my-test-fetch')
  console.log('Test response:', res)
  if (res.ok) {
    const data = await res.json()
    console.log('Test data:', data)
  }
}

async function testFetch2() {
  const clickBtn = document.querySelector('#click-btn')

  clickBtn.addEventListener('click', () => {
    fetch('my-test-fetch-2')
  })

  navigator.serviceWorker.addEventListener('message', event => {
    console.log(event.data.msg, event.data.url);
  })
}

function toCard(post) {
  return `
    <div class="card">
      <div class="card-title">
        ${post.title}
      </div>
      <div class="card-body">
        ${post.body}
      </div>
    </div>
  `
}