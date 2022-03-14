<script>
import { createEventDispatcher } from 'svelte';
const dispatch = createEventDispatcher();

let loginData = {};
let loginFail = false;

const sendLoginData = () => {
    fetch("/send-login-data", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(loginData)
        }).then((result)=> {
            return result.json()
        }).then((result)=> {
            console.log("login success? ", result)
            if(result.success) {
                dispatch('login-success')
            } else {
                loginFail=true;
            }
            
        })
}


</script>

<div class="login">
    <div class="login-area">
        <h2>Login</h2>
        <input type="text" placeholder="user" on:input={(e) => loginData.user = e.target.value}>
        <input type="password" placeholder="password" on:input={(e) => loginData.password = e.target.value}>
        <button on:click={sendLoginData}>submit</button>
        {#if loginFail}
            <p>Name and/or password incorrect</p>
        {/if}
    </div>
</div>

<style>
    .login {
        background-color: white;
        width:100%;
        height: 100%;
    }

    .login-area {
        position: absolute;
        display: flex;
        flex-direction: column;
        align-items: center;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
    }

    input {
        font-family: Helvetica;
    }

</style>