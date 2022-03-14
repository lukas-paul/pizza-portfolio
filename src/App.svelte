<script>
	import Location from "./components/Location.svelte"
	import AboutUs from "./components/AboutUs.svelte"
	import Admin from "./components/Admin.svelte"
	import Menu from "./components/Menu.svelte"
 	import url from "./url"
	import { slide } from 'svelte/transition';

	let animation = true
	$: animation = animation

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
		<h2>La Pizzaria Grande</h2>
	</div>
	
	<div class="middle">
		{#if $url.hash === "#/aboutus"}
		<div transition:slide={{duration: 1000}}>
			<AboutUs />
			
		</div>
		{/if}
		
	</div>

	<div class="impressum">
		<div class="opening-hours">
			<p style="font-weight: bold">Opening Hours</p>
			<p>Monday — Sunday: 6pm — 11pm</p>
		</div>
		<div class="contact"></div>
	</div>

</main>
{/if}

<style>

main {
	display: grid;
	grid-template-rows: 10vh 80vh 10vh;
}

.headline {
	grid-row: 1;
	width: 100vw;
	text-align: center;
	background-color: black;
	color: white;
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
}

.nav {
	display: flex;
	flex-direction: row;
	justify-content: space-around;
	width: 30%;
	height: 30px;
	right: 10px;
	position: absolute;
}

@media (max-width: 500px) {
	main {
		display: grid;
		grid-template-rows: 20vh 60vh 10vh;
	}
}

</style>