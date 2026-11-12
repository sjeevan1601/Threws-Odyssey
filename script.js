document.addEventListener("DOMContentLoaded", () => {
    const toggleButtons = document.querySelectorAll(".toggle-btn");
    const planButton = document.querySelector(".plan-btn");
    const form = document.querySelector(".planner-form");
    const navItems = document.querySelectorAll(".nav-item");
    let travelType = "Domestic";

    toggleButtons.forEach((button, index) => {
        button.addEventListener("click", () => {
            toggleButtons.forEach(btn =>
                btn.classList.remove("active")
            );
            button.classList.add("active");
            travelType = index === 0
                ? "Domestic"
                : "International";
            console.log("Travel Type:", travelType);
        });
    });

    navItems.forEach(item => {
        item.addEventListener("click", (event) => {
            const href = item.getAttribute("href");
            if (href === "#") {
                event.preventDefault();
                navItems.forEach(nav =>
                    nav.classList.remove("active")
                );
                item.classList.add("active");
            }
        });
    });
    const recommendations = {
        adventure: [
            "Explore adventure activities",
            "Visit mountain destinations",
            "Discover trekking experiences"
        ],

        beaches: [
            "Explore beautiful beaches",
            "Discover coastal destinations",
            "Enjoy relaxing seaside activities"
        ],

        culture: [
            "Visit historical monuments",
            "Explore cultural attractions",
            "Discover heritage destinations"
        ],

        foodie: [
            "Explore local restaurants",
            "Discover famous street food",
            "Visit popular food destinations"
        ],

        nature: [
            "Explore wildlife destinations",
            "Visit beautiful nature parks",
            "Discover scenic locations"
        ]
    };

    if (planButton) {
        planButton.addEventListener("click", () => {

            const inputs = form.querySelectorAll("input");

            const from = inputs[0].value.trim();
            const to = inputs[1].value.trim();
            const budget = inputs[2].value.trim();
            const travellers = inputs[3].value.trim();

            const interest = form.querySelectorAll("select")[0].value;
            const days = form.querySelectorAll("select")[1].value;

            if (!from || !to || !budget || !travellers ||
                !interest || !days) {

                alert("Please fill in all the travel details!");
                return;
            }

            if (from.toLowerCase() === to.toLowerCase()) {
                alert("Departure and destination cannot be the same!");
                return;
            }

            if (
                !Number.isFinite(Number(budget)) ||
                Number(budget) <= 0 ||
                !Number.isInteger(Number(travellers)) ||
                Number(travellers) <= 0
            ) {
                alert("Please enter a valid budget and number of travellers.");
                return;
            }

            const trip = {
                id: Date.now(),
                travelType: travelType,
                from: from,
                to: to,
                budget: Number(budget),
                travellers: Number(travellers),
                interest: interest,
                days: Number(days)
            };

            let savedTrips = JSON.parse(
                localStorage.getItem("wanderWaysTrips") || "[]"
            );

            savedTrips.push(trip);

            localStorage.setItem(
                "wanderWaysTrips",
                JSON.stringify(savedTrips)
            );

            const suggestions = recommendations[interest];

            displayTripPlan(trip, suggestions);

        });
    }

    function displayTripPlan(trip, suggestions) {

        let resultSection = document.getElementById("trip-results");

        if (!resultSection) {

            resultSection = document.createElement("section");

            resultSection.id = "trip-results";

            resultSection.style.cssText = `
                position: relative;
                z-index: 10;
                max-width: 900px;
                margin: 30px auto;
                padding: 30px;
                background: rgba(18, 30, 55, 0.85);
                backdrop-filter: blur(20px);
                border: 1px solid rgba(255,255,255,0.2);
                border-radius: 24px;
                color: white;
                text-align: left;
            `;

            document.querySelector(".hero-container")
                .appendChild(resultSection);
        }

        resultSection.innerHTML = `
            <h2 style="text-align:center; margin-bottom:20px;">
                ✈️ Your Trip Plan
            </h2>

            <h3 style="margin-bottom:15px;">
                ${escapeHTML(trip.from)}
                → 
                ${escapeHTML(trip.to)}
            </h3>

            <p>🌍 Travel Type: ${trip.travelType}</p>
            <p>💰 Budget: ₹${trip.budget.toLocaleString("en-IN")}</p>
            <p>👥 Travellers: ${trip.travellers}</p>
            <p>📅 Duration: ${trip.days} Days</p>

            <hr style="margin:20px 0; opacity:0.3;">

            <h3>Recommended Experiences</h3>

            <ul style="padding:20px;">
                ${suggestions.map(item =>
                    `<li style="margin-bottom:12px;">
                        \${escapeHTML(item)}
                    </li>`
                ).join("")}
            </ul>

            <p style="margin-top:15px; color:#93c5fd;">
                Your trip details have been saved!
            </p>

            <button id="view-travels"
                style="
                    margin-top:20px;
                    padding:12px 25px;
                    background:#0056ff;
                    color:white;
                    border:none;
                    border-radius:10px;
                    cursor:pointer;
                ">
                View My Travels
            </button>
        `;

        document.getElementById("view-travels")
            .addEventListener("click", showSavedTrips);

        resultSection.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }


    // 6. View Saved Trips

    function showSavedTrips() {

        const savedTrips = JSON.parse(
            localStorage.getItem("wanderWaysTrips") || "[]"
        );

        if (savedTrips.length === 0) {
            alert("No saved trips found!");
            return;
        }

        const resultSection = document.getElementById("trip-results");

        resultSection.innerHTML = `
            <h2 style="text-align:center;">
                🧳 My Travels
            </h2>

            ${savedTrips.map(trip => `
                <div style="
                    background:rgba(255,255,255,0.08);
                    padding:18px;
                    margin-top:15px;
                    border-radius:12px;
                ">
                    <h3>
                        \${escapeHTML(trip.from)}
                        → 
                        \${escapeHTML(trip.to)}
                    </h3>

                    <p>Travel Type: \${trip.travelType}</p>
                    <p>Budget: ₹\${trip.budget.toLocaleString("en-IN")}</p>
                    <p>Travellers: \${trip.travellers}</p>
                    <p>Duration: \${trip.days} Days</p>
                </div>
            `).join("")}

            <button id="back-to-home"
                style="
                    margin-top:20px;
                    padding:12px 25px;
                    background:#0056ff;
                    color:white;
                    border:none;
                    border-radius:10px;
                    cursor:pointer;
                ">
                Back to Trip Plan
            </button>
        `;

        document.getElementById("back-to-home")
            .addEventListener("click", () => {
                document.getElementById("trip-results")
                    .scrollIntoView({ behavior: "smooth" });
            });
    }

    function escapeHTML(value) {
        return String(value).replace(/[&<>"']/g, char => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[char]);
    }

});