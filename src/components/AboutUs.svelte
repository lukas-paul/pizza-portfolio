<script>

import { slide, fade } from 'svelte/transition';
import Message from "../components/Message.svelte"
import Menu from "../components/Menu.svelte"
import Location from "../components/Location.svelte"

let selectedReviews = [];
fetch("/reviews").then((results)=> {
        console.log("review results: ", results)
        return results.json()
    }).then((results)=> {
        console.log("result from reviews:", results);
        let selectedArr = [];
        results.forEach((review)=> {
            console.log("review: ", review.selected)
            if(review.selected === "true") {
                selectedArr.push(review);
                selectedReviews = selectedArr;
            } else { 
               return
            }
        })
    })


  let i = 0;
  let reviewOnScreen = false;
  setInterval(() => {
      if (!reviewOnScreen) { 
      reviewOnScreen = selectedReviews[i]
      if (i<=selectedReviews.length) {
        i++
        } else {
          i=0;
        }
    } else {
        reviewOnScreen = !reviewOnScreen
    }
  }, 3000);
    //$: reviewOnScreen = reviewOnScreen
  

let message = false;
const toggleMessage = () => {
    message = !message;
}

</script>
    <div class="review-section">
         {#if reviewOnScreen}
        <div transition:fade class="review">
            <h2 >"{reviewOnScreen.review}"</h2>
            <p>{reviewOnScreen.username}</p>
        </div>
        {/if}  
    </div> 
    <p class="open-review" on:click={toggleMessage}>
        Leave a review
        
    </p>
     {#if message}
		    <Message on:close-message={toggleMessage}/>
	    {/if}
    <div class="menu-section">
        <Menu/>
    </div>

     <div class="location-section">
        <Location/>
    </div>


<style>
    .review-section {
        height: 80vh;
        position: relative;
        overflow-y: auto;
    }

    .menu-section {
        height: 80vh;
        width: 80%;
        position: relative;
        overflow-y: auto;
        left: 50%;
        transform: translateX(-50%);
        margin: 20px;

    }

    .location-section {
        height: 40vh;
        width: 80%;
        position: relative;
        overflow-y: auto;
        left: 50%;
        transform: translateX(-50%);
        margin: 20px;
    }
    

    @import url('https://fonts.googleapis.com/css2?family=Rubik+Mono+One&display=swap');
    .review {
        position: absolute;
        color: white;
        font-family: 'Rubik Mono One', sans-serif;
        z-index: 1000;
        background-color: rgba(0,0,0, 0.5);
        top: 5px;
        left: 5px;
        max-width: 50%;   
    }

    .open-review {
        position: absolute;
        color: white;
        font-family: 'Rubik Mono One', sans-serif;
        background-color: rgba(0,0,0, 0.9);
        height: 30px;
        z-index: 1000;
        bottom: 10px;
        right: 10px;
        cursor: pointer;
        padding: 5px;
        text-align: center;
        margin: 0px;
    }

    h2, p {
        font-size: 20px;
    }
</style>