
 async function get(){
    let res = await axios.get('http://localhost:3000/get')
    console.log(res.data)
    let temp = res.data.map(row => row.temp)
    let hum = res.data.map(row => row.humidity);
    let time = res.data.map(row => row.times.split('T')[1]);
    //console.log(temp)
    //console.log(hum)
    //console.log(time)
    let avgTemp = temp.reduce((a,b)=>a+b,0)/temp.length;
    let avgHum = hum.reduce((a,b)=>a+b,0)/hum.length;
    new Chart(
        document.getElementById('temp'),
        {
          type:'line',
          data:{
            labels:time,
            datasets:[
              {
                label:`Temperature , Average Temparature ${avgTemp.toFixed(2)}`,
                data:temp,
                backgroundColor: 'rgba(255, 0, 0, 0.9)',
                borderColor: 'rgba(255, 0, 0, 0.9)',
                borderWidth: 1
              }
            ]
          }
        }
    )
    new Chart(
      document.getElementById(`humidity`),
      {
        type:'line',
        data:{
          labels:time,
          datasets:[
            {
              label:`Humidity Average Humidity ${avgHum.toFixed(2)}`,
              data:hum,
              backgroundColor: 'rgba(0, 255, 0, 0.9)',
              borderColor: 'rgba(0, 255, 0, 0.9)',
              borderWidth: 1
            }
          ]
        }
      }
    )
    let tstd = math.std(temp);
    let hstd = math.std(hum);
    let nort = temp.map((x) => (x-avgTemp)/tstd);
    let norh = hum.map((x) => (x-avgHum)/hstd);
    let cv = math.variance(nort,norh);
    let cvm = [[1,cv],[cv,1]];
    let {values,vectors} = math.eigs(cvm);
    let pc1 = values[0]/(values[0]+values[1])*100;
    let pc2 = values[1]/(values[0]+values[1])*100;
    console.log(pc1);
    console.log(pc2);
    console.log(cvm);
    console.log(values);
    console.log(vectors);
    let pc1v = vectors[0];
    let pc2v = vectors[1];
    let proj =[]
    for(let i=0;i<nort.length;i++){
      let y = nort[i]*pc1v[0]+norh[i]*pc1v[1];
      let x = nort[i]*pc2v[0]+norh[i]*pc2v[1];
       proj.push({x:x,y:y});
    }
    let tvh = [];
for(let i = 0; i < temp.length; i++) {
    tvh.push({x: temp[i], y: hum[i]});
}
new Chart(
  document.getElementById('pca'),{
    type:'bar',
    data:{
      labels:[['PCA1'],['PCA2']],
      datasets:[
        {
          label:'PCA1',
          data: [pc1],
          backgroundColor:'rgba(0, 0, 255, 0.5)',
          borderColor:'rgba(0, 0, 255, 0.5)',
          borderWidth:1
        },
        {
          label:'PCA2',
          data: [0,pc2],
          backgroundColor:'rgba(0, 255, 0, 0.5)',
          borderColor:'rgba(0, 255, 0, 0.5)',
          borderWidth:1
        }
      ]
    }
    ,
    options:{
      scales:{
        x:{
          position:'bottom',
          beginAtZero:true,
          title:{
            display:true,
            text:'Principal Components'
          }
      },
        y:{
          position:'left',
          beginAtZero:true,
          title:{
            display:true,
            text:'Percentage'
          }
        }
        
    }
    
  }
  }
);

new Chart(
    document.getElementById('tvh'),
    {
        type: 'scatter',
        data: {
            datasets: [
                {
                    label: "PCA1 vs PCA2",
                    data: proj,
                    backgroundColor: 'rgba(0, 123, 255, 0.5)',
                    borderColor: 'rgba(0, 123, 255, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            scales: {
                x: {
                    type: 'linear',
                    position: 'bottom',
                    title: {
                        display: true,
                        text: 'PCA1'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'PCA2'
                    }
                }
            },
        }
    }
);

 }
 get();