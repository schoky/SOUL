function App() {
	return (
		<main className="app">
			<h1>SOUL</h1>
			
			<section className="cards">
				<article className="card">
					<img
						src="/cards/characters/killer.webp"
						alt="Киллер"
					/>
					
					<div className="card-info">
						<h2>Киллер</h2>
						
						<p>Фармила: 4</p>
						<p>Перекуп: 2</p>
						<p>Туллер: 5</p>
					</div>
				</article>
				
				<article className="card">
					<img
						src="/cards/events/raid-on-warehouse.webp"
						alt="Рейд на склад"
					/>
					
					<div className="card-info">
						<h2>Рейд на склад</h2>
						
						<p>Фармила: 3</p>
						<p>Перекуп: 2</p>
						<p>Туллер: 4</p>
					</div>
				</article>
			</section>
		</main>
	);
}

export default App;