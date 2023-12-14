//Plot from CSV file
function plotChart(data){
    var dates = data.map(function(record){return record.Date;});
    var prices = data.map(function(record){ return record.Close;});
    console.log('dates:',dates);
    console.log('prices:',prices);
    var stockData = {
        x: dates,
        y: prices,
        type: 'scatter',
        mode: 'lines+markers',
        marker: {color: 'blue'},
    };

    var layout = {
        title: 'Captivating Stock Price Chart',
        xaxis: { title: 'Date'},
        yaxis: {title: 'Price'}
    };
    Plotly.newPlot('stock-chart', [stockData], layout);
}

// Read CSV file
Papa.parse("./data/AAPL.csv", {
  download: true,
  header: true,
  complete: function(results) {
    plotChart(results.data);
  }
});

//Plot from json, to be replaced with call to Flask
fetch('./data/aapl.json')
  .then(response => response.json())
  .then(data => plotData(data))
  .catch(error => console.log(error));

  //make the chart fullscreen
window.onresize = function () {
    plotData(stockData);
}

function plotData(stockData) {
    var dates = stockData.map(record => record.Date);
    var openingprices = stockData.map( record => record.Open);
    var highPrices = stockData.map( record => record.High);
    var lowPrices = stockData.map( record => record.Low);
    var closingPrices = stockData.map( record => record.Close);
    
    var trace = {
        x: dates,
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
        title: 'Exquisite Stock Price Chart',
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

    Plotly.newPlot('stock-chart2', [trace], layout);

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


