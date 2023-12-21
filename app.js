/*
 Plotting price charts
 Given the json data from API plot the price chart.
 Data processing: default: show all the data range available.
   Allow user to Apply a date range, show only the selected range.
Trace properties: x: date, y: close price
*/

/*
ToDo:
- Display only the Name in the dropdown
- From the name, use stocklistData to get the ticker
- use the ticker to load the json file
*/

// get the data from json file
// store in stockData
// call plotData(stockData)
// call plotChart(stockData)

//Plot from json, to be replaced with call to Flask

// get json file with fetch
// fetch('./data/aapl.json')
//   .then(response => response.json())
//   .then(data => {plotChart(data); plotData(data);})
//   .catch(error => console.log(error));
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

      //populate dropdown in tab2 with stock list
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
     
    // d3.json("./data/" + ticker + ".json").then(function(data) {
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
    // else {
    //     var date = new Date(d.Date);
    // }
    // console.log(data.date)
    jsonData = data;
    // console.log("after mapping, jsonData: ", jsonData)   
    //fill in Stock info
    //get the required info from stocklistData array
    let stockInfo = getStockInfo(selectedTicker, stocklistData);
    // convert the object to formatted string using map 
    formattedPI = Object.keys(stockInfo).map(key => key + ': <strong>' + stockInfo[key] + '</strong><br/>').join('')
    // need to use .html() instead of .text() to display the <br> correctly
    d3.select("#sample-metadata").html(formattedPI)
    
    plotChart(jsonData);
    console.log("before calling candlestick, jsonData: ", jsonData)   
    plotData(jsonData);
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
                // if (cloudbased) {
                //     var date = getJSDate(d.date);    
                // }
                // else {
                //     var date = new Date(d.Date);
                // }
                // console.log('Data date:', date);
                return date >= startDate && date <= endDate;
            });
    
    console.log('filteredData:',filteredData);
    
    // Use the filtered data to plot the chart
    plotChart(filteredData);
    plotData(filteredData);

    // d3.json("./data/" + ticker + ".json").then(function(data) {
    //     console.log("Loaded data:", data);

    //     // Filter the data based on the selected dates
    //     var filteredData = data.filter(function(d) {
    //         var date = new Date(d.Date);
    //         console.log('Data date:', date);
    //         return date >= startDate && date <= endDate;
    //     });

    //     console.log('filteredData:',filteredData);

    //     // Use the filtered data to plot the chart
    //     plotChart(filteredData);
    //     plotData(filteredData);
    // }).catch(function(error) {
    //     console.log(error);
    // });
}

//helper functions

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

