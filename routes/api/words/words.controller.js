const data = require("./data.json")
const db = require("../../../db")

const getValues = (ob,format)=>{
    const properties = format.split(",").map(e=>e.trim())
    const data = {}
    for(let property of properties){
        data[property] = ob[property]
    }
    return data
}

exports.list = async (req, res) => {
    // console.log(req.decodedt)
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const start = (page-1)*limit
    const end = start + limit
    const final = data.slice(start,end).map(e=>getValues(e,"medicine_name, mrp, id"))
    const audios = await new Promise((resolve)=>{
        db.audios.findOne({username:req.decoded.username},(err,docs)=>{
            resolve(docs)
        })
    })
    const withAudio = final.map(e=>{
        e.audio = audios[e.id] ? `${req.protocol}://${req.get("host")}${audios[e.id]}` : undefined
        return e
    })
    res.json({
        page,
        limit,
        data:withAudio,
        total:data.length
    })
}

exports.upload = async function (req, res, next) {
    const pid = req.params.pid
    const validFormats = {"audio/wave":'.wav',"audio/mpeg":'.mp3'}
    if(!(req.file.mimetype in validFormats)){
        return res.json({success:false,message:`The file should be of formats - ${Object.values(validFormats)}`})
    }
    console.log("FILE",req.file)
    const [min,max] = [data[0].id,data[data.length-1].id]
    if(pid<min || pid >max ){
        return res.json({success:false,message:`Invalid Product Id. It should be between ${min} - ${max}`})
    }
    if(!req.file){
        return res.json({success:false,message:'No file found'})
    }
    const username = req.decoded.username
    try {
        db.audios.update({username}, { $set: { [pid]: `/uploads/${req.file.filename}` } })
        db.audios.findOne({ username }, (err,docs)=>{
            console.log(docs)
        })
    } catch (err) {
        next(err)
    } finally {
        res.json({ uploaded: true })
    }
}