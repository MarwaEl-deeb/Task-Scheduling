
document.addEventListener('DOMContentLoaded', function () {
    // DOM Elements
    const addProcessBtn = document.getElementById('add-process-btn');
    const submitBtn = document.getElementById('submit-btn');
    const resetBtn = document.getElementById('reset-btn');
    const modal = document.getElementById('process-modal');
    const closeBtn = document.querySelector('.close');
    const processForm = document.getElementById('process-form');
    const processTable = document.getElementById('process-table').getElementsByTagName('tbody')[0];
    const resultsContainer = document.getElementById('results-container');
    const algorithmSelect = document.getElementById('algorithm-select');
    const priorityInput = document.getElementById('priority');
    const quantumInput = document.getElementById('quantum');
    const timequantumInput = document.getElementById('q_time');

    // Set up delete buttons for existing rows
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            this.closest('tr').remove();
        });
    });


    function toggleEditRow(row) {
        const isEditing = row.classList.contains('editing');
        const editBtn = row.querySelector('.edit-btn');
        isEditing ? editBtn.innerHTML = '<i class="bi bi-pencil-square" style="margin-left: 5px;"></i>' : editBtn.innerHTML = '<i class="bi bi-check2-square" style="margin-left: 5px;"></i>';

        isEditing ? submitBtn.disabled = false : submitBtn.disabled = true;

        for (let i = 2; i <= 5; i++) { // skip the first cell (buttons)
            const cell = row.cells[i];
            if (isEditing) {
                const input = cell.querySelector('input');
                if (input) {
                    cell.textContent = input.value.trim();
                }
            } else {
                // Turn text into editable input
                const text = cell.textContent.trim();
                const input = document.createElement('input');
                input.type = 'text';
                input.value = text;
                input.style.width = '100%';
                input.style.color = 'white';
                input.style.backgroundColor = 'rgba(33, 33, 33, 0.274)';
                input.style.border = 'solid 2px rgba(228, 226, 226, 0.37)';
                input.style.borderRadius = '3px';
                input.style.padding = '3px';

                cell.innerHTML = '';

                cell.appendChild(input);
            }

        }

        row.classList.toggle('editing');
    }


    // Modal functionality
    addProcessBtn.addEventListener('click', function () {
        modal.style.display = 'block';
    });

    closeBtn.addEventListener('click', function () {
        modal.style.display = 'none';
    });

    window.addEventListener('click', function (event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Reset button functionality
    resetBtn.addEventListener('click', function () {
        processTable.innerHTML = ''; // Clear the process table
        resultsContainer.innerHTML = '<p>Please submit processes to see results</p>'; // Reset results
    });

    // Handle priority requirements based on selected algorithm
    algorithmSelect.addEventListener('change', function () {
        if (algorithmSelect.value === 'priority') {
            priorityInput.required = true; // Make priority mandatory
        } else {
            priorityInput.required = false; // Make priority optional
        }

        if (algorithmSelect.value === 'rr') {
            timequantumInput.style.display = 'block'; // show time quantum field
        } else {
            timequantumInput.style.display = 'none'; // hide time quantum field
        }
    });

    // Process form submission
    processForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const processId = parseInt(document.getElementById('process-id').value);
        const processName = `P${processId}`;
        const arrivalTime = parseInt(document.getElementById('arrival-time').value);
        const burstTime = parseInt(document.getElementById('burst-time').value);
        const priority = priorityInput.value ? parseInt(priorityInput.value) : null;

        const row = processTable.insertRow();

        // Delete button cell
        const delCell = row.insertCell(0);
        const delBtn = document.createElement('span');
        delBtn.className = 'delete-btn';
        delBtn.innerHTML = '<i class="bi bi-x-circle" style="margin-left: 5px;"></i>';
        delBtn.addEventListener('click', function () {
            row.remove();
        });
        delCell.appendChild(delBtn);

        // ✏️ Add edit button next to delete
        const editCell = row.insertCell(1);
        const editBtn = document.createElement('span');
        editBtn.className = 'edit-btn';
        editBtn.innerHTML = '<i class="bi bi-pencil-square" style="margin-left: 5px;"></i>';
        editBtn.addEventListener('click', function () {
            toggleEditRow(row);
        });
        editCell.appendChild(editBtn);

        // Process name cell
        row.insertCell(2).textContent = processName;

        // Arrival time cell
        row.insertCell(3).textContent = arrivalTime;

        // Burst time cell
        row.insertCell(4).textContent = burstTime;

        // Priority cell
        row.insertCell(5).textContent = priority !== null ? priority : '-';

        // Reset form
        processForm.reset();
        modal.style.display = 'none';
    });


    // Shortest Job First (SJF) Algorithm
    function calculateSJF(processes) {
        const n = processes.length;
        const ganttChart = [];
        let currentTime = 0;
        let completed = 0;
        let totalWaiting = 0;
        let totalTurnAround = 0;

        const isCompleted = Array(n).fill(false);
        const results = [];

        while (completed < n) {
            let shortest = -1;
            let minBurst = Infinity;

            for (let i = 0; i < n; i++) {
                if (
                    processes[i].arrival <= currentTime &&
                    !isCompleted[i] &&
                    processes[i].burst < minBurst
                ) {
                    minBurst = processes[i].burst;
                    shortest = i;
                }
            }

            if (shortest === -1) {
                currentTime++;
                continue;
            }

            const process = processes[shortest];
            const waitingTime = currentTime - process.arrival;
            const completionTime = currentTime + process.burst;
            const turnAroundTime = completionTime - process.arrival;

            totalWaiting += waitingTime;
            totalTurnAround += turnAroundTime;

            results.push({
                name: process.name,
                waitingTime: waitingTime,
                turnAroundTime: turnAroundTime,
                completionTime: completionTime
            });

            ganttChart.push({
                name: process.name,
                start: currentTime,
                end: completionTime
            });

            currentTime = completionTime;
            isCompleted[shortest] = true;
            completed++;
        }

        return {
            processes: results,
            avgWaiting: totalWaiting / n,
            avgTurnAround: totalTurnAround / n,
            ganttChart: ganttChart
        };
    }


    // Shortest Remaining Time First (SRTF) Algorithm
    function calculateSRTF(processes) {
        const n = processes.length;
        const ganttChart = [];
        let currentTime = 0;
        let completed = 0;
        let totalWaiting = 0;
        let totalTurnAround = 0;

        const remainingBurst = processes.map(p => p.burst);
        const isCompleted = Array(n).fill(false);
        const results = [];

        while (completed < n) {
            let shortest = -1;
            let minBurst = Infinity;

            for (let i = 0; i < n; i++) {
                if (
                    processes[i].arrival <= currentTime &&
                    !isCompleted[i] &&
                    remainingBurst[i] < minBurst
                ) {
                    minBurst = remainingBurst[i];
                    shortest = i;
                }
            }

            if (shortest === -1) {
                currentTime++;
                continue;
            }

            ganttChart.push({
                name: processes[shortest].name,
                start: currentTime,
                end: currentTime + 1
            });

            remainingBurst[shortest]--;
            currentTime++;

            if (remainingBurst[shortest] === 0) {
                isCompleted[shortest] = true;
                completed++;

                const completionTime = currentTime;
                const turnAroundTime = completionTime - processes[shortest].arrival;
                const waitingTime = turnAroundTime - processes[shortest].burst;

                totalWaiting += waitingTime;
                totalTurnAround += turnAroundTime;

                results.push({
                    name: processes[shortest].name,
                    waitingTime: waitingTime,
                    turnAroundTime: turnAroundTime,
                    completionTime: completionTime
                });
            }
        }

        return {
            processes: results,
            avgWaiting: totalWaiting / n,
            avgTurnAround: totalTurnAround / n,
            ganttChart: mergeGanttChart(ganttChart)
        };
    }


    // Priority Scheduling Algorithm
    function calculatePriority(processes) {
        const n = processes.length;
        const ganttChart = [];
        let currentTime = 0;
        let completed = 0;
        let totalWaiting = 0;
        let totalTurnAround = 0;

        const isCompleted = Array(n).fill(false);
        const results = [];

        while (completed < n) {
            let highestPriority = -1;
            let minPriority = Infinity;

            for (let i = 0; i < n; i++) {
                if (
                    processes[i].arrival <= currentTime &&
                    !isCompleted[i] &&
                    processes[i].priority < minPriority
                ) {
                    minPriority = processes[i].priority;
                    highestPriority = i;
                }
            }

            if (highestPriority === -1) {
                currentTime++;
                continue;
            }

            const process = processes[highestPriority];
            const waitingTime = currentTime - process.arrival;
            const completionTime = currentTime + process.burst;
            const turnAroundTime = completionTime - process.arrival;

            totalWaiting += waitingTime;
            totalTurnAround += turnAroundTime;

            results.push({
                name: process.name,
                waitingTime: waitingTime,
                turnAroundTime: turnAroundTime,
                completionTime: completionTime
            });

            ganttChart.push({
                name: process.name,
                start: currentTime,
                end: completionTime
            });

            currentTime = completionTime;
            isCompleted[highestPriority] = true;
            completed++;
        }

        return {
            processes: results,
            avgWaiting: totalWaiting / n,
            avgTurnAround: totalTurnAround / n,
            ganttChart: ganttChart
        };
    }


    // Round Robin Algorithm
    function calculateRR(processes) {
        const quantum = parseInt(quantumInput.value);
        if (!quantum || quantum <= 0) {
            alert("You must enter a time quantum value");
            return
        }

        else {
            const n = processes.length;
            const ganttChart = [];
            let currentTime = 0;
            let totalWaiting = 0;
            let totalTurnAround = 0;

            const remainingBurst = processes.map(p => p.burst);
            const queue = [];
            let results = [];

            processes.sort((a, b) => a.arrival - b.arrival); // Sort by arrival time
            let index = 0;

            while (results.length < n) {
                while (index < n && processes[index].arrival <= currentTime) {
                    queue.push(index);
                    index++;
                }

                if (queue.length === 0) {
                    currentTime++;
                    continue;
                }

                const current = queue.shift();
                const executionTime = Math.min(quantum, remainingBurst[current]);

                ganttChart.push({
                    name: processes[current].name,
                    start: currentTime,
                    end: currentTime + executionTime
                });

                currentTime += executionTime;
                remainingBurst[current] -= executionTime;

                if (remainingBurst[current] === 0) {
                    const completionTime = currentTime;
                    const turnAroundTime = completionTime - processes[current].arrival;
                    const waitingTime = turnAroundTime - processes[current].burst;

                    totalWaiting += waitingTime;
                    totalTurnAround += turnAroundTime;

                    results.push({
                        name: processes[current].name,
                        waitingTime: waitingTime,
                        turnAroundTime: turnAroundTime,
                        completionTime: completionTime
                    });
                } else {
                    queue.push(current);
                }
            }

            return {
                processes: results,
                avgWaiting: totalWaiting / n,
                avgTurnAround: totalTurnAround / n,
                ganttChart: ganttChart
            };
        }
    }

    // Helper function to merge Gantt chart entries
    function mergeGanttChart(chart) {
        const merged = [];
        for (let i = 0; i < chart.length; i++) {
            if (
                merged.length > 0 &&
                merged[merged.length - 1].name === chart[i].name
            ) {
                merged[merged.length - 1].end = chart[i].end;
            } else {
                merged.push(chart[i]);
            }
        }
        return merged;
    }

    // Submit button - calculate results
    submitBtn.addEventListener('click', function () {

        if (submitBtn.disabled) {
            alert("Please finish editing all table fields before running the algorithm.");
            return;
        }

        const algorithm = document.getElementById('algorithm-select').value;
        const processes = getProcessesFromTable();


        if (processes.length === 0) {
            alert('Please add at least one process');
            return;
        }

        if (algorithm === 'priority') {
            const missingPriority = processes.some(p => p.priority === null);
            if (missingPriority) {
                alert('All processes must have a priority value to run the Priority Scheduling algorithm.');
                return; // Stop execution
            }
        }

        let results;
        switch (algorithm) {
            case 'fcfs':
                results = calculateFCFS(processes);
                break;
            case 'sjf':
                results = calculateSJF(processes);
                break;
            case 'priority':
                results = calculatePriority(processes);
                break;
            case 'srtf':
                results = calculateSRTF(processes);
                break;
            case 'rr':
                results = calculateRR(processes);
                break;
            default:
                alert('Algorithm not implemented');
                return;
        }

        displayResults(results);
    });

    // Helper functions
    function getProcessesFromTable() {
        const processes = [];
        const rows = processTable.rows;

        for (let i = 0; i < rows.length; i++) {
            const cells = rows[i].cells;
            processes.push({
                name: cells[2].textContent,
                arrival: parseInt(cells[3].textContent),
                burst: parseInt(cells[4].textContent),
                priority: cells[5].textContent === '-' ? null : parseInt(cells[5].textContent)
            });
        }

        return processes;
    }

    function calculateFCFS(processes) {
        let currentTime = 0;
        let totalWaiting = 0;
        let totalTurnAround = 0;
        const results = [];
        const ganttChart = [];

        processes.forEach(process => {
            // Calculate waiting time
            const waitingTime = Math.max(0, currentTime - process.arrival);
            totalWaiting += waitingTime;

            // Calculate completion time
            const completionTime = Math.max(currentTime, process.arrival) + process.burst;

            // Calculate turnaround time
            const turnAroundTime = completionTime - process.arrival;
            totalTurnAround += turnAroundTime;

            // Add to results
            results.push({
                name: process.name,
                waitingTime: waitingTime,
                turnAroundTime: turnAroundTime,
                completionTime: completionTime
            });

            // Add to Gantt chart
            ganttChart.push({
                name: process.name,
                start: currentTime,
                end: completionTime
            });

            // Update current time
            currentTime = completionTime;
        });

        return {
            processes: results,
            avgWaiting: totalWaiting / processes.length,
            avgTurnAround: totalTurnAround / processes.length,
            ganttChart: ganttChart
        };
    }

    function displayResults(results) {
        let html = `
                    <table class="result-table">
                        <thead>
                            <tr>
                                <th>Process Name</th>
                                <th>Waiting Time</th>
                                <th>Turn Around Time</th>
                            </tr>
                        </thead>
                        <tbody>
                `;

        results.processes.forEach(process => {
            html += `
                        <tr>
                            <td>${process.name}</td>
                            <td>${process.waitingTime}</td>
                            <td>${process.turnAroundTime}</td>
                        </tr>
                    `;
        });

        html += `
                        </tbody>
                    </table>
                    
                    <div class="averages">
                        <p><strong>Average Waiting Time</strong> = ${results.avgWaiting.toFixed(1)} Sec</p>
                        <p><strong>Average Turn Around Time</strong> = ${results.avgTurnAround.toFixed(1)} Sec</p>
                    </div>
                    
                    <h3>Gantt Chart</h3>
                    <div class="gantt-container">
                        <div class="gantt-chart">
                `;

        // Add Gantt chart processes
        results.ganttChart.forEach(item => {
            const duration = item.end - item.start;
            html += `<div class="gantt-process" style="flex: ${duration}">${item.name}</div>`;
        });

        html += `</div><div class="gantt-times" style="display: flex;">`;

        // Add Gantt chart times
        results.ganttChart.forEach(item => {
            const duration = item.end - item.start;
            html += `<div class="gantt-time" style="flex: ${duration}">${item.start}</div>`;
        });

        // Add final time
        const lastItem = results.ganttChart[results.ganttChart.length - 1];
        html += `<div class="gantt-time">${lastItem.end}</div>`;

        html += `</div></div>`;

        resultsContainer.innerHTML = html;
    }
});