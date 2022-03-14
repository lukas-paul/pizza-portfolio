<script>

let selectedMenuItems = [];
fetch("/menu-items").then((results)=> {
        console.log(results)
        return results.json()
    }).then((results)=> {
        console.log("result from reviews:", results);
        let selectedArr = [];
        results.forEach((item)=> {
            if(item.selected === "true") {
                selectedArr.push(item);
                selectedMenuItems = selectedArr;
            } else { 
               return
            }
        })
    })



</script>

<div class="menu">
    <h2>Our famous Pizzas</h2>
    <div class="menu-list">
        {#each selectedMenuItems as item}
                 <div class="item">
                     <div class="item-text">
                        <p style="font-weight: bold" class="title-text">{item.name} </p>
                        <p style="font-style: italic">{item.ingredients}</p>
                        <p>{item.price}</p>
                    </div> 
                </div>  
        {/each}
    </div>
    

</div>


<style>



.menu {
    background-color: white;
    color: black;
    font-size: 20px;
    font-family: Helvetica;
    padding: 10px;
    text-align: center;
    overflow-y: auto;
}

h2 {
    font-family: "Rubik Mono One", sans-serif;
}

.menu-list {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-evenly;
    width: 100%;
}

.item {
    display: flex;
    text-align: center;
}


</style>