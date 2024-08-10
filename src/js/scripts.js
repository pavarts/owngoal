// Example data, ideally fetched from a server
fetch('http://localhost:3000/matches')
    .then(response => response.json())
    .then(data => {
        console.log(data);  // Process this data to update your webpage dynamically
        // For example, you might update the DOM to display match details
        updateMatchTable(data);
    })
    .catch(error => console.error('Error fetching matches:', error));

//TODO look up date-fns which is apparently better when dealing with multiple time zones and locales - this could be a better option than the date/time conversion functions below
//* Used to format dates into MM/DD
function formatDate(dateString) {
    const date = new Date(dateString);
    const month = date.getMonth() + 1; // getMonth() is zero-indexed
    const day = date.getDate();
    return `${month}/${day}`; // Returns the date in MM/DD format
}

//* Used to format UTC date + time to local time for user
function formatTime(utcDateString, utcTimeString) {
    // Assuming utcDateString is 'YYYY-MM-DD' and utcTimeString is 'HH:MM'
    const dateTimeString = `${utcDateString}T${utcTimeString}:00Z`; // 'Z' denotes UTC time
    const date = new Date(dateTimeString);

    // toLocaleTimeString can be used to format the time in a user-friendly way
    // You can specify options to customize the output
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
}

//* Populates the upcoming matches table
function updateMatchTable(matches) {
    const table = document.getElementById('matches-list');
    table.innerHTML = '';

    matches.forEach(match => {
        const row = table.insertRow();
        row.classList.add("align-middle");  // Ensure rows align their content vertically

        let cell = row.insertCell(0);
        cell.innerHTML = `<div class="inline-flex items-center justify-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-pink-700/10">
                            ${match.competition}
                          </div>`;
        cell.classList.add("text-center", "align-middle");

        cell = row.insertCell(1);
        cell.innerHTML = `<span class="logo mr-3">${match.a_team_logo}</span>${match.a_team}`;
        cell.classList.add("font-semibold", "text-right", "align-middle");

        cell = row.insertCell(2);
        cell.textContent = " vs ";
        cell.classList.add("font-normal", "text-center", "align-middle");

        cell = row.insertCell(3);
        cell.innerHTML = `<span class="logo mr-3">${match.b_team_logo}</span>${match.b_team}`;
        cell.classList.add("font-semibold", "text-left", "align-middle");

        let dateCell = row.insertCell(4);
        dateCell.textContent = formatDate(match.date);
        dateCell.classList.add("font-semibold", "text-right", "align-middle");

        let atCell = row.insertCell(5);
        atCell.textContent = " @ ";
        atCell.classList.add("font-normal", "text-center", "align-middle");

        let timeCell = row.insertCell(6);
        timeCell.textContent = formatTime(match.date, match.time);
        timeCell.classList.add("font-semibold", "text-left", "align-middle");

        const actionCell = row.insertCell(7);
        const button = document.createElement('button');
        button.textContent = 'Find a bar -->';
        button.classList.add("hover:bg-blue-500", "hover:bg-opacity-40", "text-white", "font-bold", "py-2", "px-4", "rounded");
        actionCell.appendChild(button);
        actionCell.classList.add("text-right", "pr-4", "align-middle");
    });
}


        //row.insertCell(3).innerHTML = match.sound ? '<i class="fas fa-volume-up"></i>' : '<i class="fas fa-volume-mute"></i>'; //this was for sound 