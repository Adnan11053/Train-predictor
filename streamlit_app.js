<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mumbai Local Train Viewer</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            darkMode: 'class',
            theme: {
                extend: {
                    colors: {
                        primary: '#5D5CDE',
                        'primary-dark': '#4B4ABD',
                    }
                }
            }
        }
    </script>
    <style>
        .train-item {
            transition: all 0.3s ease;
        }
        .train-item:hover {
            transform: translateY(-2px);
        }
        .pulse {
            animation: pulse 2s infinite;
        }
        @keyframes pulse {
            0% {
                opacity: 0.7;
            }
            50% {
                opacity: 1;
            }
            100% {
                opacity: 0.7;
            }
        }
    </style>
</head>
<body class="bg-white dark:bg-gray-900 min-h-screen transition-colors duration-300">
    <div class="container mx-auto px-4 py-8 max-w-4xl">
        <header class="mb-8">
            <h1 class="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white text-center">
                Mumbai Local Train Viewer
            </h1>
            <p class="text-center text-gray-600 dark:text-gray-300 mt-2">
                Real-time arrivals and predictions for local trains
            </p>
            <div class="w-full flex justify-center mt-4">
                <div class="inline-flex rounded-md shadow-sm" role="group">
                    <button id="chunabhatti-btn" type="button" class="px-4 py-2 text-sm font-medium rounded-l-lg bg-primary text-white">
                        Chunabhatti
                    </button>
                    <button id="sion-btn" type="button" class="px-4 py-2 text-sm font-medium rounded-r-lg bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white hover:bg-primary hover:text-white dark:hover:bg-primary transition-colors">
                        Sion
                    </button>
                </div>
            </div>
        </header>

        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
            <div class="flex flex-col md:flex-row justify-between items-center mb-4">
                <h2 id="station-title" class="text-xl font-semibold text-gray-800 dark:text-white mb-2 md:mb-0">
                    Chunabhatti Station: Upcoming Trains
                </h2>
                <div class="flex items-center space-x-4">
                    <div class="relative">
                        <select id="line-filter" class="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-base rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5 appearance-none pr-8">
                            <option value="all" selected>All Lines</option>
                            <option value="central">Central Line</option>
                            <option value="harbour">Harbour Line</option>
                        </select>
                        <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead class="bg-gray-50 dark:bg-gray-800">
                        <tr>
                            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Train
                            </th>
                            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Destination
                            </th>
                            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Scheduled
                            </th>
                            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Predicted
                            </th>
                            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Status
                            </th>
                        </tr>
                    </thead>
                    <tbody id="train-list" class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        <!-- Train data will be inserted here -->
                        <tr>
                            <td colspan="5" class="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                                <div class="pulse">Loading train information...</div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-3">Live Updates</h3>
            <div id="updates-list" class="space-y-2 max-h-40 overflow-y-auto">
                <div class="text-sm text-gray-500 dark:text-gray-400">
                    Waiting for updates...
                </div>
            </div>
        </div>

        <div class="mt-4 text-center text-xs text-gray-500 dark:text-gray-400">
            <p>Last updated: <span id="last-update-time">Loading...</span></p>
            <p class="mt-1">Note: This is a simulation. Real train data would require integration with official Mumbai train APIs.</p>
        </div>
    </div>

    <script>
        // Check for dark mode preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.documentElement.classList.add('dark');
        }
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
            if (event.matches) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        });

        // Train data model for simulation
        class TrainSchedule {
            constructor() {
                this.currentStation = 'chunabhatti';
                this.stationData = {
                    chunabhatti: {
                        name: 'Chunabhatti',
                        trains: []
                    },
                    sion: {
                        name: 'Sion',
                        trains: []
                    }
                };
                
                this.lineFilter = 'all';
                this.updates = [];
                this.init();
            }

            init() {
                // Generate initial train schedules
                this.generateTrainSchedules();
                
                // Start the simulation
                this.startSimulation();
            }

            generateTrainSchedules() {
                // Clear existing trains
                this.stationData.chunabhatti.trains = [];
                this.stationData.sion.trains = [];
                
                // Generate trains for the next 2 hours
                const now = new Date();
                
                // Train lines and destinations
                const centralDestinations = ["CSMT", "Kalyan", "Thane", "Dadar", "Kurla"];
                const harbourDestinations = ["Panvel", "Vashi", "Andheri", "Belapur"];
                
                // Generate trains for Chunabhatti
                for (let i = 0; i < 15; i++) {
                    const scheduledTime = new Date(now.getTime() + (i * 8 + Math.random() * 4) * 60000);
                    const isHarbour = Math.random() > 0.5;
                    const line = isHarbour ? 'harbour' : 'central';
                    const destinations = isHarbour ? harbourDestinations : centralDestinations;
                    const destination = destinations[Math.floor(Math.random() * destinations.length)];
                    const trainNumber = (isHarbour ? 'H' : 'C') + Math.floor(1000 + Math.random() * 9000);
                    
                    // Random delay between -2 and 10 minutes
                    const randomDelay = Math.floor(Math.random() * 12) - 2;
                    const delayInMinutes = randomDelay < 0 ? 0 : randomDelay;
                    const predictedTime = new Date(scheduledTime.getTime() + delayInMinutes * 60000);
                    
                    this.stationData.chunabhatti.trains.push({
                        id: `train-${i}-chunabhatti`,
                        number: trainNumber,
                        line,
                        destination,
                        scheduled: scheduledTime,
                        predicted: predictedTime,
                        status: this.getTrainStatus(scheduledTime, predictedTime),
                        platform: Math.floor(Math.random() * 2) + 1
                    });
                }
                
                // Generate trains for Sion
                for (let i = 0; i < 15; i++) {
                    const scheduledTime = new Date(now.getTime() + (i * 7 + Math.random() * 5) * 60000);
                    const isHarbour = Math.random() > 0.6; // Lower probability of Harbour line at Sion
                    const line = isHarbour ? 'harbour' : 'central';
                    const destinations = isHarbour ? harbourDestinations : centralDestinations;
                    const destination = destinations[Math.floor(Math.random() * destinations.length)];
                    const trainNumber = (isHarbour ? 'H' : 'C') + Math.floor(1000 + Math.random() * 9000);
                    
                    // Random delay between -2 and 10 minutes
                    const randomDelay = Math.floor(Math.random() * 12) - 2;
                    const delayInMinutes = randomDelay < 0 ? 0 : randomDelay;
                    const predictedTime = new Date(scheduledTime.getTime() + delayInMinutes * 60000);
                    
                    this.stationData.sion.trains.push({
                        id: `train-${i}-sion`,
                        number: trainNumber,
                        line,
                        destination,
                        scheduled: scheduledTime,
                        predicted: predictedTime,
                        status: this.getTrainStatus(scheduledTime, predictedTime),
                        platform: Math.floor(Math.random() * 3) + 1
                    });
                }
                
                // Sort trains by scheduled time
                this.stationData.chunabhatti.trains.sort((a, b) => a.scheduled - b.scheduled);
                this.stationData.sion.trains.sort((a, b) => a.scheduled - b.scheduled);
            }

            getTrainStatus(scheduled, predicted) {
                const diffMs = predicted - scheduled;
                const diffMins = Math.floor(diffMs / 60000);
                
                if (diffMins <= 0) return 'On Time';
                if (diffMins <= 5) return 'Slight Delay';
                if (diffMins <= 15) return 'Delayed';
                return 'Significantly Delayed';
            }

            getStatusClass(status) {
                switch(status) {
                    case 'On Time': return 'text-green-500';
                    case 'Slight Delay': return 'text-yellow-500';
                    case 'Delayed': return 'text-orange-500';
                    case 'Significantly Delayed': return 'text-red-500';
                    default: return 'text-gray-500';
                }
            }

            startSimulation() {
                // Update the view initially
                this.updateView();
                
                // Update the clock
                setInterval(() => {
                    document.getElementById('last-update-time').textContent = new Date().toLocaleTimeString();
                }, 1000);
                
                // Update train predictions every 20 seconds
                setInterval(() => {
                    this.updatePredictions();
                    this.updateView();
                }, 20000);
                
                // Generate random updates every 15 seconds
                setInterval(() => {
                    this.generateRandomUpdate();
                }, 15000);
            }

            updatePredictions() {
                const now = new Date();
                
                // Update Chunabhatti trains
                this.stationData.chunabhatti.trains = this.stationData.chunabhatti.trains.filter(train => {
                    return train.predicted > now;
                });
                
                // Update Sion trains
                this.stationData.sion.trains = this.stationData.sion.trains.filter(train => {
                    return train.predicted > now;
                });
                
                // Add new trains if needed
                if (this.stationData.chunabhatti.trains.length < 8) {
                    const lastTrain = this.stationData.chunabhatti.trains[this.stationData.chunabhatti.trains.length - 1];
                    const scheduledTime = new Date(lastTrain.scheduled.getTime() + (8 + Math.random() * 4) * 60000);
                    const isHarbour = Math.random() > 0.5;
                    const line = isHarbour ? 'harbour' : 'central';
                    const destination = isHarbour ? 
                        ["Panvel", "Vashi", "Andheri", "Belapur"][Math.floor(Math.random() * 4)] :
                        ["CSMT", "Kalyan", "Thane", "Dadar", "Kurla"][Math.floor(Math.random() * 5)];
                    const trainNumber = (isHarbour ? 'H' : 'C') + Math.floor(1000 + Math.random() * 9000);
                    
                    const randomDelay = Math.floor(Math.random() * 12) - 2;
                    const delayInMinutes = randomDelay < 0 ? 0 : randomDelay;
                    const predictedTime = new Date(scheduledTime.getTime() + delayInMinutes * 60000);
                    
                    this.stationData.chunabhatti.trains.push({
                        id: `train-${Date.now()}-chunabhatti`,
                        number: trainNumber,
                        line,
                        destination,
                        scheduled: scheduledTime,
                        predicted: predictedTime,
                        status: this.getTrainStatus(scheduledTime, predictedTime),
                        platform: Math.floor(Math.random() * 2) + 1
                    });
                    
                    this.stationData.chunabhatti.trains.sort((a, b) => a.scheduled - b.scheduled);
                }
                
                if (this.stationData.sion.trains.length < 8) {
                    const lastTrain = this.stationData.sion.trains[this.stationData.sion.trains.length - 1];
                    const scheduledTime = new Date(lastTrain.scheduled.getTime() + (7 + Math.random() * 5) * 60000);
                    const isHarbour = Math.random() > 0.6;
                    const line = isHarbour ? 'harbour' : 'central';
                    const destination = isHarbour ? 
                        ["Panvel", "Vashi", "Andheri", "Belapur"][Math.floor(Math.random() * 4)] :
                        ["CSMT", "Kalyan", "Thane", "Dadar", "Kurla"][Math.floor(Math.random() * 5)];
                    const trainNumber = (isHarbour ? 'H' : 'C') + Math.floor(1000 + Math.random() * 9000);
                    
                    const randomDelay = Math.floor(Math.random() * 12) - 2;
                    const delayInMinutes = randomDelay < 0 ? 0 : randomDelay;
                    const predictedTime = new Date(scheduledTime.getTime() + delayInMinutes * 60000);
                    
                    this.stationData.sion.trains.push({
                        id: `train-${Date.now()}-sion`,
                        number: trainNumber,
                        line,
                        destination,
                        scheduled: scheduledTime,
                        predicted: predictedTime,
                        status: this.getTrainStatus(scheduledTime, predictedTime),
                        platform: Math.floor(Math.random() * 3) + 1
                    });
                    
                    this.stationData.sion.trains.sort((a, b) => a.scheduled - b.scheduled);
                }
                
                // Randomly update some predicted times
                this.stationData[this.currentStation].trains.forEach(train => {
                    // 20% chance to update a prediction
                    if (Math.random() < 0.2) {
                        const change = Math.floor(Math.random() * 6) - 2; // Between -2 and 3 minutes
                        train.predicted = new Date(train.predicted.getTime() + change * 60000);
                        train.status = this.getTrainStatus(train.scheduled, train.predicted);
                        
                        // Add an update
                        if (change !== 0) {
                            const updateText = change > 0 
                                ? `Train ${train.number} to ${train.destination} is now ${Math.abs(change)} minutes more delayed.`
                                : `Train ${train.number} to ${train.destination} is now ${Math.abs(change)} minutes less delayed.`;
                            this.addUpdate(updateText);
                        }
                    }
                });
            }

            generateRandomUpdate() {
                const updateTypes = [
                    "Signal issues resolved between Kurla and Sion. Trains running normally.",
                    "Temporary speed restrictions near Chunabhatti due to track maintenance.",
                    "Heavy rain causing slight delays on Harbour Line.",
                    "Overcrowding at CSMT causing departure delays.",
                    "Technical issue with train C3045 resolved. Services resuming.",
                    "Platform change announcement: Train H2189 now arriving on Platform 2.",
                    "Slow line trains between Thane and CSMT experiencing minor delays.",
                    "Special train added from Kurla to Panvel at 18:45."
                ];
                
                const updateText = updateTypes[Math.floor(Math.random() * updateTypes.length)];
                this.addUpdate(updateText);
            }

            addUpdate(text) {
                const now = new Date().toLocaleTimeString();
                this.updates.unshift({ time: now, text });
                
                // Keep only the last 10 updates
                if (this.updates.length > 10) {
                    this.updates.pop();
                }
                
                // Update the UI
                this.updateUpdatesView();
            }

            updateView() {
                // Update the station title
                document.getElementById('station-title').textContent = 
                    `${this.stationData[this.currentStation].name} Station: Upcoming Trains`;
                
                // Get the trains based on filter
                let trains = this.stationData[this.currentStation].trains;
                
                if (this.lineFilter !== 'all') {
                    trains = trains.filter(train => train.line === this.lineFilter);
                }
                
                // Update the train list
                const trainList = document.getElementById('train-list');
                trainList.innerHTML = '';
                
                if (trains.length === 0) {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td colspan="5" class="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                            No trains found matching your filter.
                        </td>
                    `;
                    trainList.appendChild(row);
                } else {
                    trains.forEach(train => {
                        const row = document.createElement('tr');
                        row.className = 'train-item hover:bg-gray-50 dark:hover:bg-gray-700';
                        
                        const scheduledTime = train.scheduled.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        const predictedTime = train.predicted.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        
                        const lineClass = train.line === 'harbour' ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400';
                        
                        row.innerHTML = `
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="flex items-center">
                                    <div class="ml-0">
                                        <div class="text-sm font-medium text-gray-900 dark:text-white">
                                            ${train.number}
                                        </div>
                                        <div class="text-sm ${lineClass}">
                                            ${train.line === 'harbour' ? 'Harbour Line' : 'Central Line'}
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="text-sm text-gray-900 dark:text-white">${train.destination}</div>
                                <div class="text-sm text-gray-500 dark:text-gray-400">Platform ${train.platform}</div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="text-sm text-gray-900 dark:text-white">${scheduledTime}</div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="text-sm text-gray-900 dark:text-white">${predictedTime}</div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 dark:bg-gray-700 ${this.getStatusClass(train.status)}">
                                    ${train.status}
                                </span>
                            </td>
                        `;
                        
                        trainList.appendChild(row);
                    });
                }
                
                // Update the last update time
                document.getElementById('last-update-time').textContent = new Date().toLocaleTimeString();
                
                // Update the updates view
                this.updateUpdatesView();
            }

            updateUpdatesView() {
                const updatesList = document.getElementById('updates-list');
                updatesList.innerHTML = '';
                
                if (this.updates.length === 0) {
                    updatesList.innerHTML = `
                        <div class="text-sm text-gray-500 dark:text-gray-400">
                            Waiting for updates...
                        </div>
                    `;
                } else {
                    this.updates.forEach(update => {
                        const updateEl = document.createElement('div');
                        updateEl.className = 'text-sm border-l-4 border-primary pl-3 py-1';
                        updateEl.innerHTML = `
                            <span class="text-gray-500 dark:text-gray-400">${update.time}</span>: 
                            <span class="text-gray-800 dark:text-white">${update.text}</span>
                        `;
                        updatesList.appendChild(updateEl);
                    });
                }
            }

            changeStation(station) {
                this.currentStation = station;
                this.updateView();
            }

            changeLineFilter(filter) {
                this.lineFilter = filter;
                this.updateView();
            }
        }

        // Initialize the app
        document.addEventListener('DOMContentLoaded', () => {
            const trainSchedule = new TrainSchedule();
            
            // Set up event listeners
            document.getElementById('chunabhatti-btn').addEventListener('click', () => {
                document.getElementById('chunabhatti-btn').classList.add('bg-primary', 'text-white');
                document.getElementById('chunabhatti-btn').classList.remove('bg-gray-200', 'text-gray-800', 'dark:bg-gray-700', 'dark:text-white', 'hover:bg-primary', 'hover:text-white', 'dark:hover:bg-primary');
                
                document.getElementById('sion-btn').classList.remove('bg-primary', 'text-white');
                document.getElementById('sion-btn').classList.add('bg-gray-200', 'text-gray-800', 'dark:bg-gray-700', 'dark:text-white', 'hover:bg-primary', 'hover:text-white', 'dark:hover:bg-primary');
                
                trainSchedule.changeStation('chunabhatti');
            });
            
            document.getElementById('sion-btn').addEventListener('click', () => {
                document.getElementById('sion-btn').classList.add('bg-primary', 'text-white');
                document.getElementById('sion-btn').classList.remove('bg-gray-200', 'text-gray-800', 'dark:bg-gray-700', 'dark:text-white', 'hover:bg-primary', 'hover:text-white', 'dark:hover:bg-primary');
                
                document.getElementById('chunabhatti-btn').classList.remove('bg-primary', 'text-white');
                document.getElementById('chunabhatti-btn').classList.add('bg-gray-200', 'text-gray-800', 'dark:bg-gray-700', 'dark:text-white', 'hover:bg-primary', 'hover:text-white', 'dark:hover:bg-primary');
                
                trainSchedule.changeStation('sion');
            });
            
            document.getElementById('line-filter').addEventListener('change', (e) => {
                trainSchedule.changeLineFilter(e.target.value);
            });
        });
    </script>
</body>
</html>
