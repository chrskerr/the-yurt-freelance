const { plugin } = require( "vite-plugin-markdown" );
const { resolve } = require( "path" );

module.exports = {
	compilerOptions: { 
		hydratable: true,
	},
	kit: {
		adapter: "@sveltejs/adapter-static",
		target: "#wrapper",
		vite: {
			resolve: {
				alias: {
					$components: resolve( "src/components" ),
				},
			},
			plugins: [
				plugin(),
			],
		},
	},
};
