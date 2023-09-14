const hide = (element) => {
    element.setAttribute('hidden', '');
};

const show = (element) => {
    element.removeAttribute('hidden');
};

const plotSomeData = (data, title = '') => {
    // Get the canvas element where the chart will be rendered
    const chartCanvas = document.getElementById('chartCanvas');
    
    // Create a Chart.js line chart
    const ctx = chartCanvas.getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.labels,
            datasets: data.datasets,
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            title: {
                display: true,
                text: title,
            },
        },
    });
};

const processData = (rows) => {
    const x = [];
    const datasets = [];

    // Extract X-axis and Y-axis variables from rows
    const xVariableElement = document.querySelector('input[name="xAxisChoice"]:checked');
    const xVariable = xVariableElement?.dataset.header;
    
    if (xVariable === undefined) {
        alert('You must select an X-axis variable.');
        throw new Error('User attempted to graph without selecting an X-axis variable.');
    }

    const checkboxes = [...document.querySelectorAll('input[type="checkbox"]')];
    
    checkboxes.forEach((checkbox) => {
        if (checkbox.checked) {
            const yVariable = checkbox.name;
            const dataPoints = rows.map((row) => row[yVariable]);
            datasets.push({
                label: yVariable,
                data: dataPoints,
                borderColor: getRandomColor(),
                fill: false,
            });
        }
    });

    rows.forEach((row) => {
        x.push(row[xVariable]);
    });

    return { labels: x, datasets };
};

const makePlot = (input) => {
    document.querySelector('body').style = 'margin: 0; padding: 0; overflow: hidden;';
    hide(document.getElementById('interface'));
    show(document.getElementById('chartCanvas'));

    fetch(input)
        .then((response) => response.text())
        .then((data) => {
            Papa.parse(data, {
                header: true,
                dynamicTyping: true,
                complete: (result) => {
                    const traces = processData(result.data);
                    plotSomeData(traces);
                },
            });
        })
        .catch((error) => {
            console.error('Error fetching or parsing CSV:', error);
        });
};

// Utility function to generate random colors for datasets
const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
};

window.onload = () => {
    show(document.getElementById('interface'));
    const docPicker = document.getElementById('docPicker');
    const graphButton = document.getElementById('startGraphing');

    let clicked = false;

    graphButton.addEventListener('mousedown', (event) => {
        event.target.classList.add('clicked');
        event.target.classList.remove('notClicked');
        clicked = true;
    });

    const resetClick = (event) => {
        if (clicked) {
            event.target.classList.add('notClicked');
            event.target.classList.remove('clicked');

            const fileList = docPicker.files;
            const file = fileList[fileList.length - 1];

            makePlot(file);
            clicked = false;
        }
    };

    graphButton.addEventListener('mouseup', resetClick);
    graphButton.addEventListener('mouseout', resetClick);

    docPicker.addEventListener('change', (event) => {
        show(document.getElementById('selectionInterface'));
        show(document.getElementById('startGraphing'));

        const fileList = event.target.files;
        const file = fileList[fileList.length - 1];

        Papa.parse(file, {
            header: true,
            dynamicTyping: true,
            skipEmptyLines: true,
            complete: (result) => {
                if (result.data.length) {
                    const headers = Object.keys(result.data[0]);
                    const graphHeaders = document.getElementById('graphHeaders');
                    const xAxisVariable = document.getElementById('xAxisVariable');
                    
                    const headersHTML = headers.map((header) => {
                        return `<label for="${header}-header">
                        <input type="checkbox" id="${header}-header" name="${header}"> ${header}
                        </label>`;
                    });

                    const xAxisVariableHTML = headers.map((header) => {
                        return `<label for="${header}-axis">
                        <input type="radio" id="${header}-axis" data-header="${header}" name="xAxisChoice"> ${header}
                        </label>`;
                    });

                    graphHeaders.innerHTML = headersHTML.join('<br/>');
                    xAxisVariable.innerHTML = xAxisVariableHTML.join('<br/>');
                }
            },
        });
    });
};