//plot an array of charts
function plotMultiCharts(stocksData){
    var colors = ['red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet'];
    var data = stocksData.map((stockData,i) => {
        return {
            // x: stockData.map(record => record.Date),
            // y: stockData.map(record => record.Close),
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
        yaxis: {title: 'Price'},
        width: 1000,
        height: 800
    };
    Plotly.newPlot('compareChart', data, layout, {scrollZoom: true});
}

// plot the line chart
function plotChart(data){
    // var dates = data.map(function(record){return record.Date;});
    // var prices = data.map(function(record){ return record.Close;});
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
        xaxis: { title: 'Date'},
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
    // var dates = cloudbased? data.map(function(record){return record.date}) : data.map(function(record){return record.Date;});
    // updated with ternary to accommodate diff in Neon db and json.
    // console.log("candlestick stockData: ", stockData);
    var dates = cloudbased? stockData.map(function(record){return record.date}) : stockData.map(function(record){return record.Date});
    var openingprices = cloudbased? stockData.map(function(record){return record.open}) : stockData.map(function(record){return record.Open});
    // cloudbased? stockData.map(record.open) : stockData.map( record => record.Open);
    var highPrices = cloudbased? stockData.map(function(record){return record.high}) : stockData.map(function(record){return record.High});
    // cloudbased? stockData.map(record.high) : stockData.map( record => record.High);
    var lowPrices = cloudbased? stockData.map(function(record){return record.low}) : stockData.map(function(record){return record.Low});
    // cloudbased? stockData.map(record.low) : stockData.map( record => record.Low);
    var closingPrices = cloudbased? stockData.map(function(record){return record.close}) : stockData.map(function(record){return record.Close});
    //  cloudbased? stockData.map(record.close) : stockData.map( record => record.Close);
    
    var trace = {
        x: dates,
        //instead of a y value, it defines the candlestick
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

        //default hover info
        // hoverinfo: 'x+y+z',
        //text is used to add additional info
        // hoverinfo: 'x+y+z+text',    
        // text: stockData.map(record => `Open: ${record.Open}<br>High: ${record.High}<br>Low: ${record.Low}<br>Close: ${record.Close}` ),
    };

    var layout ={
        title: stockName + ' Candlestick Chart',
        xaxis: {
            title: 'Date',
            type: 'category',
            type: 'date',
            tickformat: '%Y-%m-%d',
        },
        yaxis: { title: 'Price'
        },
        //background of aread around the plot
        paper_bgcolor: '#f3f3f3',
        //background fo plot
        plot_bgcolor: '#f3f3f3',
    };

    Plotly.newPlot('stock-chart2', [trace], layout, {scrollZoom: true});

}

// const url = "https://2u-data-curriculum-team.s3.amazonaws.com/dataviz-classroom/v1.1/14-Interactive-Web-Visualizations/02-Homework/samples.json";
// // const url = "https://2u-data-curriculum-team.s3.amazonaws.com/dataviz-classroom/v1.1/14-Interactive-Web-Visualizations/02-Homework/samples2.json";

// // Promise Pending
// const dataPromise = d3.json(url);
// console.log("Data Promise: ", dataPromise);
// let dataG ={}
// // Fetch the JSON data and console log it
// d3.json(url).then(function(data) {
//   dataG = data;
//   console.log(data);
//   console.log("dataG: ", dataG)

//   //continue code here
//   console.log("names: ", data.names)

//   // populate dropdown list (<select>) with names
//   function populateDropdown() {
//     const dropdown = d3.select("#selDataset");
//     //remove existing options
//     dropdown.selectAll('option').remove()

//     // // add a default message
//     // dropdown.append('option')
//     //     .attr('value', '')
//     //     .text("Select an ID")

//     //add names array as options in dropdown menu
//     dropdown.selectAll('option')
//         .data(data.names)
//         .enter()
//         .append('option')
//         .attr('value', function(d){return d;})
//         .text(function(d){ return d;});
// }

//   populateDropdown();

// })
// .catch(function(error) {
//     console.error('Error loading data: ', error)
// }
// );

// // this function is called when the dropdown box item is changed
// function optionChanged(selected){

//     //Plotting horizontal bar chart
//     // get the index of the id, which is the same index for all other arrays (metadata, names, samples)
//     // in dataG
//     index = selected.selectedIndex;
//     sample = dataG['samples'][index];

//     let hbData= [{ 
//         // convert the values to string, thick bars are displayed when we use the string template, 
//         // reverse() because otherwise the largest sample value is at 
//         // the bottom, we want it at the top
//        y: sample.otu_ids.slice(0,10).map(function(item){return `OTU ${item}`}).reverse(),
//        x: sample.sample_values.slice(0,10).reverse(),
//        type: 'bar',
//        orientation: 'h',
//        text: sample.otu_labels.slice(0,10),
//        hoverinfo: 'text+x',
//        marker: {
//         color: 'steelblue',
//         withd: 0.5,
//        }
//     }];
//     let layout ={
//        title: '<b>Top 10 OTUs</b>',
//        xaxis: {title: 'Sample values'},
//     //    yaxis: {title: "OTU ID"},
//     };
//     Plotly.newPlot('bar', hbData, layout)
    
//     //fill in demographic info
//     //get the required info from metadata array
//     personInfo = dataG['metadata'][index]
//     // convert the object to formatted string using map 
//     formattedPI = Object.keys(personInfo).map(key => key + ': ' + personInfo[key] + '<br/>').join('')
//     // need to use .html() instead of .text() to display the <br> correctly
//     d3.select("#sample-metadata").html(formattedPI)

//     //create the bubble chart
//     let trace = {
//         x: sample.otu_ids,
//         y: sample.sample_values,
//         mode: 'markers',
//         marker: {
//             size: sample.sample_values,
//             color: sample.otu_ids,
//             colorscale: 'Viridis'
//         },
//         text: sample.otu_labels,
//     };
//     let layout2 = {
//         title: '<b>All OTUs</b>',
//         xaxis: {title: 'OTU ID'},
//         yaxis: {title: 'Sample values'},
//     };
//     Plotly.newPlot('bubble',[trace], layout2);
    
//     //BONUS section
//     //create the gauge
//     freq = dataG.metadata[index].wfreq;
//     // console.log('wfreq: ', freq);
//     let gaugeData = [{
//         type: 'indicator',
//         mode: 'gauge+number',
//         title: { text: '<b>Belly Button Washing Frequency</b><br>Scrubs per Week'},
//         value: freq,
//         domain: {x: [0,1], y: [0,1]},
//     }];
    
//     let layout3 = { width: 600, height: 500, margin:{t: 0, b:0},
//     };
//     Plotly.newPlot('gauge', gaugeData,layout3)

// }


