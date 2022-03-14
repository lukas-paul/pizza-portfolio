<script>
	import AboutUs from "./components/AboutUs.svelte"
	import Admin from "./components/Admin.svelte"
 	import url from "./url"
	import { slide } from 'svelte/transition';

	let admin = false;
	if ($url.hash === "#/admin") {
		admin = true;
	}
</script>

{#if admin}
		<Admin/>
{/if}
{#if !admin}
<main>
	
	<div class="headline">
		<h2>La Pizzeria Grande</h2>
	</div>
	
	<div class="middle">
		<div transition:slide={{duration: 1000}}>
			<AboutUs />
		</div>
	</div>

	<div class="impressum">
		<div class="opening-hours">
			<p style="font-weight: bold">Opening Hours</p>
			<p>Monday — Sunday: 6pm — 11pm</p>
		</div>
		<div class="contact">
			<a href="https://www.facebook.com/gazzopizza/"><img src="facebook.png" alt="facebook"></a>
			<a href="https://www.instagram.com/gazzopizza/?hl=en"><img src="instagram.png" alt="instagram"></a>
		</div>
			
	</div>

</main>
{/if}

<style>

main {
	display: grid;
	grid-template-rows: 10vh 80vh 10vh;
}

.headline {
	position: relative;
	grid-row: 1;
	width: 100vw;
	text-align: center;
	background-color: black;
	color: white;
}

.headline>h2 {
	margin: 0px;
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
}

.middle {
	background-image: url("/w-pizza.jpeg");
	background-size: cover;
	background-position: center;
	grid-row: 2;
	position: relative;
	display: flex;
  	flex-direction: column;
	overflow-y: scroll;
}

.impressum {
	grid-row: 3;
	height: 100%;
	width: 100%;
	background-color: rgba(0, 0, 0, 0.9);
	font-family: monospace;
	color: white;
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	align-items: center;
}

.opening-hours {
	height: 80%;
	margin-left: 10px;
}

.contact {
	height: 80%;
	width: 200px;
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: space-around;
}
.contact>a>img {
	height: 30px;;
}

@media (max-width: 500px) {
	main {
		display: grid;
		grid-template-rows: 20vh 60vh 20vh;
	}

	.impressum {
		flex-direction: column;
		align-items: baseline;
		
	}

	.contact {
		margin-left: 10px;
		justify-content: flex-start;
		gap: 20px;;
	}
}

</style>