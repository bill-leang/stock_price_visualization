function plotChart(data) {
    var dates = data.map(function(record) { return record.Date; });
    var prices = data.map(function(record) { return record.Price; });

    var stockData = {
        x: dates,
        y: prices,
        type: 'scatter',
        mode: 'lines+markers',
        marker: {color: 'blue'},
    };

    var layout = {
        title: 'Captivating Stock Price Chart',
        xaxis: {title: 'Date'},
        yaxis: {title: 'Price'}
    };

    Plotly.newPlot('stock-chart', [stockData], layout);
}

// Read CSV file
Papa.parse("path/to/your/stockdata.csv", {
    download: true,
    header: true,
    complete: function(results) {
        plotChart(results.data);
    }
});