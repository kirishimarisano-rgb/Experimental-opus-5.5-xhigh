// Render index.html (or another page) headlessly and save a screenshot.
//
//   node tools/shoot.mjs [page.html] [out.png] [--w 1920] [--h 1080] [--t 14.2] [--q high] [--extra "&debug=fog"]
//
// The page loads three.js from cdn.jsdelivr.net through its import map. This
// sandbox cannot reach the CDN, so every CDN request is answered from
// tools/node_modules/three instead; the page itself is served from a fake
// origin so module/CORS rules behave like a normal http deployment.

import { chromium } from 'playwright';
import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname( fileURLToPath( import.meta.url ) );
const root = path.resolve( here, '..' );

const args = process.argv.slice( 2 );
const positional = [];
const opts = { w: 1920, h: 1080, t: 14.2, q: 'high', extra: '', timeout: 900 };
for ( let i = 0; i < args.length; i ++ ) {

	if ( args[ i ].startsWith( '--' ) ) opts[ args[ i ].slice( 2 ) ] = args[ ++ i ];
	else positional.push( args[ i ] );

}

const pageFile = path.resolve( root, positional[ 0 ] ?? 'index.html' );
const outFile = path.resolve( root, positional[ 1 ] ?? 'shot.png' );
const pageRel = path.relative( root, pageFile ).split( path.sep ).join( '/' );

const ORIGIN = 'http://amamiya.test';
const CDN = /^https:\/\/cdn\.jsdelivr\.net\/npm\/three@[^/]+\/(.*)$/;
const threeDir = path.join( here, 'node_modules', 'three' );

const mime = ( f ) => f.endsWith( '.js' ) ? 'text/javascript' : f.endsWith( '.html' ) ? 'text/html' : f.endsWith( '.png' ) ? 'image/png' : 'application/octet-stream';

const browser = await chromium.launch( {
	executablePath: existsSync( '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' ) ? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' : undefined,
	args: [ '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--enable-webgl' ]
} );

const page = await browser.newPage( { viewport: { width: + opts.w, height: + opts.h }, deviceScaleFactor: 1 } );

await page.route( '**/*', async ( route ) => {

	const url = route.request().url();
	const m = url.match( CDN );
	let file = null;
	if ( m ) file = path.join( threeDir, m[ 1 ].split( '?' )[ 0 ] );
	else if ( url.startsWith( ORIGIN ) ) file = path.join( root, decodeURIComponent( new URL( url ).pathname ) );
	if ( file && existsSync( file ) ) {

		return route.fulfill( { status: 200, contentType: mime( file ), body: await readFile( file ), headers: { 'Access-Control-Allow-Origin': '*' } } );

	}

	console.log( '[blocked]', url );
	return route.fulfill( { status: 404, body: 'not found' } );

} );

page.on( 'console', ( msg ) => {

	const text = msg.text();
	if ( /GPU stall|Automatic fallback|swiftshader/i.test( text ) ) return;
	console.log( `[page:${msg.type()}]`, text );

} );
page.on( 'pageerror', ( err ) => console.log( '[pageerror]', err.message ) );

const url = `${ORIGIN}/${pageRel}?shot=1&t=${opts.t}&q=${opts.q}${opts.extra}`;
const t0 = Date.now();
await page.goto( url );
await page.waitForFunction( () => window.__sceneReady === true || window.__sceneError, null, { timeout: + opts.timeout * 1000, polling: 500 } );
const err = await page.evaluate( () => window.__sceneError );
if ( err ) console.log( '[scene error]', err );
const stats = await page.evaluate( () => window.__sceneStats );
// read the canvas back directly (the page keeps preserveDrawingBuffer on in shot mode);
// this avoids waiting on the compositor, which is slow with software GL
const png = await page.evaluate( () => document.querySelector( 'canvas' ).toDataURL( 'image/png' ) );
await writeFile( outFile, Buffer.from( png.split( ',' )[ 1 ], 'base64' ) );
console.log( `saved ${path.relative( root, outFile )} in ${( ( Date.now() - t0 ) / 1000 ).toFixed( 1 )}s`, stats ? JSON.stringify( stats ) : '' );
await browser.close();
