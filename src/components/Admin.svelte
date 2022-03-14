<script>
    import Login from "../components/Login.svelte"
    let loggedIn = false;

    let selectedReviews = [];
    let notSelectedReviews = [];
    const getReviews = () => {
        fetch("/reviews").then((results)=> {
        console.log("review results: ", results)
        return results.json()
    }).then((results)=> {
        console.log("result from reviews:", results);
        let notSelectedArr = [];
        let selectedArr = [];
        results.forEach((review)=> {
            console.log("review: ", review.selected)
            if(review.selected === "true") {
                selectedArr.push(review);
                selectedReviews = selectedArr;
            } else { 
               notSelectedArr.push(review)
               notSelectedReviews = notSelectedArr;
            }
            console.log("not selected Reviews: ", notSelectedReviews);
        })
    })
    }
    getReviews()
    

    let selectedMenuItems = [];
    let notSelectedMenuItems = [];

    const getMenuItems = () => {
    fetch("/menu-items").then((results)=> {
        console.log(results)
        return results.json()
    }).then((results)=> {
        console.log("result from reviews:", results);
        let notSelectedArr = [];
        let selectedArr = [];
        results.forEach((item)=> {
            if(item.selected === "true") {
                selectedArr.push(item);
                selectedMenuItems = selectedArr;
            } else { 
               notSelectedArr.push(item)
               notSelectedMenuItems = notSelectedArr;
            }
            console.log("not selected Reviews: ", notSelectedReviews);
        })
    })
    }
    getMenuItems();

    const selectReviews = () => {
        let inputElements = document.getElementsByClassName('checkbox');
        //console.log("checkedValue: ", checkedValue[3].value);
        let checkedValue = [];
        for(let i=0; inputElements[i]; i++){
            if(inputElements[i].checked){
                checkedValue.push(inputElements[i].value);
            }
        }
        console.log("selected ids: ", checkedValue)
        let selectedReviews = { selected: checkedValue}
        fetch("/update-selected", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(selectedReviews)
        })
    }

    const selectMenuItems = () => {
        let inputElements = document.getElementsByClassName('checkbox_menu');
        console.log("inputElements: ", inputElements);
        let checkedValue = [];
        for(let i=0; inputElements[i]; i++){
            if(inputElements[i].checked){
                checkedValue.push(inputElements[i].value);
            }
        }
        console.log("selected ids: ", checkedValue)
        let selectedMenuItems = { selected: checkedValue}
        fetch("/update-selected-menu", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(selectedMenuItems)
        })
    }

    let newItem = {};
    const addItemToMenu = () => {
        let publish = document.getElementById("checkbox-id").checked     
        publish ? newItem.selected = "true" : newItem.selected = "false";
        
        fetch("/add-menu-item", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(newItem)
        })
        
    }

    const setLogginIn = () => {
        loggedIn = true;
    }

</script>
{#if !loggedIn}
    <Login on:login-success={setLogginIn}/>
    {/if}
 {#if loggedIn}
<main>
    <h2>Reviews</h2>
    <div class="reviews">
        <img class="reload-icon" src="reload.png" alt="" on:click={getReviews}>
        <h2>Unpublished Reviews</h2>
        <div class="review-list">
            {#each notSelectedReviews as review}
                 <div class="review">
                     <div class="review-text">
                        <p class="title-text">{review.username}</p>
                        <p>{review.review}</p>
                    </div> 
                    <div class="review-select">
                        <input class="checkbox" type="checkbox" value={review.id}>
                    </div>
                </div>  
        {/each}
        </div>
        <h2>Published Reviews</h2>
        <div class="review-list">
            {#each selectedReviews as review}
                 <div class="review">
                     <div class="review-text">
                        <p class="title-text">{review.username}</p>
                        <p>{review.review}</p>
                    </div> 
                    <div class="review-select">
                        <input class="checkbox" type="checkbox" value={review.id}>
                    </div>
                </div>  
            {/each}
        </div>
    <button class="select-reviews" on:click={selectReviews}>Select Reviews</button>
    </div>
     <h2>Menu</h2>
    <div class="Menu">
   
    <div class="new-item">
        <h3>New Item</h3>
        <input type="text" placeholder="Name" on:input={(e) => newItem.name = e.target.value}>
        <input type="text" placeholder="Ingredients" on:input={(e) => newItem.ingredients = e.target.value}>
        <input type="number" placeholder="Price" on:input={(e) => newItem.price = e.target.value}>
        <input class="checkbox" type="checkbox" id="checkbox-id">
        <label for="checkbox-id"> Publish?</label>
        <button on:click={addItemToMenu}>Add new menu item</button>
    </div>

    <div class="menu-selection">
        <img class="reload-icon" src="reload.png" alt="" on:click={getMenuItems}>
            <div class="review-list">
                <h3>Published Menu Items</h3>
                {#each selectedMenuItems as item}
                 <div class="item">
                     <div class="item-text">
                        <p class="title-text">{item.name}</p>
                        <p>{item.ingredients}</p>
                        <p>{item.price}</p>
                    </div> 
                    <div class="review-select">
                        <input class="checkbox_menu" type="checkbox" value={item.id} checked=true>
                    </div>
                </div>  
                {/each}
            </div>
            <div class="review-list">
                <h3>Unpublished Menu Items</h3>
                {#each notSelectedMenuItems as item}
                 <div class="item">
                     <div class="item-text">
                        <p class="title-text">{item.name}</p>
                        <p>{item.ingredients}</p>
                        <p>{item.price}</p>
                    </div> 
                    <div class="review-select">
                        <input class="checkbox_menu" type="checkbox" value={item.id}>
                    </div>
                </div>  
                {/each}
            </div> 
        <button on:click={selectMenuItems}>Save Changes</button>
    </div>
  
</main>
{/if}

<style>

    main {
        display: flex;
        flex-direction: column;
        align-items: center;
        background-color: #C0CAD3;
    }

    .reviews, .menu-selection, .new-item {
        position: relative;
        width: 80vw;
        font-family: Arial, Helvetica, sans-serif;
        background-color: white;
        border: 1px solid black;
        border-radius: 10px;
        display: flex;
        flex-direction: column;
        align-items: center;
        margin: 10px;
    }

    .review-list {
        width: 80%;
        height: 30%;
    }

    .review, .item {
        display: flex;
        border: 1px solid black
    }
    .review-text, .item-text {
        width: 80%;
        padding: 5px;
    }
    .review-select {
        position: relative;
        width: 20%;
        border-left: 1px solid black;
    }
    .review-select>input {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
    }

    .title-text {
        font-weight: bold;
    }

    .reload-icon {
        height: 20px;
        width: 20px;
        position: absolute;
        top: 10px;
        right: 20px;
        cursor: pointer;
    }

</style>