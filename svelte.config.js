// import adapter from '@sveltejs/adapter-auto';
import adapter from 'svelte-adapter-github';

const dev = process.argv.includes('dev');

// /** @type {import('@sveltejs/kit').Config} */
// const config = {
// 	kit: {
// 		adapter: adapter()
// 	}
// };

// export default config;

export default {
	kit: {
		paths: {
			base: dev ? '' : '/repeated-reference-games-web',
		  },
	  adapter: adapter({
		// default options are shown. On some platforms
		// these options are set automatically — see below
		pages: 'docs',
		assets: 'docs',
		fallback: null,
		precompress: false,
		domain: '',
		jekyll: false
	  }),
	},
	dev: dev
  };