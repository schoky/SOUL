import type {Character} from '@soul/shared';

export const characters: Character[] = [
	{
		id: 'killer',
		name: 'Киллер',
		
		stats: {
			farmila: 4,
			perekup: 2,
			tuller: 5
		},
		
		ability: {
			id: 'cold-blooded',
			name: 'Хладнокровие',
			description:
				'Первый провал по Туллеру за игру не отнимает Soul.'
		}
	},
	
	{
		id: 'market-shark',
		name: 'Рыночный акула',
		
		stats: {
			farmila: 2,
			perekup: 5,
			tuller: 3
		},
		
		ability: {
			id: 'profitable-deal',
			name: 'Выгодная сделка',
			description:
				'При успешном событии с Перекупом получает на 1 Soul больше.'
		}
	},
	
	{
		id: 'workaholic',
		name: 'Трудяга',
		
		stats: {
			farmila: 5,
			perekup: 3,
			tuller: 2
		},
		
		ability: {
			id: 'work-to-exhaustion',
			name: 'На износ',
			description:
				'При успешном событии с Фармилой получает дополнительный Soul.'
		}
	}
];