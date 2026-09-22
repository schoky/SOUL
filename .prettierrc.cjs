import prettier from '@schoky/prettier'

export default {
	...prettier,
	plugins: [
		...(prettier.plugins || []),
		'prettier-plugin-prisma'
	],
	overrides: [
		...(prettier.overrides || []),
		{
			files: '*.prisma',
			options: {
				parser: 'prisma-language-server'
			}
		}
	]
};
