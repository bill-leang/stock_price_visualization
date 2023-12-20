import sqlalchemy
from flask import Flask, jsonify
from sqlalchemy import create_engine, func, desc, and_
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy.ext.automap import automap_base
from flask_sqlalchemy import SQLAlchemy
import psycopg2
from flask_cors import CORS


app = Flask(__name__)
CORS(app)
app.config[
    "SQLALCHEMY_DATABASE_URI" ] = "postgresql://ep-polished-king-27948361.ap-southeast-1.aws.neon.tech:5432/main"


db = SQLAlchemy(app)


def retrieve_data_from_neon(ticker):
    try:
        # Establish a connection to the PostgreSQL database
        connection = psycopg2.connect(
            host='ep-polished-king-27948361.ap-southeast-1.aws.neon.tech',
            database='Stock_DB',
            user='jayaraman.sujatha',
            password='pd8XBG1ztqrL'
        )

        # Create a cursor object to execute SQL queries
        cursor = connection.cursor()

        # Define the SQL query to retrieve data from the "apple" table
        query = f"SELECT * FROM stock_prices WHERE ticker = '{ticker}'"

        # Execute the query
        cursor.execute(query)

        # Fetch all the rows
        rows = cursor.fetchall()

        # Get column names
        column_names = [desc[0] for desc in cursor.description]

        # Convert rows to a list of dictionaries
        data = [dict(zip(column_names, row)) for row in rows]

        # Close the cursor and connection
        cursor.close()
        connection.close()

        return data

    except Exception as e:
        # Handle any exceptions that may occur during database interaction
        print(f"Error retrieving data from PostgreSQL database: {str(e)}")
        return None
    

# landing page
@app.route("/")
def welcome():
    """List all the available routes"""
    return(
        f"Available Routes:<br/>"
        f"/api/v1.0/AAPL<br/>"
        f"/api/v1.0/GOOGL<br/>"
        f"/api/v1.0/AMZN<br/>"
        f"/api/v1.0/META<br/>"
        f"/api/v1.0/NFLX<br/>"
        f"/api/v1.0/MSFT<end>"
    )
#Will add  the index later 

# return stocklist.json
@app.route("/api/v1.0/stockinfo")
def getstockinfo():
    pass
    # session = Session(engine)
    # apple_data= session.query(apple.ticker, apple.date, apple.open, apple.high, apple.low, apple.close, apple.Adjclose, apple.volume).all()
    # session.close()
    # jdata = {'ticker': apple_data[0][0], 'date': apple_data[0][1], 'open':round(apple_data[0][2],2), 'high': round(apple_data[0][3],2), 'low': round(apple_data[0][4],2), \
    #          'close':round(apple_data[0][5],2), 'Adjclose':round(apple_data[0][6],2), 'volume':apple_data[0][7]}

    # return jsonify(jdata)
 #Return the AAPL.Json  
@app.route("/api/v1.0/price/<ticker>")
def getstockprice(ticker):
   stockdata = retrieve_data_from_neon(ticker)
   print(type(stockdata))
   return jsonify(stockdata)
   # session = Session(engine)
    
    #result = session.query(func.min(Measurement.tobs).label('min_temp'), func.max(Measurement.tobs).label('max_temp'),\
                        #    func.avg(Measurement.tobs).label('avg_temp')).filter(Measurement.date >= start).all()
    #session.close()
    #try:
       # jdata = {'min_temp': result[0][0], 'max_temp': result[0][1], 'avg_temp':round(result[0][2],2)}
    # throws error message if invalid date is given
    #except:
    #     return f"Invalid data found"
    # return jsonify(jdata)



if __name__== '__main__':
    # app.run(debug=True)
    app.run(port=5000)

