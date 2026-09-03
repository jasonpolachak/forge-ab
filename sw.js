var CACHE="forge-ab-0.6.11";
var SHELL=["./","index.html","manifest.webmanifest","icon-192.png","icon-512.png"];

self.addEventListener("install",function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){return c.addAll(SHELL)}));
  self.skipWaiting();
});

self.addEventListener("activate",function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.filter(function(k){return k!==CACHE}).map(function(k){return caches.delete(k)}));
    }).then(function(){return self.clients.claim()})
  );
});

function isHtml(req){
  if(req.mode==="navigate") return true;
  var path=new URL(req.url).pathname;
  return /index\.html$/.test(path)||path==="/forge-ab/"||path==="/forge-ab";
}

self.addEventListener("fetch",function(e){
  if(e.request.method!=="GET") return;
  var url=new URL(e.request.url);
  if(url.origin!==self.location.origin) return;
  if(isHtml(e.request)){
    e.respondWith(
      fetch(e.request).then(function(r){
        var copy=r.clone();
        caches.open(CACHE).then(function(c){c.put(e.request,copy)});
        return r;
      }).catch(function(){
        return caches.match(e.request).then(function(r){
          return r||caches.match("index.html")||caches.match("./");
        });
      })
    );
    return;
  }
  e.respondWith(
    caches.match(e.request).then(function(r){
      return r||fetch(e.request).then(function(res){
        var copy=res.clone();
        caches.open(CACHE).then(function(c){c.put(e.request,copy)});
        return res;
      });
    })
  );
});
