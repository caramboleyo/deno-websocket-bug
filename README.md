I create my testcase with the subdomain deno-websocket-bug.miserit-anthar.net

Since a certificate needs port 443 i run my test with an ipv6

i choose [2a03:4000:003b:0244:2710:4e20:7530:9c50] and add it as hostname to my dns

my local working dir is `/var/www/deno/deno-websocket-bug.miserit-anthar.net`

i first start it without tls on port 80 so i can retrieve a letsencrypt certificate

i run `DENO_DIR=deno_modules deno run -A server.js`

and check if it works by opening the link in a browser:
http://deno-websocket-bug.miserit-anthar.net/.well-known/acme-challenge/test.txt

I see the “WORKS” message so i know now i can obtain the certificate.

When i open http://deno-websocket-bug.miserit-anthar.net and check the console i see the websocket is working since i see the console messages in the browser and also in the console log of the running server

i retrieve the certificates with

`certbot certonly --webroot -d deno-websocket-bug.miserit-anthar.net -w /var/www/deno/deno-websocket-bug.miserit-anthar.net`

i have now
```
Successfully received certificate.
Certificate is saved at: /etc/letsencrypt/live/deno-websocket-bug.miserit-anthar.net/fullchain.pem
Key is saved at:         /etc/letsencrypt/live/deno-websocket-bug.miserit-anthar.net/privkey.pem
```

i stop the server

add the certificates to the Deno.listenTls

comment out the Deno.listen

comment in the Deno.listenTls

and restart the server


i check https://deno-websocket-bug.miserit-anthar.net/

with Deno 1.32.3 everything works like before

with Deno 1.36.0 everything works fine at the beginning, but if you wait 90 seconds and you do a `socket.send('test')`, nothing happens anymore.

it is also intresting that with this testcase it needs 90 seconds for the bug to occur, while on the dev version of my browser game it appears immediatly, never loading the star map: https://z8x4.miserit-anthar.net/
