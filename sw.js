const url = 'https://jsonplaceholder.typicode.com/posts?_limit=11'
const testUrl = 'http://localhost:3000/my-test-fetch'

const cacheUrls = ['index.html', '/src/index.js', '/css/styles.css']

const cacheStaticName = 'v1-static'

self.addEventListener('install', async event => {
  console.log('Sw install', event)
  const cache = await caches.open(cacheStaticName)
  await cache.addAll(cacheUrls)
})

self.addEventListener('activate', async event => {
  console.log('Sw activate', event)

  const cacheNames = await caches.keys()
  await Promise.all(
    cacheNames.filter(name => name !== cacheStaticName).map(name => caches.delete(name))
  )
})

self.addEventListener('fetch', event => {
  event.respondWith(async function () {
    if (event.request.url === url) {
      const res = await fetch(url)
      console.log('SW:', res)
      const data = await res.json()
      const modifiedData = data.map(d => ({
        ...d,
        title: 'Modified title',
      }))
      const init = { status: 200, statusText: 'SuperSmashingGreat!' }

      const blob = new Blob([JSON.stringify(modifiedData, null, 2)], {type : 'application/json'})

      console.log(data)

      return new Response(blob, init)
    }

    if (event.request.url === testUrl) {
      console.log(event)
      const data = [{
        user: {
          name: 'Rinat',
          nickname: 'supervueman'
        }
      }]

      const init = { status: 200, statusText: 'SuperSmashingGreat!' }

      const blob = new Blob([JSON.stringify(data, null, 2)], {type : 'application/json'})

      return new Response(blob, init)
    }

    return cacheFirst(event.request)
  }())
})

const cacheFirst = async (request) => {
  const cached = await caches.match(request)

  return cached ?? fetch(request)
}