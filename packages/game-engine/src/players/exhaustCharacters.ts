import type {Player} from '@soul/shared';

export function exhaustCharacters(
	player: Player,
	characterCardIds: string[]
): Player {
	if (characterCardIds.length === 0) {
		throw new Error(
			'At least one character card must be selected'
		);
	}
	
	if (
		new Set(characterCardIds).size !==
		characterCardIds.length
	) {
		throw new Error(
			'Character cards must be unique'
		);
	}
	
	for (const cardId of characterCardIds) {
		const characterCard =
			player.characters.find(
				(character) =>
					character.cardId === cardId
			);
		
		if (!characterCard) {
			throw new Error(
				`Character card "${cardId}" not found`
			);
		}
	}
	
	const selectedCardIds =
		new Set(characterCardIds);
	
	return {
		...player,
		characters:
			player.characters.map(
				(character) => {
					if (
						!selectedCardIds.has(
							character.cardId
						)
					) {
						return character;
					}
					
					return {
						...character,
						exhausted: true
					};
				}
			)
	};
}