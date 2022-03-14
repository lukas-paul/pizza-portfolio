<script>


</script>


<div class="info">
    <div class=location-text>
        <div class="location-section">
            <h2>Find us!</h2>
            <p>Münchenstraße 13</p>
            <p>11234 München</p>
        </div>
        <div class="contact-section">
            <h2>Contact us!</h2>
            <div class="contact-line">
                <img class="logo" src="phone.png" alt="phone">
                <p>+49 170 500500</p>
            </div>
            <p>@ lagrandepizza@gmail.com</p>
        </div>
    </div>
    <div class="map-container">
        <iframe class="map" title="location-maps" src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2429.3360989642433!2d13.423634515850193!3d52.49115537980871!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47a84fa01131b745%3A0x6074469a15bb99e4!2sGazzo!5e0!3m2!1sen!2sde!4v1646829968220!5m2!1sen!2sde" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy"></iframe>
    </div>
    
</div>




<style>
.info {
    height: 100%;
    background-color: rgba(0,0,0,0.5);
    color: white;
    font-size: 20px;
    font-family: Helvetica;
    padding: 10px;
    overflow-y: auto;
    display: grid;
    grid-template-columns: 1fr 1fr;

}

.location-text {
    grid-column: 1;
}

.location-section, .contact-section {
    
    padding: 10px;
    display: flex;
    flex-direction: column;
}

.location-text, .contact-line>p {
    font-size: smaller;
}

.map-container {
    grid-column: 2;
    position: relative;
    width: 100%;
    height: 100%;
}

.map {
    position: absolute;
    top:50%;
    left: 50%;
    transform: translate(-50%, -50%);
    height: 70%;
    width: 90%;
    
}

.logo {
    height: 15px;
}

.contact-line {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 10px;
}

h2 {
    margin: 10px;
    margin-left: 0px;
}
p {
    margin: 5px;
    margin-left: 0px;
}

@media (max-width: 500px) {
    .info {
       display: block;
    }

    .map-container {
        width: 100%;
        grid-row: 2;
        grid-column: 2;
    }

    .map {
        height: auto;
    }
}
</style>
