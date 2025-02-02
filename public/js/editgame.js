document.addEventListener("DOMContentLoaded", async () => {
    // Get game ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const gameId = urlParams.get("id");

    if (!gameId) {
        alert("Game ID not found.");
        window.location.href = "games.html"; // Redirect if no ID is found
    }

    const nameInput = document.getElementById("Name");
    const developerInput = document.getElementById("Developer");
    const gameIdInput = document.getElementById("gameId");

    try {
        // Fetch game data
        const response = await fetch(`/getgame/${gameId}`);
        if (!response.ok) throw new Error("Game not found");

        const game = await response.json();

        // Populate form with game data
        nameInput.value = game.Name;
        developerInput.value = game.Developer;
        gameIdInput.value = game._id;
    } catch (err) {
        console.error("Error fetching game:", err);
    }

    // Handle form submission
    document.getElementById("edit-game-form").addEventListener("submit", async (event) => {
        event.preventDefault();

        const updatedGame = {
            Name: nameInput.value,
            Developer: developerInput.value
        };

        try {
            const response = await fetch(`/updategame/${gameId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedGame)
            });

            if (!response.ok) throw new Error("Failed to update game");

            alert("Game updated successfully!");
            window.location.href = "games.html"; // Redirect after update
        } catch (err) {
            console.error("Error updating game:", err);
        }
    });
});