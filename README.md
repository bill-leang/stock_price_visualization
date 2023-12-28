# Stock Price Analysis
 **(Project 3)**  
  **Data and Delivery**  
  As our project is to analyze stock price data, we use data from Yahoo Finance stored in a Postgres DB hosted on
Neon.tech cloud service. The data is served to the front-end dashboard via a
Flask API. The front end uses the Plotly library to plot the graphs, which
converts the data into Plotly traces. Each stock contains at least 1,000
records, and with a total of ten stocks loaded, we have more than 10,000
records.
  <img src="./snapshots/records.png" alt="screenshot of Postgres data count">  
  The Postgres DB is accessed via a Flask app, which serves the data to the frontend
as JSON format through Flask APIs. The frontend dashboard makes use of HTML/CSS
and JS.  

**Front End**   
  The chosen design is a dashboard page with multiple charts that all reference the
same data. Besides Plotly.js, we also make use of Bootstrap.js which is not
covered in class, to simplify formatting of the dashboard.
 
**Visualizations**  
  Our dashboard includes four main views: the price chart, the
candlestick chart, the volume chart (Stock Info tab) and the comparison chart
as well as the stock info table.
We make use of tabs to separate the
functionalities of our dashboard, dropdown box to select a stock, menu to
select multiple stocks, date filters, update button, as well as the
interactivity of Plotly charts such as scroll-zoom and panning.
The dashboard is intuitive in its design: in
Stock Info tab, a user can quickly select a stock and view the stock
information, as well as select multiple stocks to compare them in Compare Stocks tab.  
<figure>
  <img src="./snapshots/tab1.png" width="450" height="600" alt="screenshot of dashboard tab1">
  <figcaption>First tab: Stock Info tab </figcaption>
</figure>  
<div>
 <figure>
 <img src="./snapshots/tab2.png" width="450" height="600" alt="screenshot of dashboard tab2">  
 <figcaption>Second tab: Compare Stock tab </figcaption>  
</figure>
</div>  
  The dashboard shows the stock data from
different perspectives: the stock info table gives some fundamental analysis
info about the stock, the price chart gives a high-level view of the stock
performance, while the candlestick chart provides a deeper level of
understanding of the stock performance. The user can filter by the period they
are interested in seeing it in more detail. The second tab allows users to
compare the performances of different stocks in one convenient chart.

