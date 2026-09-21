import type {EventCard} from '@soul/shared';

export const events: EventCard[] = [
	{
		id: 'raid-on-warehouse',
		name: 'Рейд на склад',
		
		requirements: {
			farmila: 3,
			perekup: 2,
			tuller: 4
		},
		
		mainStat: 'tuller',
		reward: 2,
		riskReward: 4,
		
		description:
			'Нужно пробраться на склад и забрать товар раньше, чем приедет охрана.'
	},
	
	{
		id: 'resell-batch',
		name: 'Перепродажа партии',
		
		requirements: {
			farmila: 2,
			perekup: 5,
			tuller: 2
		},
		
		mainStat: 'perekup',
		reward: 2,
		riskReward: 4,
		
		description:
			'Нужно быстро найти покупателя и продать партию с максимальной выгодой.'
	},
	
	{
		id: 'night-shift',
		name: 'Ночная смена',
		
		requirements: {
			farmila: 5,
			perekup: 2,
			tuller: 2
		},
		
		mainStat: 'farmila',
		reward: 1,
		riskReward: 3,
		
		description:
			'Работа до утра. Главное — не сдаться и довести смену до конца.'
	},
	
	{
		id: 'black-market-deal',
		name: 'Сделка на чёрном рынке',
		
		requirements: {
			farmila: 3,
			perekup: 4,
			tuller: 3
		},
		
		mainStat: 'perekup',
		reward: 3,
		riskReward: 5,
		
		description:
			'Опасная сделка, где ошибка в цене может полностью изменить результат.'
	},
	
	{
		id: 'warehouse-escape',
		name: 'Побег со склада',
		
		requirements: {
			farmila: 2,
			perekup: 3,
			tuller: 5
		},
		
		mainStat: 'tuller',
		reward: 3,
		riskReward: 5,
		
		description:
			'Охрана уже заметила неладное. Нужно выбраться со склада, не потеряв товар.'
	}
];