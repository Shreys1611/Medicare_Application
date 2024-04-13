const reminders = JSON.parse(localStorage.getItem('reminders')) || [];

function sendNotification(reminder) {
    // Example: Sending a notification via email
    const userEmail = 'shreys1611@gmail.com'; // Replace with the user's email
    const subject = 'Medication Reminder';
    const message = `It's time to take your ${reminder.name} medication at ${reminder.time}.`;

    // Example: Use an email service API to send an email
    // Implement similar functionalities for SMS or push notifications
    fetch('https://exampleemailapi.com/send', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: userEmail, subject, message }),
    })
        .then(response => {
            if (response.ok) {
                console.log('Notification sent successfully.');
            } else {
                throw new Error('Notification not sent.');
            }
        })
        .catch(error => {
            console.error('Error sending notification:', error);
        });
}

function setReminder() {
    const medName = document.getElementById('medName').value;
    const medTime = document.getElementById('medTime').value;
    const frequencyHours = parseInt(document.getElementById('frequency').value);
    const frequencyDays = parseInt(document.getElementById('frequencyDays').value);

    if (medName.trim() !== '' && medTime.trim() !== '' && (frequencyHours > 0 || frequencyDays > 0)) {
        const reminder = {
            name: medName,
            time: medTime,
            frequencyHours: frequencyHours,
            frequencyDays: frequencyDays
        };

        reminders.push(reminder);

        if (frequencyHours < 24) {
            for (let i = 1; i <= Math.floor(24 / frequencyHours); i++) {
                const repeatTime = addHours(medTime, frequencyHours * i);
                const repeatReminder = {
                    name: medName,
                    time: repeatTime,
                    frequencyHours: frequencyHours,
                    frequencyDays: frequencyDays
                };
                reminders.push(repeatReminder);
            }
        } else if (frequencyDays > 0) {
            const expirationTime = new Date().getTime() + frequencyDays * 24 * 60 * 60 * 1000;
            const expirationReminder = {
                name: medName,
                time: new Date(expirationTime).toLocaleTimeString(),
                frequencyDays: frequencyDays
            };
            reminders.push(expirationReminder);
        }

        localStorage.setItem('reminders', JSON.stringify(reminders));
        displayReminders();
        clearInputFields();

        // Request permission for notifications
        if (Notification.permission !== 'granted') {
            Notification.requestPermission();
        }

        // Schedule a notification (similar logic as before)
        const time = new Date().getTime() + (frequencyHours * 60 * 60 * 1000) + (frequencyDays * 24 * 60 * 60 * 1000);
        const notificationMessage = `Time to take your ${medName} medication!`;

        setTimeout(() => {
            if (Notification.permission === 'granted') {
                new Notification('Medication Reminder', { body: notificationMessage });
                playSound('C:\Users\shers\Desktop\Coding\HTML\images\notification.mp3');
            }
        }, time);
    }
    updateDashboard();
    sendNotification(reminders);
}

