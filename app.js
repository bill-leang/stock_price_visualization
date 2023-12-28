/*
 Plotting price charts
 Given the json data from API plot the price chart.
 Data processing: 
   Default: show all the data range available.
   Allow user to Apply a date range, show only the selected range.
Trace properties: x: date, y: close price
*/

/*
ToDo:
- Display only the Name in the dropdown
- From the name, use stocklistData to get the ticker
- use the ticker to load the json file
*/

//global variables
let jsonData = null;
let stocklistData = null;
let ticker = null;
let stockName = null;
let stockNames = null;
const cloudbased = true;

//get list of stocks, load into dropdown
// using ternary operator, check if cloudbased is true use url, otherwise use local json
let datasource = cloudbased ? ("http://localhost:5000/api/v1.0/stockinfo") : ("./data/stocklist.json");
console.log('stockinfo datasource: ', datasource);
d3.json(datasource).then(function(data) {
    //Store the data from the json file
    stocklistData = data;
    console.log('stocklistData:',stocklistData);
    //populate dropdown with stock list
    var dropdown = d3.select("#selDataset");
    //remove existing options
    dropdown.selectAll('option').remove()

    //add names array as options in dropdown menu
    dropdown.selectAll('option')
        .data(data)
        .enter()
        .append('option')
        .attr('value', function(d){return d.Name ;})
        .text(function(d){ return d.Name ;});
    
      // add a default message
      dropdown.insert('option', ':first-child')
      .attr('value', '')
      .text("Select a stock")

      //populate dropdown in second tab with stock list
      var dropdown2 = d3.select("#selDataset2");
      dropdown2.attr('multiple', '');
      dropdown2.selectAll('option').remove()
      dropdown2.selectAll('option')
        .data(data)
        .enter()
        .append('option')
        .attr('value', function(d){return d.Name ;})
        .text(function(d){ return d.Name ;});

  }).catch(function(error) {
    console.log(error); 
    });

console.log('jsonData:',jsonData);

function optionAdded(selectElelement){
  var selectedStocks = Array.from(selectElelement.selectedOptions).map(option => option.value);
  console.log("Selected stocks:", selectedStocks);
  stockNames = selectedStocks; 
  //get the selected stocks' price data
    var dataPromises = selectedStocks.map(stockname => {
        let ticker = getTicker(stockname, stocklistData);
        // using ternary operator, check if cloudbased is true use url, otherwise use local json
        let datasource = cloudbased ? ("http://localhost:5000/api/v1.0/price/" + ticker) : ("./data/" + ticker + ".json");
      
        //this is a data promise not an array yet   
        return d3.json(datasource);
    });
    
    Promise.all(dataPromises).then(function(stocksData){
        console.log('stocksData:',stocksData);
        //format the dateStr in the array into JS date
        if (cloudbased) {
        for (i=0; i< stocksData.length; i++){
           
                stocksData[i] = stocksData[i].map(record => {
                    return {
                        ...record,
                        date: getJSDate(record.date)
                    };
                });
            }
        }
        plotMultiCharts(stocksData);
    }).catch(function(error) {
        console.log(error);
    });
}

function optionChanged(selected){

   let selectedTicker  = selected.value;
   stockName = selectedTicker;
   console.log('selected:',selectedTicker);
   ticker = getTicker(selectedTicker, stocklistData);
   
   //get the selected stock from dropdown  
    let datasource = cloudbased ? ("http://localhost:5000/api/v1.0/price/" + ticker) : ("./data/" + ticker + ".json");
    console.log("datasource: ", datasource);
    d3.json(datasource).then(function(data) {
    //Store the data from the json file
    if (cloudbased) {
        data = data.map(record => {
            return {
                ...record,
                date: getJSDate(record.date)
            };
        });
    }
    
    jsonData = data;
    
    // fill in Stock info
    // get the required info from stocklistData array
    let stockInfo = getStockInfo(selectedTicker, stocklistData);
    // convert the object to formatted string using map 
    formattedPI = Object.keys(stockInfo).map(key => key + ': <strong>' + stockInfo[key] + '</strong><br/>').join('')
    // need to use .html() instead of .text() to display the <br> correctly
    d3.select("#sample-metadata").html(formattedPI)
    
    drawCharts(jsonData);
    // plotChart(jsonData);
    // // console.log("before calling candlestick, jsonData: ", jsonData)   
    // plotData(jsonData);
  }).catch(function(error) {
    console.log(error);
  });
}

function updateChart() {
    var startDate = new Date(document.getElementById('start-date').value);
    var endDate = new Date(document.getElementById('end-date').value);
    console.log('startDate:', startDate);
    console.log('endDate:', endDate);

    var filteredData = jsonData.filter(function(d) {
                var date = cloudbased? new Date(d.date) : new Date(d.Date);
                return date >= startDate && date <= endDate;
            });
    
    console.log('filteredData:',filteredData);
    
    // Use the filtered data to plot the chart
    drawCharts(filteredData);
    // plotChart(filteredData);
    // plotData(filteredData);   
}

function drawCharts(data){
    plotChart(data);
    plotData(data);
    plotVolume(data);
}

