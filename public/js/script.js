const gameContainer = document.getElementById("games-container");

//Event listener for delete button
document.addEventListener("click", async (event) => {
    if (event.target.classList.contains("delete-btn")) {
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
    }catch(err){
        console.error("Error: ", err)
        userContainer.innerHTML = "<p style='color:red'>Failed to get games</p>";
    }
}

fetchGames();