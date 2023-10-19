
const server = Deno.listen({
	hostname: '[2a03:4000:003b:0244:2710:4e20:7530:9c50]',
	port: 80,
});


/*
const server = Deno.listenTls({
	hostname: '[2a03:4000:003b:0244:2710:4e20:7530:9c50]',
	port: 443,
	certFile: '/etc/letsencrypt/live/deno-websocket-bug.miserit-anthar.net/fullchain.pem',
	keyFile: '/etc/letsencrypt/live/deno-websocket-bug.miserit-anthar.net/privkey.pem',
	alpnProtocols: ["h2", "http/1.1"],
});
*/

async function serve(server) {
	for await (const conn of server) {
		handle(conn);
	}
}

async function handle(conn) {
	const httpConn = Deno.serveHttp(conn);
	for await (const requestEvent of httpConn) {
		await requestEvent.respondWith(handleReq(requestEvent.request));
	}
}

async function handleReq(req) {
	const upgrade = req.headers.get('upgrade') || '';
	if (upgrade.toLowerCase() === 'websocket') {
		const { socket, response } = Deno.upgradeWebSocket(req, {idleTimeout: 0});
		socket.onopen = e => console.log;
		socket.onclose = e => console.log;
		socket.onerror = e => console.error;
		socket.onmessage = e => {
			console.log('receivedFromClient>', e.data);
			socket.send('Server message to client');
		};
		return response;
	}

	const url = new URL(req.url);

	// serve acme challenge for letsencrypt
	if (url.pathname.includes('/.well-known/acme-challenge/')) {
		return new Response(await Deno.readTextFile(url.pathname.slice(1)));
	}

	let webSocketUrl;
	if (url.protocol === 'http:') {
		webSocketUrl = 'ws://' + url.host;
	} else {
		webSocketUrl = 'wss://' + url.host;
	}

	return new Response(index(webSocketUrl), {
		headers: {
			'content-type': 'text/html; charset=utf-8'
		}
	});
}

const index = webSocketUrl => `<!DOCTYPE html>
<html>
	<head>
		<meta charset="UTF-8">
		<script type="module">
			globalThis.socket = new WebSocket('${webSocketUrl}');
			socket.onopen = e => {
				console.log('WebSocket Connection established');
				socket.send('Client message to server');
			};
			socket.onclose = e => console.log;
			socket.onerror = e => console.error;
			socket.onmessage = e => {
				console.log('receivedFromServer>', e.data);
			};
			setTimeout(function() {
				console.log('Sending 90 seconds later..');
				socket.send('Test');
			}, 90000);
		</script>
	</head>
	<body>
		Check console output.
	</body>
</html>
`;

serve(server);
