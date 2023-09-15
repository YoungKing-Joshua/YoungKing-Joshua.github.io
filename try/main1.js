const hide = (element) =>
{
    element.setAttribute('hidden', '');
};

const show = (element) =>
{
    element.removeAttribute('hidden');
};

const plotSomeData = (data, title = '') =>
{
    var layout = {
        width: window.innerWidth,
        height: window.innerHeight,
        title,
    };

    Plotly.newPlot('graphHolder', data, layout);
};

const processData = (rows) =>
{
    const x = [], text = [];

    // sort the data by provided x value
    // [...document.querySelectorAll('input[name="xAxisChoice"]')].find((el) => el.checked)?.dataset?.header

    const xVariableElement = [...document.querySelectorAll('input[name="xAxisChoice"]')]?.find((el) => el.checked);
    const xVariable = xVariableElement?.dataset?.header;
    if (xVariable === undefined)
    {
        alert('You have to select a xAxis for this to work');
        throw new Error('Super smart user is trying to graph without selecting an x value');
    }
    const sortedRows = rows.sort((a, b) => a[xVariable] - b[xVariable]);

    const checkboxes = [...document.querySelectorAll('input[type="checkbox"]')];
    const allYs = {};
    let userChoseAYValue = false;
    checkboxes.forEach((checkbox) =>
    {
        const { checked, name } = checkbox;
        if (checked)
        {
            allYs[name] = [];
            userChoseAYValue = true;
        }
    });

    if (!userChoseAYValue)
    {
        alert('You have to select values for the yAxis for this to work');
        throw new Error('Super smart user is trying to graph without selecting any y values');
    }

    // clear the interface now that we've graphed
    document.getElementById('interface').innerHTML = "";

    sortedRows.forEach((row) =>
    {
        x.push(row[xVariable]);

        Object.keys(allYs).forEach((header) =>
        {
            allYs[header].push(row[header]);
        });

        if (Object.prototype.hasOwnProperty.call(row, 'day_time'))
        {
            const date = new Date(parseFloat(row.day_time));
            text.push(date.toLocaleString());
        } else
        {
            text.push('');
        }
    });

    const traces = Object.keys(allYs).map((yLabel) => ({
        x,
        y: allYs[yLabel],
        text,
        type: 'scatter',
        mode: 'markers',
        name: yLabel,
    }));

    return traces;
};

const makePlot = (input) =>
{
    // remove any padding, scrolling, or margin on the body tag
    document.querySelector('body').style = "margin: 0; padding: 0; overflow: hidden;";
    // hide the interface and show the graph
    hide(document.getElementById('interface'));
    show(document.getElementById('graphHolder'));

    d3.csv(input, (rows) =>
    {
        const traces = processData(rows);
        plotSomeData(traces);
    });
};

window.onload = () =>
{
    show(document.getElementById('interface'));
    const docPicker = document.getElementById('docPicker');
    const graphButton = document.getElementById('scatterGraphing');

    let clicked = false;
    graphButton.addEventListener('mousedown', (event) =>
    {
        event.target.classList.add('clicked');
        event.target.classList.remove('notClicked');

        clicked = true;
    });

    const resetClick = (event) =>
    {
        if (clicked)
        {
            event.target.classList.add('notClicked');
            event.target.classList.remove('clicked');

            // use the processed data to do thing
            const fileList = docPicker.files;
            const file = fileList[fileList.length - 1];

            const fileReader = new FileReader();
            fileReader.addEventListener('load', (event) =>
            {
                makePlot(event.target.result);
            });

            fileReader.readAsDataURL(file);

            clicked = false;
        }
    };

    graphButton.addEventListener('mouseup', resetClick);
    graphButton.addEventListener('mouseout', resetClick);


    docPicker.addEventListener('change', (event) =>
    {
        show(document.getElementById('selectionInterface'));
        show(document.getElementById('scatterGraphing'));
        document.getElementById('scatterGraphing').style.display = 'block';

        const fileList = event.target.files;
        const file = fileList[fileList.length - 1];

        // read data and display the headers so person can choose what to display
        const fileReader = new FileReader();
        fileReader.addEventListener('load', (event) =>
        {
            d3.csv(event.target.result, (data) =>
            {
                if (data.length)
                {
                    const headers = Object.keys(data[0]);
                    // display as a checkbox list of which headers you want to choose
                    const headersHTML = headers.map((header) =>
                    {
                        return `<label for="${header}-header">
                        <input type="checkbox" id="${header}-header" name="${header}"> ${header}
                        </label>`;
                    });
                    const xAxisVariableHTML = headers.map((header) =>
                    {
                        return `<label for="${header}-axis">
                        <input type="radio" id="${header}-axis" data-header="${header}" name="xAxisChoice"> ${header}
                        </label>`;
                    });


                    const graphHeaders = document.getElementById('graphHeaders');
                    const xAxisVariable = document.getElementById('xAxisVariable');
                    graphHeaders.innerHTML = headersHTML.join('<br/>');
                    xAxisVariable.innerHTML = xAxisVariableHTML.join('<br/>');
                }
            });
        });

        fileReader.readAsDataURL(file);
    });

};





