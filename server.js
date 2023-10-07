const express = require('express')
const app = express()

app.get("/api", (req, res) => {
    res.json({})
})

app.listen(8080, () => {
    console.log("Server listening on port 8080")
})