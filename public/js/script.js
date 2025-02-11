const gameContainer = document.getElementById("games-container");

const checkAuthenticated = async () => {
    try {
        const response = await fetch("/auth-status");
        const data = await response.json();
        return data.isAuthenticated;
    } catch (err) {
        console.error("Error checking auth status:", err);
        return false;
    }
};

//Event listener for delete button
document.addEventListener("click", async (event) => {
    if (event.target.classList.contains("delete-btn")) {
        const isAuthenticated = await checkAuthenticated();
        if (!isAuthenticated) {
            window.location.href = "/html/login.html";
            return;
        }

        const gameId = event.target.getAttribute("data-id");
        try {
            const response = await fetch(`/deletegame/${gameId}`, { method: "DELETE" });
            if (!response.ok) throw new Error("Failed to delete game");

            fetchGames(); // Refresh the game list
        } catch (err) {
            console.error("Error deleting game:", err);
        }
    }
});

//event listener for add button
document.addEventListener("click", async (event) =>{
    if(event.target.classList.contains("add-button")){
        const isAuthenticated = await checkAuthenticated();
        if (!isAuthenticated) {
            window.location.href = "/html/login.html";
            return;
        }
    }
});

const fetchGames = async ()=>{
    try{
        //Fetch data from server
        const response = await fetch("/Games");
        if(!response.ok)
        {
            throw new Error("Failed to get games");
        }

        //Parse json
        const games = await response.json();

        //Format data to html
        gameContainer.innerHTML = "";

        //added a counter to allow it to order the items dynamically no matter how many there are
        var ctr = 0;
        games.forEach((game) => {
            ctr++;
            const gameDiv = document.createElement("div");
            gameDiv.className = "game";
            gameDiv.innerHTML = `${ctr}. ${game.Name} 
            <a href="editgame.html?id=${game._id}"><button class="update-btn">Update</button></a>
            <button class="delete-btn" data-id="${game._id}">Delete</button> <br> Developer: ${game.Developer} <br>`;
            gameContainer.appendChild(gameDiv);
        });

        //Protect update button
        document.addEventListener("click", async (event) => {
            if (event.target.classList.contains("update-btn")) {
                const isAuthenticated = await checkAuthenticated();
                if (!isAuthenticated) {
                    event.preventDefault(); // Prevent navigation
                    window.location.href = "/html/login.html";
                }
            }
        });

        
    }catch(err){
        console.error("Error: ", err)
        userContainer.innerHTML = "<p style='color:red'>Failed to get games</p>";
    }
}

fetchGames();