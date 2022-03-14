<script>
import { slide } from 'svelte/transition';
import {createEventDispatcher} from 'svelte';
const dispatch = createEventDispatcher();

let newReview = {};

const sendReview = () => {
    console.log("send review, ", newReview)
    fetch("/send-review", {
        method: "POST",
        headers: {
                "Content-Type": "application/json",
            },
        body: JSON.stringify(newReview)
    })  
    dispatch('close-message')
}
</script>

<div class="message" transition:slide>
    <p>Write a review</p>
    <textarea class="comment-box" maxlength="200" placeholder="your review" type="text" on:input={(e) => newReview.review = e.target.value}/>
    <input maxlength="200" placeholder="your name" type="text" on:input={(e) => newReview.username = e.target.value}/>
    <button on:click={sendReview}>Send</button>
</div>

<style>
    .message {
        position: absolute;
        bottom: 50px;
        right: 10px;
        height: 300px;
        width: 300px;
        background-color: rgba(0, 0, 0, 0.5);
        color: white;
        z-index: 1000;
        position: absolute;
        padding: 5px;
    }

    textarea, input {
        
        font-family: monospace;
        width: 90%;
    }

    textarea {     
        height: 50%;
        resize: none
    }

</style>