document.addEventListener("DOMContentLoaded", () => {

    document.querySelectorAll(".explore-section").forEach(section => {

        const toggleButton = section.querySelector(".filter-toggle");
        const filterPanel = section.querySelector(".filter-panel");
        const closeButton = section.querySelector(".close-filter");
        const applyButton = section.querySelector(".apply-filter");
        const clearButton = section.querySelector(".clear-filter");
        toggleButton.addEventListener("click", () => {
            filterPanel.classList.add("open");
            section.classList.add("filters-open");
        });

        closeButton.addEventListener("click", () => {
            filterPanel.classList.remove("open");
            section.classList.remove("filters-open");
        });

        applyButton.addEventListener("click", () => {
            applyFilters(section);
            filterPanel.classList.remove("open");
            section.classList.remove("filters-open");
        });

        clearButton.addEventListener("click", () => {
            filterPanel.querySelectorAll('input[type="checkbox"]')
                .forEach(input => input.checked = false);

            applyFilters(section);
        });

        const scopeButtons = section.querySelectorAll(".scope-btn");

        scopeButtons.forEach(button => {

            button.addEventListener("click", () => {

                scopeButtons.forEach(btn =>
                    btn.classList.remove("active")
                );

                button.classList.add("active");

                applyFilters(section);
            });

        });

        applyFilters(section);

    });

    function applyFilters(section) {

        const activeScopeButton =
            section.querySelector(".scope-btn.active");

        const selectedScope = activeScopeButton.dataset.scope;

        const filterPanel = section.querySelector(".filter-panel");

        const filterGroups = Array.from(
            filterPanel.querySelectorAll(".filter-group")
        );

        const selectedGroups = filterGroups.map(group => {

            return Array.from(
                group.querySelectorAll('input[type="checkbox"]:checked')
            ).map(input => input.value);

        }).filter(group => group.length > 0);

        const cards = section.querySelectorAll(".destination-card");

        cards.forEach(card => {

            const cardScope = card.dataset.scope;

            const cardTags = (card.dataset.tags || "")
                .toLowerCase()
                .split(/\s+/);

            let matchesScope = cardScope === selectedScope;

            let matchesFilters = selectedGroups.every(group => {

                return group.some(value =>
                    cardTags.includes(value.toLowerCase())
                );

            });
            if (matchesScope && matchesFilters) {
                card.classList.remove("hidden");
            } else {
                card.classList.add("hidden");
            }

        });

    }

    document.querySelectorAll(".card-info button").forEach(button => {

        button.addEventListener("click", () => {

            const card = button.closest(".destination-card");
            const title = card.querySelector("h3").textContent;

            alert("You selected: " + title);

        });

    });

});