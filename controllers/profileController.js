require("dotenv").config()
const axios = require('axios')
const Profile = require('../models/Profile')

const createProfile = async ( req, res) => {
try {
const name = req.body.name
if(!name){
    return res.status(400).json({
        status: "error",
        message:"missing name or parameter"
        
    })
}

if (typeof name != 'string'){
    return res.status(422).json({ status: "error", message: "Name must be a string" })
}

const existing = await Profile.findOne({ name: name.toLowerCase() })
if (existing) {
    return res.status(200).json({ status: "success", message: "Profile already exists", data: existing })
}

const [genderRes, ageRes, nationalityRes] = await Promise.all([
    axios.get(`https://api.genderize.io?name=${name}`),
    axios.get(`https://api.agify.io?name=${name}`),
    axios.get(`https://api.nationalize.io?name=${name}`)
])

const genderData = genderRes.data
const ageData = ageRes.data
const nationalityData = nationalityRes.data

if (!genderData.gender || genderData.count == 0) {
    return res.status(502).json({ status: "error", message: "Genderize returned an invalid response" })
}

if(!ageData.age) {
    return res.status(502).json({ status: "error", message: "Agify returned an invalid response" })
}

if (!nationalityData.country || nationalityData.country.length == 0) {
    return res.status(502).json({ status: "error", message: "Nationalize returned an invalid response"})
}

const age = ageData.age
let age_group
if (age <= 12) age_group = 'child'
else if (age <= 19) age_group = 'teenager'
else if (age <= 59) age_group = 'adult'
else age_group = 'senior'

const topCountry = nationalityData.country.sort((a, b) => b.probability - a.probability)[0]

const profile = new Profile({
    name: name.toLowerCase(),
    gender: genderData.gender,
    gender_probability: genderData.probability,
    sample_size: genderData.count,
    age: ageData.age,
    age_group,
    country_id: topCountry.country_id,
    country_probability: topCountry.probability,
    created_at: new Date()
})

await profile.save()

return res.status(201).json({ status: "success", data: profile })

} catch(err) {
    return res.status(500).json({ status: "error", message: "Server error" })
}
}

const getAllProfiles = async  (req, res) => {
    try {
    const filter = {}
    if (req.query.gender) filter.gender = req.query.gender.toLowerCase()
    if (req.query.country_id) filter.country_id = req.query.country_id
    if(req.query.age_group) filter.age_group = req.query.age_group.toLowerCase()

        const profiles = await Profile.find(filter)
        return res.status(200).json({ status: "success", count: profiles.length, data: profiles })
    } catch (err){
        return res.status(500).json({ status: "error", message: "Server error" })
    }
}

const getSingleProfile = async (req, res) => {
    try{
        const profile = await Profile.findById(req.params.id)
        if (!profile) return res.status(404).json({ status: "error", message: "Profile not found" })
            return res.status(200).json({ status: "success", data: profile })
    } catch (err) {
        return res.status(500).json({ status: "error", message: "Server error" })
    }
}

const deleteProfile = async (req, res) => {
    try{
        const profile = await Profile.findByIdAndDelete(req.params.id)
        if (!profile) return res.status(404).json({ status: "error", message: "Profile not found" })
            return res.status(204).send()
    } catch (err) {
        return res.status(500).json({ status: "error", message: "Server error" })
    }
}

module.exports = { createProfile, getAllProfiles, getSingleProfile, deleteProfile }

