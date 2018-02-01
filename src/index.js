

/************************************************
  consts, vars, configs etc...
************************************************/

//create the images container object
const images = (function(imgArray) {  
  var tmp = {}
  imgArray.forEach( e => {
    tmp[e] = new Image()
    tmp[e].src = `img/${e}.png`
  })
  return tmp
})(['unknown', 'clear', 'explosion', 'mine'])

const showTileNumbering = false
const showClickDetails = true

const canvas = document.createElement('canvas')
canvas.width=canvas.height=512
canvas.style = 'border:1px solid #333'

const ctx = canvas.getContext('2d')

var container = document.querySelector('#container')
container.style.position = `absolute`

//to position the canvas in the center
const left = (canvas.width - canvas.width/2).toString() + 'px'
container.style.left = `calc(50% - ${left})`

container.append(canvas)

const rowsAndCols = 16 //how many rows, and columns, so here 16x16
const tileSize = canvas.width / rowsAndCols 

let tileArray = null


/************************************************
  the main interactive part where clicks are handled
************************************************/

canvas.addEventListener('click', function(e) {
  if(showClickDetails)
    getClickDetails(e)

  var index = getClickedTileIndex(e)
  var state = tileArray[index].state
  var type = tileArray[index].type

  // console.log('before: ', tileArray[index]);

  if( (state === 'unknown') && (type === 'clear') ) {
    tileArray[index].state='clear'
  }

  if( (state === 'unknown') && (type === 'mine') ) {
    tileArray[index].state='mine'
  }

  // console.log('after: ', tileArray[index]);
  // console.log('state: ',state, 'type:', type);

  drawTiles()
})


/************************************************
  functions
************************************************/

createTiles = () => {

  // fill a tmp arr with objects holding props of each tile
  var tmpArr = new Array(tileSize * tileSize).fill(0).map( ()=>{
    var tmpObj = {}

    tmpObj.state = 'unknown'

    if(Math.random() < .2)
      tmpObj.type = 'mine'
    else
      tmpObj.type = 'clear'

    tmpObj.total = 0

    return tmpObj
  })

  // calculate the number of mines each clear is touching
  tmpArr = tmpArr.map( (e,i) => {

    if(e.type === 'mine') return e

    var [row,col] = get2DCoordsFromIndex(i)

    var total = 0

    if(col > 0) //then this is not on the left side
      total = tmpArr[i - 1].type === 'mine' ? total + 1 : total

    if(col < rowsAndCols - 1)// //then this is not on the right side
      total = tmpArr[i + 1].type === 'mine' ? total + 1 : total      
    
    if(row > 0) //then its not a top row, so check above tile
      total = tmpArr[i - rowsAndCols].type === 'mine' ? total + 1 : total      
    
    if(row < rowsAndCols -1) //then its not a bottom row, to check below tile
      total = tmpArr[i + rowsAndCols].type === 'mine' ? total + 1 : total      
   
    if( (row > 0) && (col > 0) ) //then get top left
      total = tmpArr[i - rowsAndCols - 1].type === 'mine' ? total + 1 : total      
   
    if( (row > 0 ) && (col < rowsAndCols - 1 ) ) //then get top right
      total = tmpArr[i - rowsAndCols + 1].type === 'mine' ? total + 1 : total       
   
    if( (row < rowsAndCols -1) && (col > 0) ) //then get bottom left
      total = tmpArr[i + rowsAndCols - 1].type === 'mine' ? total + 1 : total    

    if( (row < rowsAndCols -1) && (col < rowsAndCols - 1) ) //then get bottom right
      total = tmpArr[i + rowsAndCols + 1].type === 'mine' ? total + 1 : total    

    e.total = total

    return e
  })

  return tmpArr
}

getClickDetails = e => {
  console.log("canvas x,y coords: ", e.offsetX, e.offsetY);
  console.log("index: ", getClickedTileIndex(e));
  console.log("[row, col]: ", get2DCoordsFromIndex(getClickedTileIndex(e)));
  console.log(tileArray[ getClickedTileIndex(e) ])
}

drawTiles = () => {

  ctx.fillStyle = 'black'
  ctx.fillRect(0,0,canvas.width, canvas.height)

  tileArray.forEach( (e,i) => {
     
    var [y,x] = get2DCoordsFromIndex(i)
    
    ctx.drawImage(images[e.state], tileSize * x, tileSize * y ,tileSize, tileSize)

    var [total, state] = [tileArray[i].total, tileArray[i].state]

    if( (total > 0) && (state !== 'unknown') ) { //then its a cleared tile touching a mine, display text saying how many
      drawText(tileSize * x + 10, tileSize * y + 21, text=total, color='red', size='20')
    }

    if(showTileNumbering)
      drawText(tileSize * x + 7, tileSize * y + 19, i)

  })

}

drawText = (x, y, text='', color='green', size='12') => {
  ctx.fillStyle=color
  ctx.font = `${size}px seriff`
  ctx.fillText(text.toString(), x, y)  
}

// pass in an index into tileArray[]
// return [row,col]
get2DCoordsFromIndex = (i) => {
  return [Math.floor(i/rowsAndCols), i%rowsAndCols] 
}

// pass in a click event
// return which index in tileArray[] was clicked
getClickedTileIndex = (e) => {
  let col = Math.floor((e.offsetX%canvas.width)/tileSize)
  let row = Math.floor((e.offsetY%canvas.height)/tileSize)

  return index = row * (canvas.width/tileSize) + col
}

restart = () => {
  tileArray = createTiles()
  drawTiles()
}

/************************************************
  kick it off
************************************************/

(function(){
  restart()
})()