// Requiring the module
const reader = require('xlsx')
const fs = require("fs")
  
// Reading our test file
const file = reader.readFile('./data.xlsx')

const op = reader.utils.sheet_to_json(file.Sheets["Drugs"])

const toCamelCase = (key)=>{
    return key.split(" ").join("_").toLocaleLowerCase()
}
const final = op.map((e,i)=>{
    const ob = {}
    Object.keys(e).forEach(key=>{
        ob[toCamelCase(key)] = e[key]
    })
    ob.id = 1001+i
    return ob
})
fs.writeFileSync("data.json",JSON.stringify(final))
// console.log(op.map(e=>e["Medicine Name"]))