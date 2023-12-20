import sqlalchemy
from flask import Flask, jsonify
from sqlalchemy import create_engine, func, desc, and_
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy.ext.automap import automap_base
from flask_sqlalchemy import SQLAlchemy
import psycopg2
from flask_cors import CORS
import json


app = Flask(__name__)
CORS(app)
app.config["SQLALCHEMY_DATABASE_URI" ] = "postgresql://ep-polished-king-27948361.ap-southeast-1.aws.neon.tech:5432/main"

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
        f"/api/v1.0/price/<ticker><br/>"
        f"/api/v1.0/stockinfo<br/>"        
    )
#Will add  the index later 

# return stocklist.json
@app.route("/api/v1.0/stockinfo")
def getstockinfo():
    with open('./data/stocklist.json') as f:
        data = json.load(f)
    return jsonify(data)
   
@app.route("/api/v1.0/price/<ticker>")
def getstockprice(ticker):
   stockdata = retrieve_data_from_neon(ticker)
   print(type(stockdata))
   return jsonify(stockdata)
   



if __name__== '__main__':
    # app.run(debug=True)
    app.run(port=5000)