function addHours(time, hours) {
    const [hour, minute] = time.split(':');
    const date = new Date(0, 0, 0, hour, minute);
    date.setHours(date.getHours() + hours);
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function playSound(soundFile) {
    const audio = new Audio(soundFile);
    audio.play();
}

function displayReminders() {
    const reminderList = document.getElementById('reminderList');
    reminderList.innerHTML = '';

    reminders.forEach((reminder, index) => {
        const reminderItem = document.createElement('div');
        reminderItem.classList.add('reminder-item');

        const frequencyText = reminder.frequencyHours
            ? `Every ${reminder.frequencyHours} hour(s)`
            : reminder.frequencyDays
            ? `Every ${reminder.frequencyDays} day(s)`
            : '';

        reminderItem.innerHTML = `
            <strong>${reminder.name}</strong> - ${reminder.time} - ${frequencyText}
            <input type="number" placeholder="Dosage taken" onchange="updateDosageTaken(${index}, this.value)">
            <button onclick="editReminder(${index})">Edit</button>
            <button onclick="deleteReminder(${index})">Delete</button>
        `;

        reminderList.appendChild(reminderItem);
    });

    updateDashboard();
}

function clearInputFields() {
    document.getElementById('medName').value = '';
    document.getElementById('medTime').value = '';
    document.getElementById('frequency').value = '1';
}

function deleteReminder(index) {
    reminders.splice(index, 1);
    localStorage.setItem('reminders', JSON.stringify(reminders));
    displayReminders();
    updateDashboard();
}

function showAbout() {
    alert('This is a Medication Reminder Web Application. It helps you schedule and receive reminders for your medication.');
}

function showInstructions() {
    alert('To set a reminder, enter the medication name, time, and frequency. Then click "Set Reminder".');
}

function updateDosageTaken(index, dosageTaken) {
    reminders[index].dosageTaken = dosageTaken; // Add a dosageTaken property to reminders

    // Update local storage and refresh the display
    localStorage.setItem('reminders', JSON.stringify(reminders));
    displayReminders();
    updateDashboard();
}

function editReminder(index) {
    const medName = document.getElementById('medName');
    const medTime = document.getElementById('medTime');
    const frequency = document.getElementById('frequency');

    medName.value = reminders[index].name;
    medTime.value = reminders[index].time;
    frequency.value = reminders[index].frequency;

    reminders.splice(index, 1);
    localStorage.setItem('reminders', JSON.stringify(reminders));
    displayReminders();
}

function updateReminder(index) {
    const medName = document.getElementById('medName').value;
    const medTime = document.getElementById('medTime').value;
    const frequency = parseInt(document.getElementById('frequency').value);

    if (medName.trim() !== '' && medTime.trim() !== '' && frequency > 0) {
        const reminder = {
            name: medName,
            time: medTime,
            frequency: frequency
        };

        reminders.splice(index, 0, reminder);
        localStorage.setItem('reminders', JSON.stringify(reminders));
        displayReminders();
        clearInputFields();
    }
}

function updateDashboard() {
    const totalReminders = reminders.length;
    document.getElementById('totalReminders').innerText = reminders.length;

    const currentTime = new Date().getTime();
    const upcomingReminders = reminders.filter(reminder => new Date(reminder.time).getTime() > currentTime).length;

    document.getElementById('upcomingReminders').innerText = upcomingReminders;

    const upcomingList = document.getElementById('upcomingList');
    upcomingList.innerHTML = '';

    const upcomingRemindersList = reminders.filter(reminder => new Date(reminder.time).getTime() > currentTime);
    upcomingRemindersList.forEach(reminder => {
        const listItem = document.createElement('li');
        listItem.innerText = `${reminder.name} - ${reminder.time}`;
        upcomingList.appendChild(listItem);
    });
}

function checkExpiredReminders() {
    const currentTime = new Date().getTime();

    const validReminders = reminders.filter(reminder => {
        const expirationTime = new Date(reminder.time).getTime() + (reminder.frequencyDays || 0) * 24 * 60 * 60 * 1000;
        return reminder.frequencyDays ? expirationTime > currentTime : true;
    });

    reminders.length = 0;
    reminders.push(...validReminders);

    localStorage.setItem('reminders', JSON.stringify(reminders));
    displayReminders();
    updateDashboard();
}

function showPhoneNumbers() {
    const phoneNumbers = document.getElementById('phoneNumbers');
    phoneNumbers.style.display = 'block';
}

function togglePhoneNumbers() {
    const phoneNumbers = document.getElementById('phoneNumbers');
    phoneNumbers.style.display = (phoneNumbers.style.display === 'none') ? 'block' : 'none';
}

function saveItemList(itemList) {
    localStorage.setItem('itemList', JSON.stringify(itemList));
}

function loadItemList() {
    return JSON.parse(localStorage.getItem('itemList')) || [];
}

function displayItemList() {
    const itemList = loadItemList();
    const itemListContainer = document.getElementById('itemListContainer');

    // Clear previous items
    itemListContainer.innerHTML = '';

    // Display items
    const listContainer = document.createElement('div');
    listContainer.classList.add('list-container');

    const heading = document.createElement('h2');
    heading.textContent = 'Medicine List';
    listContainer.appendChild(heading);

    itemList.forEach((item, index) => {
        const listItem = document.createElement('div');
        listItem.classList.add('item-list-item');

        const itemText = document.createElement('span');
        itemText.textContent = `${index + 1}. ${item}`;
        listItem.appendChild(itemText);

        const removeButton = document.createElement('button');
        removeButton.textContent = 'Remove';
        removeButton.onclick = () => removeItemFromList(index);
        listItem.appendChild(removeButton);

        listContainer.appendChild(listItem);
    });

    itemListContainer.appendChild(listContainer);
}

function addItemToList() {
    const newItem = prompt('Enter a new item:');
    if (newItem) {
        const itemList = loadItemList();
        itemList.push(newItem);
        saveItemList(itemList);
        displayItemList();
    }
}

function removeItemFromList(index) {
    const itemList = loadItemList();
    itemList.splice(index, 1);
    saveItemList(itemList);
    displayItemList();
}

setInterval(checkExpiredReminders, 600000000);

displayReminders();
updateDashboard();