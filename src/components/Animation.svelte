<script>

import { slide, fade } from 'svelte/transition';


  let reviews = [{
      review: "text 1",
      username: "username 1"
  }, {
      review: "text 2",
      username: "username 2"
  }, {
      review: "text 3",
      username: "username 3"
  }]

  let reviewOnScreen;
  let i = 0;
  setInterval(() => {
      reviewOnScreen = reviews[i]
      if (i<=reviews.length-1) {
        i++
        } else {
          i=0;
        }
  }, 3000);
    $: reviewOnScreen = reviewOnScreen
  


</script>
<div>
    {#if reviewOnScreen}
    <div transition:fade class="review">
        <h2 >{reviewOnScreen.review}</h2>
        <p>***</p>
        <p>{reviewOnScreen.username}</p>
    </div>
      {/if}
</div>


<style>
    @import url('https://fonts.googleapis.com/css2?family=Rubik+Mono+One&display=swap');
    .review {
        position: absolute;
        color: black;
        font-family: 'Rubik Mono One', sans-serif;
        
    }
    h2 {
        font-size: 40px;
    }

</style>