//Helper Functions

//return date 'yyyy-mm-dd' from 'dd/mm/yyyy'
function getJSDate(dateStr) {
    let [day, month, year] = dateStr.split('/');
    return new Date(`${year}-${month}-${day}`);
}

//get the ticker from the stocklist given the name
function getTicker(name, array) {
    for (let i = 0; i < array.length; i++) {
        if (array[i].Name === name) {
            return array[i].Ticker;
        }
    }
    return null;
}

//get the ticker from the stocklist given the name
function getStockInfo(name, array) {
    for (let i = 0; i < array.length; i++) {
        if (array[i].Name === name) {
            return array[i];
        }
    }
    return null;
}

//plot multiple lines on a chart
function plotMultiCharts(stocksData){
    var colors = ['red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet'];
    var data = stocksData.map((stockData,i) => {
        return {
            x: cloudbased? stockData.map(record => record.date) : stockData.map(record => record.Date),
            y: cloudbased? stockData.map(record => record.close) : stockData.map(record => record.Close),
            type: 'scatter',
            mode: 'lines',
            name: stockNames[i],
            marker: {color: colors[i% colors.length]},
        };
    });
    var layout = {
        title: 'Stock Prices',
        xaxis: { title: 'Date'},
        //using log scale for y axis to display the price difference
        yaxis: {title: 'Price', type: 'log'},
        width: 1000,
        height: 800
    };
    Plotly.newPlot('compareChart', data, layout, {scrollZoom: true});
}

// plot the line chart
function plotChart(data){
    var dates = cloudbased? data.map(function(record){return record.date}) : data.map(function(record){return record.Date;});
    var prices = cloudbased? data.map(function(record){return record.close}) : data.map(function(record){ return record.Close;});
    console.log('dates:',dates);
    console.log('prices:',prices);
    var stockData = {
        x: dates,
        y: prices,
        type: 'scatter',
        // line mode gives a finer line
        // mode: 'lines+markers',
        mode: 'lines',
        marker: {color: 'blue'},
    };

    var layout = {
        title: stockName + ' Stock Price Chart',
        // xaxis: { title: 'Date'},
        yaxis: {title: 'Price'}
    };
    Plotly.newPlot('stock-chart', [stockData], layout, {scrollZoom: true});
}

//make the chart fullscreen
  window.onresize = function () {
    plotData(jsonData);
}

//plotting candlestick chart
function plotData(stockData) {
    
    // updated with ternary to accommodate diff in Neon db and json.
    var dates = cloudbased? stockData.map(function(record){return record.date}) : stockData.map(function(record){return record.Date});
    var openingprices = cloudbased? stockData.map(function(record){return record.open}) : stockData.map(function(record){return record.Open});
    var highPrices = cloudbased? stockData.map(function(record){return record.high}) : stockData.map(function(record){return record.High});
    var lowPrices = cloudbased? stockData.map(function(record){return record.low}) : stockData.map(function(record){return record.Low});
    var closingPrices = cloudbased? stockData.map(function(record){return record.close}) : stockData.map(function(record){return record.Close});
       
    var trace = {
        x: dates,
        //instead of a y value, it defines the candlestick properties
        close: closingPrices,
        decreasing: {line: {color: 'red'}},
        high: highPrices,
        increasing: {line: {color: 'green'}},
        line: {color: 'rgba(31,119,180,1'},
        low: lowPrices,
        open: openingprices,
        type: 'candlestick',
        xaxis: 'x',
        yaxis: 'y',
        
    };

    var layout ={
        title: stockName + ' Candlestick Chart',
        xaxis: {
            // title: 'Date',
            type: 'category',
            type: 'date',
            tickformat: '%Y-%m-%d',
            //hide the range slider to save space
            rangeslider: {visible: false}
        },
        yaxis: { title: 'Price'
        },
        margin: {
            l: 50,
            r: 50,
            b: 20,
            t: 50,
            pad: 4
        },
        //background of area around the plot
        paper_bgcolor: '#f3f3f3',
        //background fo plot
        plot_bgcolor: '#f3f3f3',
    };

    Plotly.newPlot('stock-chart2', [trace], layout, {scrollZoom: true});

}

//plotting volume chart
function plotVolume(data){
    var dates = cloudbased? data.map(function(record){return record.date}) : data.map(function(record){return record.Date;});
    var volumes = cloudbased? data.map(function(record){return record.volume}) : data.map(function(record){ return record.Volume;});
    var colors = data.map(record => (cloudbased? record.close > record.open : record.Close > record.Open) ? 'green' : 'red' );
    console.log('dates:',dates);
    console.log('volumes:',volumes);
    var volumeData = {
        x: dates,
        y: volumes,
        type: 'bar',
        marker: {color: colors},
    };

    var layout = {
        // title: stockName + ' Stock Volume Chart',
        // xaxis: { title: 'Date'},
        yaxis: {title: 'Volume'},
        margin: {
            l: 50,
            r: 50,
            b: 200,
            t: 50,
            pad: 4
        },
        height: 300
    };
    Plotly.newPlot('volume-chart', [volumeData], layout, {scrollZoom: true});
}

