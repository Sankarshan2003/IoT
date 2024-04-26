const express = require('express');
const bodyParser = require('body-parser');
const mqtt = require('mqtt')
const host = 'mqtt-dashboard.com';
const clientId =`clientId-xJg88WT1TJ`
const protocol = 'mqtt';
const mport = '8884';
const connectUrl = `${protocol}://${host}`
const app = express();
const port = 3000;
const mysql = require('mysql2');
app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false })); 
app.use(bodyParser.json());
topic = 'SankyIOT/Weather';
let datacount=0;

const conn = mysql.createConnection({
    user: 'root',
    port: 3306,
    password: 'sanky10092003',
    database: 'IOT',
    authPlugins: {
      'ssh-key-auth': function ({ password }) {
        return function (pluginData) {
          return getPrivate(key)
            .then((key) => {
              const response = encrypt(key, password, pluginData);
              // continue handshake by sending response data
              return response;
            })
            .catch((err) => {
              // throw error to propagate error to connect/changeUser handlers
            });
        };
      },
    },
  });
conn.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('Connected');
});
function get() {
    return new Promise((resolve, reject) => {
        conn.query('SELECT * FROM Weather', (err, results) => {
            if (err) {
                return reject(err);
            }
            return resolve(results);
        });
    });
}
async function getQuery(){
    const res = await get();
    return res
}
//HTTP
app.get('/', (req, res) => {
    res.render('home.ejs');
})
app.get('/get', (req, res) => {
    getQuery().then((result) => {
        res.send(result);
    });
});
app.post('/publish', (req, res) => {
    console.log(req.body);
    let {SerialNo,Timestamp,Temperature,Humidity,latitude,longitude} = req.body;
    
    Timestamp = Timestamp.replace('T',' ');
    conn.query(
        'INSERT INTO Weather (SerialNo,times,temp,humidity,lat,lon) VALUES (?,STR_TO_DATE(?, "%Y-%m-%d %H:%i:%s"),?,?,?,?)',
        [SerialNo,Timestamp,Temperature,Humidity,latitude,longitude],
        (err, result) => {
            if (err) throw err;
            console.log('Values inserted');
        }
    );
    res.send('Published');
});
app.get('/delete', (req, res) => {
    conn.query(
        'DELETE FROM Weather',
        (err, result) => {
            if (err) throw err;
            console.log('Values deleted');
        }
    );
    res.send('Deleted');
});
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

// MQTT
const client = mqtt.connect(connectUrl)
//console.log(client)
client.on('connect', () => {
    console.log('Connecteddddd')
    client.subscribe([topic], () => {
        console.log(`Subscribe to topic '${topic}'`)
      })
  })
client.on('message', (topic, payload) => {
    const str = payload.toString();
    const json = JSON.parse(str);
    const json2 = JSON.parse(json);
    datacount++;
    console.log('Received Message:', topic, json2)
    console.log(typeof(json2));
    let {SerialNo,Timestamp,Temperature,Humidity,latitude,longitude} = json2;
    console.log(SerialNo,Timestamp,Temperature,Humidity,latitude,longitude);
    Timestamp = Timestamp.replace('T',' ');
    if(datacount>1){
    conn.query(
        'INSERT INTO Weather (SerialNo,times,temp,humidity,lat,lon) VALUES (?,STR_TO_DATE(?, "%Y-%m-%d %H:%i:%s"),?,?,?,?)',
        [SerialNo,Timestamp,Temperature,Humidity,latitude,longitude],
        (err, result) => {
            if (err) throw err;
            console.log('Values inserted');
        }
    );
}
    

  })
client.on('error', (err) => {
    console.error('Connection error:', err);
});