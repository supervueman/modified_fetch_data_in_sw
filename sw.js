const url = 'https://jsonplaceholder.typicode.com/posts?_limit=11'
const testUrl = 'http://localhost:3000/my-test-fetch'
const testUrl2 = 'http://localhost:3000/my-test-fetch-2'

const cacheUrls = ['index.html', '/src/index.js', '/css/styles.css', '/offline.html']

const staticCacheName = 'v1-static'
const dynamicCacheName = 'v1-dynamic'

self.addEventListener('install', async event => {
  console.log('Sw install', event)
  const cache = await caches.open(staticCacheName)
  await cache.addAll(cacheUrls)
})

self.addEventListener('activate', async event => {
  console.log('Sw activate', event)

  const cacheNames = await caches.keys()
  await Promise.all(
    cacheNames
      .filter(name => name !== staticCacheName)
      .filter(name => name !== dynamicCacheName)
      .map(name => caches.delete(name))
  )
})

self.addEventListener('fetch', async event => {
  event.waitUntil(async function () {
    if (event.clientId && event.request.url === testUrl2) {
      const client = await clients.get(event.clientId)

      if (client) {
        client.postMessage({
          msg: 'Hello',
          url: event.request.url,
        })
      }
    }
  }())

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

    const newUrl = new URL(event.request.url)

    if (newUrl.origin === location.origin) {
      return cacheFirst(event.request)
    } else {
      return networkFirst(event.request)
    }
  }())
})

const cacheFirst = async (request) => {
  const cached = await caches.match(request)

  return cached ?? fetch(request)
}

const networkFirst = async (request) => {
  const cache = await caches.open(dynamicCacheName)

  try {
    const response = await fetch(request)
    await cache.put(request, response.clone())

    return response
  } catch (error) {
    const cached = await cache.match(request)
    return cached ?? caches.match('/offline.html')
  }
}