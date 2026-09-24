type SoulLogoProps = {
	className?: string;
};

function SoulLogo({
	                  className
                  }: SoulLogoProps) {
	return (
		<div
			className={[
				'soul-logo',
				className
			]
			.filter(Boolean)
			.join(' ')}
			aria-label="SOUL"
		>
			SOUL
		</div>
	);
}

export default SoulLogo;